import { Module, DynamicModule } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigOptionsInterface } from './config-options.interface';

@Module({})
export class ConfigModule {
  static register(option?: ConfigOptionsInterface): DynamicModule {
    return {
      module: ConfigModule,
      providers: [{
        provide: 'CONFIG_OPTIONS',
        useValue: option
      },
      {
        provide: ConfigService,
        useValue: new ConfigService(option)
      }],
      exports: [ConfigService]
    };
  }
}
