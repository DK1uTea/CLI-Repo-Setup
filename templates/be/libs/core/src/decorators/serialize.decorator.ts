import { SetMetadata, Type } from '@nestjs/common';

export const SERIALIZE_DTO_KEY = 'serialize:dto';

export const Serialize = <TModel extends Type<unknown>>(
  model: TModel,
): MethodDecorator & ClassDecorator => SetMetadata(SERIALIZE_DTO_KEY, model);
