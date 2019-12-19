import { Injectable, ArgumentMetadata, Inject, BadRequestException, ValidationPipe } from '@nestjs/common';
import AuthOptions from '../dto/authOptions.dto';

@Injectable()
export class AuthValidationPipe extends ValidationPipe {
  constructor(@Inject('AuthOptions') private options: AuthOptions) {
    super();
  }
  async transform(value: any, metadata: ArgumentMetadata) {
    const field = value[this.options.loginField];
    if (!field) {
      throw new BadRequestException(`${this.options.loginField} is required`);
    }
    return super.transform(value, metadata);
  }
}
