import { Inject, Injectable } from '@nestjs/common';
import { SequelizeCrudService } from '@alphaapps/nestjs-db';
import User from './user.model';

@Injectable()
export class UserService extends SequelizeCrudService<User> {
  constructor(
    @Inject('UsersRepository')
    private readonly usersRepository: User & typeof User,
  ) {
    super(usersRepository);
  }
}
