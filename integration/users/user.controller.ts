import { Controller } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import User from './user.model';
import { UserService } from './user.service';
import { AclCrudController } from '@alphaapps/nestjs-common';

@Crud({
  model: {
    type: User,
  },
  validation: false,
})
@Controller('users')
export class UserController implements CrudController<User> {
  constructor(public service: UserService) {
    // super();
  }
}
