import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRolesBuilder, RolesBuilder } from 'nest-access-control';
import { getFeature, getAction } from '@nestjsx/crud';

const actionToGrantMap = {
  'Read-All': 'read',
  'Read-One': 'read',
  'Create-One': 'create',
  'Create-Many': 'create',
  'Update-One': 'update',
  'Replace-One': 'update',
  'Delete-One': 'delete'
};

@Injectable()
export class ACGuard<User extends any = any> implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRolesBuilder() private readonly roleBuilder: RolesBuilder,
  ) {}

  protected getUser(context: ExecutionContext): User {
    const request = context.switchToHttp().getRequest();
    return request.user;
  }

  protected getUserRoles(context: ExecutionContext): string | string[] {
    const user = this.getUser(context);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user.roles;
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const resource = getFeature(context.getClass());
    const action = getAction(context.getHandler());
    const baseAction = actionToGrantMap[action];
    if (!resource) {
      throw new InternalServerErrorException();
    }

    const userRoles = this.getUserRoles(context);
    let permission = this.roleBuilder.can(userRoles)[`${baseAction}Any`](resource);
    if (!permission.granted) {
      permission = this.roleBuilder.can(userRoles)[`${baseAction}Own`](resource);
      if (permission.granted) {
        context.switchToHttp().getRequest().isOwnerPermission = true;
      }
    }
    return permission.granted;
    // const hasRoles = roles.some(role => {
    //   const queryInfo: IQueryInfo = role;
    //   queryInfo.role = userRoles;
    //   const permission = this.roleBuilder.permission(queryInfo);
    //   if (permission.granted) {
    //     if (!granted) {
    //       granted = queryInfo;
    //     } else if (queryInfo.possession === 'any' && granted.possession === 'own') {
    //       granted = queryInfo;
    //     }
    //   }
    //   return permission.granted;
    // });
    // const request = context.switchToHttp().getRequest();
    // if (granted && granted.possession === 'own') {
    //   const owner = this.reflector.get<string>('ownerRelation', context.getClass());
    //   if (!owner) {
    //     throw new InternalServerErrorException(`Missing owner decorator for ${context.getClass().name}`);
    //   }
    //   if (request.method === 'GET' || request.method === 'DELETE') {
    //     if (request.query.filter) {
    //       if (Array.isArray(request.query.filter)) {
    //         request.query.filter.push(`${owner}||eq||${request.user.id}`);
    //       } else {
    //         request.query.filter = [ request.query.filter, `${owner}||eq||${request.user.id}`]
    //       }
    //     } else {
    //       request.query.filter =  `${owner}||eq||${request.user.id}`;
    //     }
    //   } else if (request.method === 'PUT' || request.method === 'PATCH') {
    //     if (request.query.filter) {
    //       if (Array.isArray(request.query.filter)) {
    //         request.query.filter.push(`${owner}||eq||${request.user.id}`);
    //       } else {
    //         request.query.filter = [ request.query.filter, `${owner}||eq||${request.user.id}`]
    //       }
    //     } else {
    //       request.query.filter =  `${owner}||eq||${request.user.id}`;
    //     }
    //     request.body[owner] = request.user.id;
    //   } else {
    //     request.body[owner] = request.user.id;
    //   }
    //
    // }

    // return hasRoles;
  }
}
