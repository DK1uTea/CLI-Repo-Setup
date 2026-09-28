import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class LogoutDto {
  @ApiPropertyOptional({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh.token',
    description:
      'Optional refresh token to revoke. If not provided, only profile cache is cleared.',
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
