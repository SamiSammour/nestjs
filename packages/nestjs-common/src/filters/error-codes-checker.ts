import * as _ from 'lodash';
import { InternalServerErrorException } from '@nestjs/common';

export default function errorCodesChecker(errors: any) {
  const codes = [];
  Object.keys(errors).forEach(errorType => {
    Object.keys(errors[errorType]).forEach(error => {
      if (errors[errorType][error].code) {
        codes.push(errors[errorType][error].code);
      } else {
        throw new InternalServerErrorException(`Code property must be included in ${error} object`);
      }
    });
  });
  const duplicatedCodes = _.countBy(codes);
  const result = _.map(duplicatedCodes, (value, key) => {
    if (value > 1) {
      return key;
    }
  }).filter(x => x);
  if (result.length) {
    throw new InternalServerErrorException(`The following error codes are duplicated ${result.join(' ,')}`);
  }
}
