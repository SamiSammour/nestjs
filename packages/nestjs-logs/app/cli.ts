import { CommandModule, CommandService } from "nestjs-command";
import { LogsAppModule } from './logs-app.module';
import { NestFactory } from "@nestjs/core";

(async () => {
  const app = await NestFactory.createApplicationContext(LogsAppModule, { 
    logger: false
  });
  app.select(CommandModule).get(CommandService).exec();
})();