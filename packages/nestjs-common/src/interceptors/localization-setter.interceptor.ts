import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Association } from 'sequelize/types';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { parse } from 'accept-language-parser';
import ISO6391 from 'iso-639-1';
export interface Response<T> {
  data: T;
}

@Injectable()
export class LocalizationSetter<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    let lang = parse(context.switchToHttp().getRequest().headers['accept-language'] || 'en')[0].code.toLowerCase();
    if (!ISO6391.validate(lang)) {
      lang = 'en';
    }
    return next.handle().pipe(map(data => {
      this.setLanguage(data, lang);
      return data;
    }));
  }

  setLanguage(data: any, lang: any): T {
    if (data) {
      data.$locale = lang;
    }
    if (Array.isArray(data)) {
      data.forEach(r => {
        r.$locale = lang;
        if (!r.constructor.associations) {
          return r;
        }
        Object.values(r.constructor.associations)
          .forEach((assoc: Association) => {
            if (typeof r[assoc.as] === 'undefined' || r[assoc.as] === null) {
              return;
            }
            (Array.isArray(r[assoc.as]) ? r[assoc.as] : [r[assoc.as]])
              .forEach(s => {
                this.setLanguage(s, lang);
              });
          });
      });
    }
    return data;
  }
}
