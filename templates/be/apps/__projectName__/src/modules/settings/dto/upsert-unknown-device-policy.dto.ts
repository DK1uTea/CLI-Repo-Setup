import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumberString, IsString, Length } from 'class-validator';

export class UpsertUnknownDevicePolicyDto {
  @ApiProperty({
    example: ['359587089876543', '123456789012345'],
    description: 'List of whitelisted device IMEIs',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @Length(15, 15, { each: true })
  @IsNumberString({}, { each: true })
  imeis: string[];
}
