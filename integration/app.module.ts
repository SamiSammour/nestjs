import { Module } from '@nestjs/common';
import { DatabaseModule } from '@alphaapps/nestjs-db';
import { UserModule } from './users/user.module';
import {dirname, join} from 'path';

@Module({
  imports: [
    DatabaseModule.register({ modelsDir: [join(dirname(require.main.filename), './**/*.model.ts')] }),
    UserModule
  ],
})
export class AppModule {}
