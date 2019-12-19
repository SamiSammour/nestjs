import { Model } from 'sequelize';
import { JwtPayload } from '../jwt/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

export interface GenerateTokenOptions {
  jwtService: JwtService;
  oneSessionPerAccount: boolean;
  newToken?: boolean;
}

export abstract class AuthUser extends Model<AuthUser> {
  id: number;
  tokenIssuedAt: Date;
  email?: string;
  phoneNumber?: string;
  abstract isPasswordValid(password: string): boolean;
  abstract generateToken(options: GenerateTokenOptions): Promise<string>;
}
