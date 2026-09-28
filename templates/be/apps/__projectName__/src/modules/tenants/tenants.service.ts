import { type ITenantsRepository, TENANTS_REPOSITORY } from '@app/layer-data';
import { Inject, Injectable } from '@nestjs/common';
import { TenantItemResponseDto } from './responses';

@Injectable()
export class TenantsService {
  constructor(
    @Inject(TENANTS_REPOSITORY)
    private readonly tenantsRepository: ITenantsRepository,
  ) {}

  list(): Promise<TenantItemResponseDto[]> {
    return this.tenantsRepository.list();
  }
}
