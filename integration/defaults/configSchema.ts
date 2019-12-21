import Joi from '@hapi/joi';

const envVarsSchema: any = {
  MODE: Joi.string().allow('normal', 'logs'),
  NODE_ENV: Joi.string(),
  MODELS_DIR: Joi.string(),
  LOG_MODELS_DIR: Joi.string(),
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
  logsDB: {
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
  S3: {
    credentials: {
      accessKeyId: Joi.string().allow(''),
      secretAccessKey: Joi.string().allow('')
    },
    bucket: Joi.string().allow('')
  },
  twilio: {
    appSid: Joi.string().allow(''),
    authToken: Joi.string().allow(''),
    messagingSeviceSid: Joi.string().allow('')
  },
  ses: {
    credentials: {
      region: Joi.string().allow(''),
      accessKeyId: Joi.string().allow(''),
      secretAccessKey: Joi.string().allow('')
    },
    email: {
      from: Joi.string().allow(''),
      name: Joi.string().allow('')
    }
  },
  firebase: Joi.string().allow(''),
  sentryDSN: Joi.string().allow(''),
  setPasswordEmail: {
    emailLogo: Joi.string().allow(''),
    setPasswordLink: Joi.string().allow(''),
    emailSubject: Joi.string().allow('')
  }
};

export default envVarsSchema;
