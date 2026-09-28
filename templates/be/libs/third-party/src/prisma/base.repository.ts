import { PrismaService } from './prisma.service';

type AsyncFn = (args: any) => Promise<any>;

type DelegateWithCrud = {
  findUnique: AsyncFn;
  findFirst: AsyncFn;
  findMany: AsyncFn;
  create: AsyncFn;
  update: AsyncFn;
  delete: AsyncFn;
  upsert: AsyncFn;
  count: AsyncFn;
};

export abstract class BaseRepository<TDelegate extends DelegateWithCrud> {
  constructor(protected readonly prisma: PrismaService) {}

  protected abstract get model(): TDelegate;

  protected findUnique<TArgs extends Parameters<TDelegate['findUnique']>[0]>(
    args: TArgs,
  ): Promise<Awaited<ReturnType<TDelegate['findUnique']>>> {
    return this.model.findUnique(args) as Promise<Awaited<ReturnType<TDelegate['findUnique']>>>;
  }

  protected findFirst<TArgs extends Parameters<TDelegate['findFirst']>[0]>(
    args: TArgs,
  ): Promise<Awaited<ReturnType<TDelegate['findFirst']>>> {
    return this.model.findFirst(args) as Promise<Awaited<ReturnType<TDelegate['findFirst']>>>;
  }

  protected findMany<TArgs extends Parameters<TDelegate['findMany']>[0]>(
    args: TArgs,
  ): Promise<Awaited<ReturnType<TDelegate['findMany']>>> {
    return this.model.findMany(args) as Promise<Awaited<ReturnType<TDelegate['findMany']>>>;
  }

  protected create<TArgs extends Parameters<TDelegate['create']>[0]>(
    args: TArgs,
  ): Promise<Awaited<ReturnType<TDelegate['create']>>> {
    return this.model.create(args) as Promise<Awaited<ReturnType<TDelegate['create']>>>;
  }

  protected update<TArgs extends Parameters<TDelegate['update']>[0]>(
    args: TArgs,
  ): Promise<Awaited<ReturnType<TDelegate['update']>>> {
    return this.model.update(args) as Promise<Awaited<ReturnType<TDelegate['update']>>>;
  }

  protected delete<TArgs extends Parameters<TDelegate['delete']>[0]>(
    args: TArgs,
  ): Promise<Awaited<ReturnType<TDelegate['delete']>>> {
    return this.model.delete(args) as Promise<Awaited<ReturnType<TDelegate['delete']>>>;
  }

  protected upsert<TArgs extends Parameters<TDelegate['upsert']>[0]>(
    args: TArgs,
  ): Promise<Awaited<ReturnType<TDelegate['upsert']>>> {
    return this.model.upsert(args) as Promise<Awaited<ReturnType<TDelegate['upsert']>>>;
  }

  protected count<TArgs extends Parameters<TDelegate['count']>[0]>(
    args: TArgs,
  ): Promise<Awaited<ReturnType<TDelegate['count']>>> {
    return this.model.count(args) as Promise<Awaited<ReturnType<TDelegate['count']>>>;
  }

  protected async findPagination<
    TFindManyArgs extends Parameters<TDelegate['findMany']>[0],
    TCountArgs extends Parameters<TDelegate['count']>[0],
  >(
    findManyArgs: TFindManyArgs,
    options: {
      page: number;
      pageSize: number;
      countArgs?: TCountArgs;
    },
  ): Promise<{
    items: Awaited<ReturnType<TDelegate['findMany']>>;
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }> {
    const page = Math.max(1, options.page);
    const limit = Math.max(1, options.pageSize);

    const data = {
      ...(findManyArgs as Record<string, unknown>),
      skip: (page - 1) * limit,
      take: limit,
    } as TFindManyArgs;

    const [items, total] = await Promise.all([
      this.findMany(data),
      this.count(
        options.countArgs ??
          ({
            where: (findManyArgs as { where?: unknown }).where,
          } as TCountArgs),
      ),
    ]);

    return {
      items,
      pagination: {
        page,
        pageSize: limit,
        total: Number(total),
        totalPages: Math.max(1, Math.ceil(Number(total) / limit)),
      },
    };
  }

  protected async exists(where: Record<string, unknown>): Promise<boolean> {
    const total = await this.count({ where } as Parameters<TDelegate['count']>[0]);
    return Number(total) > 0;
  }
}
