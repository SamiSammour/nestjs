import { AlphaModel } from '@alphaapps/nestjs-db';
import { Column, IsEmail, Table, Unique } from 'sequelize-typescript';

@Table
export default class User extends AlphaModel<User> {
  @Unique
  @IsEmail
  @Column
  email: string;

  @Column
  password: string;

  @Column
  tokenIssuedAt: Date;

  @Column
  isActive: boolean;
}
