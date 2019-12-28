import { IsString, MinLength, MaxLength, Matches, IsEmail } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiModelProperty({
    required : true,
    type: String,
    maxLength: 32,
    minLength: 6
  })
  @IsString()
  @MinLength(6)
  @MaxLength(32)
  @IsEmail()
  email: string;

  @ApiModelProperty({
    required : true,
    type: String,
    maxLength: 20,
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(
    /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
    { message: 'password too weak' },
  )
  password: string;

  @ApiModelProperty({
    type: String,
    required: true
  })
  @IsString()
  name: string;
}
