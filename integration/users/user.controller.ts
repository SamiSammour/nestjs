import { Controller } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import User from './user.model';
import { UserService } from './user.service';
// import { ApiUseTags } from '@nestjs/swagger';

@Crud({
  model: {
    type: User,
  },
  validation: false,
})
// @ApiUseTags('users')
@Controller('users')
export class UserController implements CrudController<User> {
  constructor(public service: UserService) {}
}
