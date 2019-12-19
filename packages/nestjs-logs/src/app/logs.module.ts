import { Module } from '@nestjs/common';
import { LogGroup, LogMessage, LoggingCommand, ImportLogsCommand } from '..';
import { CommandModule } from 'nestjs-command';
import { DatabaseModule, AlphaModel } from '@alphaapps/nestjs-db';

@Module({
  imports: [
    CommandModule,
    DatabaseModule.register({
      modelsDir: [AlphaModel, LogGroup, LogMessage]
    })
  ],
  providers: [
    LoggingCommand,
    ImportLogsCommand
  ]
})
export class LogsModule {}
