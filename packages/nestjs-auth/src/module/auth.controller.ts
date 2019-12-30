import { Body, Controller, Post, UsePipes, ValidationPipe, Inject } from '@nestjs/common';
import { ApiUseTags, ApiImplicitBody, ApiCreatedResponse } from '@nestjs/swagger';
import { AuthValidationPipe } from '../pipes/authValidation.pipe';
import { RegisterUserDto } from '../dto/register-user.dto';
import { AuthUser } from '../dto/authUser.interface';
import { LoginUserDto } from '../dto/login-user.dto';
import { AuthUserDto } from '../jwt/auth-user.dto';
import { AuthService } from './auth.service';

@ApiUseTags('auth')
@Controller('')
export class AuthController {
  constructor(
    public service: AuthService,
    @Inject('AuthUserRepo')
    private readonly usersRepository: AuthUser & typeof AuthUser,
    ) {}

  @Post('/signup')
  @ApiImplicitBody({ name: 'authCredentialsDto', required : true, type: RegisterUserDto})
  @ApiCreatedResponse({type : this.usersRepository})
  signUp(
    @Body(ValidationPipe) authCredentialsDto: RegisterUserDto,
  ): Promise<AuthUser> {
    return this.service.signUp(authCredentialsDto);
  }

  @Post('/signin')
  @ApiImplicitBody({ name: 'authCredentialsDto', required : true, type: RegisterUserDto})
  @ApiCreatedResponse({type : AuthUserDto})
  signIn(
    // TODO: re-add AuthValidationPipe
    @Body() authCredentialsDto: LoginUserDto,
  ): Promise<{ user: AuthUser; token: string }> {
    return this.service.signIn(authCredentialsDto);
  }
}
