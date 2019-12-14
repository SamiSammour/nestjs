import { DatabaseModule, AlphaModel } from '@alphaapps/nestjs-db';
import { AccessControlModule, RolesBuilder } from 'nest-access-control';
import { Module } from '@nestjs/common';

import { LogsModule } from './logs.module';
import { LogGroup, LogMessage } from '../';

@Module({
  imports: [
    AccessControlModule.forRoles(new RolesBuilder()),
    DatabaseModule.register({
      modelsDir: [AlphaModel, LogGroup, LogMessage]
    }),
    LogsModule
  ]
})
export class LogsAppModule {}
