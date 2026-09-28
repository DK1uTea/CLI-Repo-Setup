import { PagingDto } from '@app/core';
import { OmitType } from '@nestjs/swagger';

export class ListLatestPositionsDto extends OmitType(PagingDto, ['keyword'] as const) {}
