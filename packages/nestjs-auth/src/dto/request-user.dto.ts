import { createParamDecorator } from '@nestjs/common';
import { AuthUser } from './authUser.interface';

export const GetUser = createParamDecorator(
  (data, req): AuthUser => {
    return req.user;
  },
);
