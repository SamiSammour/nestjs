import * as _ from 'lodash';
import * as googlePhone from 'google-libphonenumber';

const phoneUtil = googlePhone.PhoneNumberUtil.getInstance();

export const utils = {
  isNumberValid(number) {
    let mobileNumber = number;
    if (typeof number !== 'string') {
      mobileNumber = number.toString();
    }
    // if the number starts with '00' then substitute it with '+'
    if (mobileNumber.indexOf('00') === 0) {
      mobileNumber = `+${mobileNumber.substring(2)}`;
    }
    try {
      const phoneNumber = phoneUtil.parse(mobileNumber, 'AE');
      return phoneUtil.isValidNumber(phoneNumber)
        ? phoneUtil.format(phoneNumber, googlePhone.PhoneNumberFormat.E164) : false;
    }
    catch (ex) {
      return false;
    }
  },
}
