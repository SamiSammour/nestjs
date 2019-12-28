import { ApiModelProperty } from '@nestjs/swagger';
import { AuthUser } from '../dto/authUser.interface';

export class AuthUserDto {
    @ApiModelProperty({ type: AuthUser })
    user: AuthUser;
    @ApiModelProperty({ type: String })
    token: string;
}
