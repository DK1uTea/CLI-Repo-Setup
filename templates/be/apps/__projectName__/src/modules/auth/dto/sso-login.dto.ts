import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SsoLoginDto {
  @ApiProperty({
    description: 'Microsoft Entra ID token obtained by the frontend via MSAL',
    example: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ii4uLiJ9.example.payload.signature',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
