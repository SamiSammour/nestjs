import { Model } from 'sequelize';
import { JwtService } from '@nestjs/jwt';

export interface GenerateTokenOptions {
  jwtService: JwtService;
  oneSessionPerAccount: boolean;
  newToken?: boolean;
}

export interface passwordFieldOptions {
  passwordField: string;
  passwordValue: string;
}

export abstract class AuthUser extends Model<AuthUser> {
  id: number;
  tokenIssuedAt: Date;
  email?: string;
  phoneNumber?: string;
  abstract isPasswordValid(options: passwordFieldOptions): boolean;
  abstract generateToken(options: GenerateTokenOptions): Promise<string>;
}
