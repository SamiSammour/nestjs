import { IsString, MinLength, MaxLength, Matches, IsEmail } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @MinLength(6)
  @MaxLength(32)
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(
    /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
    { message: 'password too weak' },
  )
  password: string;
}
