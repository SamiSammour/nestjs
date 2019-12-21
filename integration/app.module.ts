import { dirname, join } from 'path';
import { Module } from '@nestjs/common';
import { AccessControlModule, RolesBuilder } from 'nest-access-control';
import { DatabaseModule } from '@alphaapps/nestjs-db';
import { ConfigModule } from '@alphaapps/nestjs-config';
import { UserModule } from './users/user.module';
import schema from './defaults/configSchema';

@Module({
  imports: [
    ConfigModule.register({ schema }),
    DatabaseModule.register({ modelsDir: [join(dirname(require.main.filename), './**/*.model.ts')] }),
    AccessControlModule.forRoles(new RolesBuilder()),
    UserModule
  ],
})
export class AppModule {}
