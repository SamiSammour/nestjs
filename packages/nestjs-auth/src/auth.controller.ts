import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthUser } from './dto/authUser.interface';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthValidationPipe } from './pipes/authValidation.pipe';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(public service: AuthService) {}

  @Post('/signup')
  signUp(
    @Body(ValidationPipe) authCredentialsDto: RegisterUserDto,
  ): Promise<AuthUser> {
    return this.service.signUp(authCredentialsDto);
  }

  @Post('/signin')
  signIn(
    @Body(AuthValidationPipe) authCredentialsDto: LoginUserDto,
  ): Promise<{ user: AuthUser; token: string }> {
    return this.service.signIn(authCredentialsDto);
  }
}
