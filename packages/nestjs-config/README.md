### About
This module uses the [config](https://github.com/lorenwest/node-config) package along with [Joi](https://hapi.dev/family/joi/) to validate the config
### Installation
```shell script
npm install @alphaapps/nestjs-config
```
The module uses `@nestjs/common` along with `config` & `@hapi/joi` packages so you should install them too (if not installed already):
```shell script
npm install @nestjs/common config @hapi/joi
```

### Usage
Import the config module and call the `register` method in the `imports` array in the `app.module.ts` file.
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@alphaapps/nestjs-config';
import schema from './configSchema';

@Module({
  imports: [
    ConfigModule.register({ schema }), // pass a Joi schema to validate the config against
    ConfigModule.register() // don't pass anything if you don't want any validation
  ],
})
export class AppModule {}
```
Refer to [config docs](https://github.com/lorenwest/node-config/wiki) for more on how to write and include config files in the project.

A `Joi` schema example:
```typescript
import Joi from '@hapi/joi';

const envVarsSchema: any = {
  server: {
    port: Joi.number().min(1024)
  },
  db: {
    dialect: Joi.string().allow('postgres', 'mysql'),
    host: Joi.string(),
    port: Joi.number(),
    username: Joi.string(),
    password: Joi.string(),
    database: Joi.string(),
    define: {
      underscored: Joi.bool(),
      paranoid: Joi.bool(),
      timestamps: Joi.bool(),
      freezeTableName: Joi.bool()
    }
  },
  JWT: {
    secretKey: Joi.string().required()
  },
};

export default envVarsSchema;
``` 
