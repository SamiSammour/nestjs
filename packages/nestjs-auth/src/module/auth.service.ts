import {Inject, Injectable, UnauthorizedException, UnprocessableEntityException, HttpException, HttpStatus} from '@nestjs/common';
import { RegisterUserDto } from '../dto/register-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { AuthUser } from '../dto/authUser.interface';
import AuthOptions from '../dto/authOptions.dto';
import { JwtService } from '@nestjs/jwt';
import { utils } from '../common/utils';
import * as _ from 'lodash';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AuthOptions') private options: AuthOptions,
    @Inject('AuthUserRepo')
    private readonly usersRepository: AuthUser & typeof AuthUser,
    private jwtService: JwtService
  ) {}

  async signUp(authCredentialsDto: RegisterUserDto): Promise<AuthUser> {
    const { email, password, name } = authCredentialsDto;
    try {
      return await this.usersRepository.create({
        email,
        // type: UserType.CUSTOMER,
        isActive: false,
        password,
        name
      });
    } catch (errors) {
      return errors;
    }
  }

  async signIn(loginDto: LoginUserDto): Promise<{ user: AuthUser; token: string }> {
    let dto = _.clone(loginDto);
    // Validate and format phone number (in case of customer login)
    if (dto && dto.phoneNumber) {
      const validPhoneNumber = utils.isNumberValid(dto.phoneNumber);
      if (!validPhoneNumber) {
        throw new HttpException('users.invalidPhoneNumber', HttpStatus.BAD_REQUEST);
      }
      dto.phoneNumber = validPhoneNumber;
    }
    const { password, pin } = dto;
    const loginOptions = _.filter(
      this.options.loginMethods,
      method => method.passwordField === Object.keys(_.omitBy({ password, pin }, _.isUndefined))[0]
    )[0];
    if (!loginOptions) {
      throw new UnprocessableEntityException();
    }
    const user: any = await this.usersRepository.findOne({
      where: {
        [loginOptions.loginField]: dto[loginOptions.loginField]
      }
    });
    // Prevent inactive users from login
    if (user && !user.isActive) {
      throw new HttpException('users.inactiveUser', HttpStatus.BAD_REQUEST);
    }
    if (
      user
      && ((loginOptions.passwordField === 'password' 
        && (await user.isPasswordValid({
          passwordField: 'password',
          passwordValue: password 
        })))
      || (loginOptions.passwordField === 'pin' 
        && (await user.isPasswordValid({
          passwordField: 'pin',
          passwordValue: pin
        }))))
    ) {
      return {
        user,
        token: await user.generateToken({
          jwtService: this.jwtService,
          oneSessionPerAccount: this.options.oneSessionPerAccount
        }),
      };
    }
    else {
      throw new UnauthorizedException();
    }
  }
}
