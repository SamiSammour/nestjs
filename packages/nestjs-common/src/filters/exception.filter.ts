import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { UniqueConstraintError, ValidationError } from 'sequelize';
import errorCodesChecker from './error-codes-checker';
import * as _ from 'lodash';

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  private readonly errors;
  constructor(errorsObject: any) {
    errorCodesChecker(errorsObject);
    this.errors = errorsObject;
  }

  catch(exception: any, host: ArgumentsHost) {
    let error;
    let message = exception.message.message;
    const e: any = exception;
    if (!message) {
      if (exception instanceof UniqueConstraintError) {
        message = `${_.camelCase(e.errors[0].instance.constructor.tableName)}.${_.camelCase(`${e.errors[0].path}  ${e.errors[0].type}`)}`;
      } else if (exception instanceof ValidationError) {
        message = `${_.camelCase(e.errors[0].instance.constructor.tableName)}.${_.camelCase(`${e.errors[0].path}  ${e.errors[0].type}`)}`;
      }
    }
    error = _.get(this.errors, message);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    response.status((error || { statusCode }).statusCode).json({
      code: (error || {}).code,
      message: (error || exception.message).message || exception.message.error,
      statusCode
    });
  }
}
