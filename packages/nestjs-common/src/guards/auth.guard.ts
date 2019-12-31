import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import config from 'config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard<User extends any = any> implements CanActivate {
  constructor(
    private jwtService: JwtService,
  ) {}
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization =  request.headers.authorization;
    const token = authorization.split(' ')[1];
    if (!authorization || !token) {
      return false;
    }
    try {
      request.user = this.jwtService.verify(token, config.JWT_SECRET);
      return true;
    } catch (e) {
      return false;
    }
  }
}
