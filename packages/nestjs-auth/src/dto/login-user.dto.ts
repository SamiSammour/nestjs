import {
  IsEmail, IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength, ValidateIf,
} from 'class-validator';

export class LoginUserDto {
  @IsString()
  @MinLength(6)
  @MaxLength(32)
  @IsEmail()
  @ValidateIf(o => !o.phoneNumber)
  email?: string;

  @IsString()
  @ValidateIf(o => !o.email)
  phoneNumber?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;
}
