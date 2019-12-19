import { DatabaseModule, AlphaModel } from '@alphaapps/nestjs-db';
import { Module } from '@nestjs/common';

import { LogsModule } from './logs.module';
import { LogGroup, LogMessage } from '..';

@Module({
  imports: [
    DatabaseModule.register({
      modelsDir: [AlphaModel, LogGroup, LogMessage]
    }),
    LogsModule
  ]
})
export class LogsAppModule {}
