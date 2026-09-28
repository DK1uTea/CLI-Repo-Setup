import { Module } from '@nestjs/common';
import { SessionRegistry } from './session-registry';

@Module({
  providers: [SessionRegistry],
  exports: [SessionRegistry],
})
export class SessionModule {}
