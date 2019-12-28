import { AlphaModel } from '@alphaapps/nestjs-db';
import { Column, IsEmail, Table, Unique } from 'sequelize-typescript';
import { AuthUser } from '@alphaapps/nestjs-auth';

@Table
export default class User extends AlphaModel<User> implements AuthUser {
  @Column({
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Unique
  @IsEmail
  @Column
  email: string;

  @Column
  password: string;

  @Column
  tokenIssuedAt: Date;

  @Column
  isActive: boolean;

  isPasswordValid({
    passwordField,
    passwordValue
  }): any {
    return null;
  }

  async generateToken(options: any): Promise<string> {
    // always generate new token if `oneSessionPerAccount` is true
    const generateNewToken = options.oneSessionPerAccount || options.newToken || !this.tokenIssuedAt;
    const timestamp = generateNewToken ? new Date() : this.tokenIssuedAt;
    this.tokenIssuedAt = timestamp;
    if (generateNewToken) {
      await this.save({ fields: ['tokenIssuedAt'] });
    }
    const payload: any = {
      id: this.id,
      email: this.email,
      timestamp: timestamp.getTime()
    };
    return options.jwtService.sign(payload);
  }
}
