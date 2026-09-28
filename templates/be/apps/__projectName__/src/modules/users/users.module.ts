import { UsersDataModule } from '@app/layer-data';
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [UsersDataModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
