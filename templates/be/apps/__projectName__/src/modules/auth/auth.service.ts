import { randomUUID } from 'node:crypto';

import {
  Api401HttpError,
  Api403HttpError,
  type AuthUser,
  appConfiguration,
  awsConfiguration,
  resolveS3Url,
} from '@app/core';
import {
  type IUsersRepository,
  USERS_REPOSITORY,
  type UserCredentialRow,
  type UserProfileRow,
} from '@app/layer-data';
import { CACHE_KEYS, CacheService } from '@app/third-party';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserApprovalStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { AUTH_ERROR_CODES } from './constants/auth.error-codes';
import { LoginDto, RefreshDto, SsoLoginDto } from './dto';
import { RefreshToken, StoredRefreshToken } from './interfaces';
import { type EntraIdentity, MicrosoftTokenService } from './microsoft-token.service';
import {
  LoginResponseDto,
  LogoutResponseDto,
  MeResponseDto,
  RefreshResponseDto,
} from './responses';

@Injectable()
export class AuthService {
  private readonly refreshTokenTtlSeconds: number;

  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
    private readonly jwtService: JwtService,
    private readonly cacheService: CacheService,
    private readonly microsoftTokenService: MicrosoftTokenService,
    @Inject(appConfiguration.KEY)
    private readonly appConfig: ReturnType<typeof appConfiguration>,
    @Inject(awsConfiguration.KEY)
    private readonly awsConfig: ReturnType<typeof awsConfiguration>,
  ) {
    this.refreshTokenTtlSeconds = appConfig.refreshTokenTtlDays * 24 * 60 * 60;
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.usersRepository.findByEmail(loginDto.email);

    // Entra-only users have no password hash — reject the password flow for them.
    if (!user?.isActive || !user.passwordHash) {
      throw new Api401HttpError(AUTH_ERROR_CODES.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Api401HttpError(AUTH_ERROR_CODES.INVALID_CREDENTIALS);
    }

    this.assertAccessAllowed(user);

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    return tokens;
  }

  /**
   * Exchanges a Microsoft Entra ID token for app tokens.
   * New users are provisioned as PENDING and must be approved by a SUPER_ADMIN.
   */
  async loginWithMicrosoft(dto: SsoLoginDto): Promise<LoginResponseDto> {
    const identity = await this.microsoftTokenService.verify(dto.idToken);

    const tenantId = this.microsoftTokenService.resolveTenantId(identity.tid);
    if (!tenantId) {
      throw new Api403HttpError(AUTH_ERROR_CODES.SSO_TENANT_NOT_ALLOWED);
    }

    const user = await this.resolveEntraUser(identity, tenantId);

    this.assertAccessAllowed(user);

    return this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });
  }

  private async resolveEntraUser(
    identity: EntraIdentity,
    tenantId: string,
  ): Promise<UserCredentialRow> {
    const byOid = await this.usersRepository.findByEntraOid(identity.oid);
    if (byOid) return byOid;

    // Link to an existing account with the same email (e.g. the seeded local admin).
    const byEmail = await this.usersRepository.findByEmail(identity.email);
    if (byEmail) {
      return this.usersRepository.linkEntraIdentity(byEmail.id, {
        entraOid: identity.oid,
        entraTid: identity.tid,
      });
    }

    // Trusted domains (e.g. company.com, partner.org) skip the manual approval gate.
    const approvalStatus = this.microsoftTokenService.isAutoApproveEmail(identity.email)
      ? UserApprovalStatus.APPROVED
      : UserApprovalStatus.PENDING;

    return this.usersRepository.createEntraUser({
      email: identity.email,
      name: identity.name,
      entraOid: identity.oid,
      entraTid: identity.tid,
      tenantId,
      approvalStatus,
    });
  }

  /** Enforces the admin-approval gate. Throws 403 for rejected / not-yet-approved accounts. */
  private assertAccessAllowed(user: Pick<UserCredentialRow, 'approvalStatus' | 'isActive'>): void {
    if (user.approvalStatus === UserApprovalStatus.REJECTED) {
      throw new Api403HttpError(AUTH_ERROR_CODES.ACCOUNT_REJECTED);
    }
    if (user.approvalStatus !== UserApprovalStatus.APPROVED || !user.isActive) {
      throw new Api403HttpError(AUTH_ERROR_CODES.ACCOUNT_PENDING_APPROVAL);
    }
  }

  async refresh(refreshDto: RefreshDto): Promise<RefreshResponseDto> {
    try {
      // Verify the refresh token
      const payload = await this.jwtService.verifyAsync<RefreshToken>(refreshDto.refreshToken, {
        secret: this.appConfig.refreshTokenSecret,
      });

      // Check if refresh token exists in Redis (not revoked)
      const cacheKey = CACHE_KEYS.auth.refreshToken(payload.sub, payload.tokenId);
      const storedToken = await this.cacheService.get<StoredRefreshToken>(cacheKey);

      if (!storedToken) {
        throw new Api401HttpError(AUTH_ERROR_CODES.REFRESH_TOKEN_REVOKED);
      }

      // Verify user is still active
      const user = await this.usersRepository.findById(payload.sub);
      if (!user?.isActive) {
        // Revoke token if user is no longer active
        await this.cacheService.del(cacheKey);
        throw new Api401HttpError(AUTH_ERROR_CODES.USER_INACTIVE);
      }

      // Generate new access token only, keep refresh token
      const accessToken = await this.generateAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      });

      return { accessToken };
    } catch (error) {
      if (error instanceof Api401HttpError) {
        throw error;
      }
      throw new Api401HttpError(AUTH_ERROR_CODES.INVALID_REFRESH_TOKEN);
    }
  }

  async logout(userId: string, refreshToken?: string): Promise<LogoutResponseDto> {
    if (refreshToken) {
      try {
        // Verify and revoke specific refresh token
        const payload = await this.jwtService.verifyAsync<RefreshToken>(refreshToken, {
          secret: this.appConfig.refreshTokenSecret,
        });
        // Only revoke the token if it belongs to the authenticated caller.
        // This ties the revocation to the server-verified userId rather than a
        // client-supplied value alone (defense in depth).
        if (payload.sub === userId) {
          const cacheKey = CACHE_KEYS.auth.refreshToken(payload.sub, payload.tokenId);
          await this.cacheService.del(cacheKey);
        }
      } catch {
        // Token might be invalid/expired, but we still proceed with logout
      }
    }

    // Clear user profile cache
    await this.cacheService.del(CACHE_KEYS.auth.me(userId));
    return {
      success: true,
    };
  }

  async getMeByUserId(userId: string): Promise<MeResponseDto> {
    const user = await this.cacheService.getOrSet<UserProfileRow | null>(
      CACHE_KEYS.auth.me(userId),
      () => this.usersRepository.findById(userId),
    );

    if (!user?.isActive) {
      throw new Api401HttpError(AUTH_ERROR_CODES.USER_INACTIVE);
    }

    return this.withResolvedAvatar(user);
  }

  private async generateAccessToken(payload: Omit<AuthUser, 'iat' | 'exp'>): Promise<string> {
    return await this.jwtService.signAsync(payload as object, {
      secret: this.appConfig.jwtSecret,
      expiresIn: this.appConfig.jwtExpiresIn as any,
    });
  }

  private async generateTokens(
    payload: Omit<AuthUser, 'iat' | 'exp'>,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenId = randomUUID();

    // Generate access token
    const accessToken = await this.generateAccessToken(payload);

    // Generate refresh token with tokenId for revocation tracking
    const refreshTokenPayload: RefreshToken = {
      ...payload,
      tokenId,
    };
    const refreshToken = await this.jwtService.signAsync(refreshTokenPayload as object, {
      secret: this.appConfig.refreshTokenSecret,
      expiresIn: `${this.appConfig.refreshTokenTtlDays}d`,
    });

    // Store refresh token info in Redis for validation/revocation
    const cacheKey = CACHE_KEYS.auth.refreshToken(payload.sub, tokenId);
    const storedToken: StoredRefreshToken = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
    };
    await this.cacheService.set(cacheKey, storedToken, this.refreshTokenTtlSeconds);

    return { accessToken, refreshToken };
  }

  private withResolvedAvatar<T extends { avatar: string | null }>(item: T): T {
    return { ...item, avatar: resolveS3Url(item.avatar, this.awsConfig.s3BaseUrl) };
  }
}
