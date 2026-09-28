import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class UpdatePersonalInfoDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com' })
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'uploads/avatars/avatar-abc123.png' })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  avatar?: string;
}
