import { ApiSuccessResponse, Public, Serialize, User } from '@app/core';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, LogoutDto, RefreshDto, SsoLoginDto } from './dto';
import {
  LoginResponseDto,
  LogoutResponseDto,
  MeResponseDto,
  RefreshResponseDto,
} from './responses';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @Serialize(LoginResponseDto)
  @ApiOperation({ summary: 'Login with email and password', security: [] })
  @ApiSuccessResponse(LoginResponseDto, 'Login successful')
  login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('sso/microsoft')
  @Public()
  @Serialize(LoginResponseDto)
  @ApiOperation({
    summary: 'Login or self-register with a Microsoft Entra ID token',
    security: [],
  })
  @ApiSuccessResponse(LoginResponseDto, 'SSO login successful')
  loginWithMicrosoft(@Body() ssoLoginDto: SsoLoginDto): Promise<LoginResponseDto> {
    return this.authService.loginWithMicrosoft(ssoLoginDto);
  }

  @Post('refresh')
  @Public()
  @Serialize(RefreshResponseDto)
  @ApiOperation({
    summary: 'Refresh access token using refresh token',
    security: [],
  })
  @ApiSuccessResponse(RefreshResponseDto, 'Token refreshed successfully')
  refresh(@Body() refreshDto: RefreshDto): Promise<RefreshResponseDto> {
    return this.authService.refresh(refreshDto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  @ApiOkResponse({ description: 'Logged out successfully' })
  @ApiSuccessResponse(LogoutResponseDto, 'Logged out successfully')
  async logout(
    @User('sub') userId: string,
    @Body() logoutDto: LogoutDto,
  ): Promise<LogoutResponseDto> {
    return await this.authService.logout(userId, logoutDto.refreshToken);
  }

  @Get('me')
  @Serialize(MeResponseDto)
  @ApiOperation({ summary: 'Get current user profile from access token' })
  @ApiSuccessResponse(MeResponseDto)
  me(@User('sub') userId: string): Promise<MeResponseDto> {
    return this.authService.getMeByUserId(userId);
  }
}
