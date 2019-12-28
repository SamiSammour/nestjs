import { dirname, join } from 'path';
import { Module } from '@nestjs/common';
import { AccessControlModule, RolesBuilder } from 'nest-access-control';
import { DatabaseModule } from '@alphaapps/nestjs-db';
import { ConfigModule } from '@alphaapps/nestjs-config';
import { UserModule } from './users/user.module';
import schema from './defaults/configSchema';
import { AuthModule } from '@alphaapps/nestjs-auth';
import User from './users/user.model';

@Module({
  imports: [
    ConfigModule.register({ schema }),
    DatabaseModule.register({ modelsDir: [join(dirname(require.main.filename), './**/*.model.ts')] }),
    AccessControlModule.forRoles(new RolesBuilder()),
    UserModule,
    AuthModule.register({
      userModel: User,
      expiresIn: 0,
      oneSessionPerAccount: false,
      loginMethods: [{
        loginField: 'email',
        passwordField: 'password'
      }, {
        loginField: 'phoneNumber',
        passwordField: 'pin'
      }]
    }),
  ],
})
export class AppModule {}
