import { Model } from 'sequelize-typescript';
import { AuthUser } from './authUser.interface';

export default interface AuthOptions {
  userModel: typeof AuthUser;
  loginField: 'email' | 'phoneNumber';
  expiresIn: number;
  oneSessionPerAccount: boolean;
}
