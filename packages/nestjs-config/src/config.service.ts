import { Injectable, Inject } from '@nestjs/common';
import * as Joi from '@hapi/joi';
import config from 'config';
import { ConfigOptionsInterface } from './config-options.interface';

export type EnvConfig = Record<string, string>;

@Injectable()
export class ConfigService {
  private readonly envConfig: EnvConfig;

  constructor(
    @Inject('CONFIG_OPTIONS') private options: ConfigOptionsInterface
    ) {
    this.envConfig = options ? this.validateInput(config) : {};
  }

  private validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object(this.options.schema);
    const { error, value: validatedEnvConfig } = envVarsSchema.validate(envConfig);
    if (error) {
      throw new Error(`Validation error: ${error.message}`);
    }
    return validatedEnvConfig;
  }

  get(key: string): string {
    return this.options ? this.envConfig[key] : config.get(key);
  }
}
