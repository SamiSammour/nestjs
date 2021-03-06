import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { DynamicModule, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../jwt/jwt.strategy';
import AuthOptions from '../dto/authOptions.dto';
import { AuthService } from './auth.service';
import config from 'config';


@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' })
  ]
})
export class AuthModule {
  static register(options: AuthOptions): DynamicModule {
    const jwtSettings: JwtModuleOptions = {
      secret: config.get('JWT.secretKey'),
      signOptions: {
        noTimestamp: options.expiresIn === 0
      }
    };
    if (options.expiresIn) {
      jwtSettings.signOptions.expiresIn = options.expiresIn;
    }
    return {
      module: AuthModule,
      imports: [JwtModule.register(jwtSettings)],
      providers: [{
        provide: 'AuthOptions',
        useValue: options
      }, {
        provide: 'AuthUserRepo',
        useValue: options.userModel
      }, AuthService, JwtStrategy],
      exports: [JwtStrategy, PassportModule, AuthService],
      controllers: [AuthController],
    };
  }
}
