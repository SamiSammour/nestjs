import {Inject, Injectable, UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import AuthOptions from './dto/authOptions.dto';
import { AuthUser } from './dto/authUser.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AuthOptions') private options: AuthOptions,
    @Inject('AuthUserRepo')
    private readonly usersRepository: AuthUser & typeof AuthUser,
    private jwtService: JwtService
  ) {}

  async signUp(authCredentialsDto: RegisterUserDto): Promise<AuthUser> {
    const { email, password } = authCredentialsDto;
    try {
      return await this.usersRepository.create({
        email,
        // type: UserType.CUSTOMER,
        isActive: false,
        password,
      });
    } catch (errors) {
      console.log(errors);
      return errors;
    }
  }

  async signIn(dto: LoginUserDto): Promise<{ user: AuthUser; token: string }> {
    const { password } = dto;
    const field = dto[this.options.loginField];
    const user: AuthUser = await this.usersRepository.findOne({
      where: {
        [this.options.loginField]: field
      }
    });
    if (user && (await user.isPasswordValid(password))) {
      return {
        user,
        token: await user.generateToken({
          jwtService: this.jwtService,
          oneSessionPerAccount: this.options.oneSessionPerAccount
        }),
      };
    } else {
      throw new UnauthorizedException();
    }
  }
}
