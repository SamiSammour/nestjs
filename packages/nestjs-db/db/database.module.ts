import { Module, DynamicModule, UnprocessableEntityException } from '@nestjs/common';
import { createDatabaseProvider } from './database.providers';

@Module({})
// @ts-ignore
export class DatabaseModule {
  static register(options): DynamicModule {
    if (!options.modelsDir) {
      throw new UnprocessableEntityException();
    }
    const databaseProviders = createDatabaseProvider(options.modelsDir);
    return {
      module: DatabaseModule,
      providers: [...databaseProviders],
      exports: [...databaseProviders],
    }
  }
}
