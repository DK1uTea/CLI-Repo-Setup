import type { TenantItemEntity } from './tenants.types';

export const TENANTS_REPOSITORY = Symbol('TENANTS_REPOSITORY');

export interface ITenantsRepository {
  list(): Promise<TenantItemEntity[]>;
}

export type { TenantItemEntity };
