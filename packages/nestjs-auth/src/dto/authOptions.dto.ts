import { AuthUser } from './authUser.interface';
import { LoginMethods } from './login-methods.dto'

export default interface AuthOptions {
  userModel: typeof AuthUser;
  expiresIn: number;
  oneSessionPerAccount: boolean;
  loginMethods: Array<LoginMethods>;
}
