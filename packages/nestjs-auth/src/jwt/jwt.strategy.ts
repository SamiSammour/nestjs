import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from './jwt-payload.interface';
import { AuthUser } from '../dto/authUser.interface';
import config from 'config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('AuthUserRepo')
    private userRepository: AuthUser & typeof AuthUser,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT.secretKey'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const { email } = payload;
    const user = await this.userRepository.findOne({
      where: { email },
      include: [{
        association: 'associatedRoles',
        attributes: ['name'],
        include: ['grants'],
      }],
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
