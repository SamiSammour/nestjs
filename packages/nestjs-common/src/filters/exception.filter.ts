import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { UniqueConstraintError, ValidationError } from 'sequelize';
import errorCodesChecker from './error-codes-checker';
import { Response } from 'express';
import * as _ from 'lodash';
import d from 'debug';

const packageName = process.env.npm_package_name;
const debug = d(`${packageName}:exception-filter`);

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  private readonly errors;
  constructor(errorsObject: any) {
    errorCodesChecker(errorsObject);
    this.errors = errorsObject;
  }

  catch(exception: any, host: ArgumentsHost) {
    debug(exception);
    let error;
    let message = exception.message.message;
    const e: any = exception;
    if (!message) {
      if (exception instanceof UniqueConstraintError) {
        message = `${_.camelCase(e.errors[0].instance.constructor.tableName)}.${_.camelCase(`${e.errors[0].path}  ${e.errors[0].type}`)}`;
      } else if (exception instanceof ValidationError) {
        message = `${_.camelCase(e.errors[0].instance.constructor.tableName)}.${_.camelCase(`${e.errors[0].path}  ${e.errors[0].type}`)}`;
      } else {
        message = exception.message;
      }
    }
    error = _.get(this.errors, message);
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse();
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    response.status(((error || { statusCode }).statusCode || statusCode)).json({
      code: (error || {}).code,
      message:
        !((error || exception.message).message || exception.message.error)
          ? (e.errors ? e.errors[0] : e.message)
          : (error || exception.message).message || exception.message.error,
      statusCode
    });
  }
}
