import { Type as NestType } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../constants';

@Exclude()
export class PaginationMetaResponseDto {
  @ApiProperty({ example: DEFAULT_PAGE })
  @Expose()
  page: number;

  @ApiProperty({ example: DEFAULT_PAGE_SIZE })
  @Expose()
  pageSize: number;

  @ApiProperty({ example: 100 })
  @Expose()
  total: number;

  @ApiProperty({ example: 10 })
  @Expose()
  totalPages: number;
}

@Exclude()
export class PaginationResponseDto<TItem> {
  @ApiProperty({ isArray: true })
  @Expose()
  items: TItem[];

  @ApiProperty({ type: PaginationMetaResponseDto })
  @Expose()
  @Type(() => PaginationMetaResponseDto)
  pagination: PaginationMetaResponseDto;
}

export const createPaginationResponseDto = <TItem extends NestType<unknown>>(itemDto: TItem) => {
  @Exclude()
  class PaginationResponseWithItemDto extends PaginationResponseDto<InstanceType<TItem>> {
    @ApiProperty({ type: itemDto, isArray: true })
    @Expose()
    @Type(() => itemDto)
    declare items: InstanceType<TItem>[];

    @ApiProperty({ type: PaginationMetaResponseDto })
    @Expose()
    @Type(() => PaginationMetaResponseDto)
    declare pagination: PaginationMetaResponseDto;
  }

  return PaginationResponseWithItemDto;
};
