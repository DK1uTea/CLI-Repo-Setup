import { DevicesDataModule, PositionsDataModule } from '@app/layer-data';
import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';

@Module({
  imports: [DevicesDataModule, PositionsDataModule],
  controllers: [DevicesController],
  providers: [DevicesService],
})
export class DevicesModule {}
