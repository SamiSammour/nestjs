import { UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { ACGuard, ACInterceptor } from '../index';

@UseGuards(AuthGuard, ACGuard)
@UseInterceptors(ACInterceptor)
export abstract class AclCrudController {}
