import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ACInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    if (request.ownerPermission) {
      const owner = this.reflector.get<string>('ownerRelation', context.getClass());
      if (!owner) {
        throw new InternalServerErrorException(`Missing owner decorator for ${context.getClass().name}`);
      }
      if (request.method === 'GET' || request.method === 'DELETE') {
        if (request.query.filter) {
          if (Array.isArray(request.query.filter)) {
            request.query.filter.push(`${owner}||eq||${request.user.id}`);
          } else {
            request.query.filter = [ request.query.filter, `${owner}||eq||${request.user.id}`];
          }
        } else {
          request.query.filter =  `${owner}||eq||${request.user.id}`;
        }
      } else if (request.method === 'PUT' || request.method === 'PATCH') {
        if (request.query.filter) {
          if (Array.isArray(request.query.filter)) {
            request.query.filter.push(`${owner}||eq||${request.user.id}`);
          } else {
            request.query.filter = [ request.query.filter, `${owner}||eq||${request.user.id}`];
          }
        } else {
          request.query.filter =  `${owner}||eq||${request.user.id}`;
        }
        request.body[owner] = request.user.id;
      } else {
        request.body[owner] = request.user.id;
      }
    }
    return next.handle();
  }
}
