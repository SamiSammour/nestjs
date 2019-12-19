import { Injectable } from '@nestjs/common';
import config from 'config';
import * as AWS from 'aws-sdk';
import d from 'debug';

const packageName = process.env.npm_package_name;
const debug = d(`${packageName}:ses`);

@Injectable()
export class SesService {
  private ses = new AWS.SES(config.get('ses.credentials'));

  sendEmail({ to, subject, body}) {
    const emailParams = Object.assign({}, {
      Destination: {
        ToAddresses: [to]
      },
      Message: {
        Body: {
          Html: {
            Data: body
          }
        },
        Subject: {
          Data: subject
        }
      },
      Source: `"${config.get('ses.email.name')}" <${config.get('ses.email.from')}>`
    });
    debug(`Sending email to ${to}`);
    return this.ses.sendEmail(emailParams).promise().then(() => {
      debug(`Email send successfully to : ${to}`);
    });
  }
}
