/**
 * This scripts can be run using the following command:
 * DB=logs MODE=logs CLI_PATH='./src/logs/app/cli.ts' npx nestjs-command import:logs --from=2019-11-12T11:20:39.184Z
 * 'from' option should be provided when calling this script
 */
import { Command, Option, Positional } from 'nestjs-command';
import { Injectable, Inject } from '@nestjs/common';
import * as AdmZip from 'adm-zip';
import { promisify } from 'util';
import * as AWS from 'aws-sdk';
import { Op } from 'sequelize';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { LoggingCommand } from './logging.command';
import moment from 'moment';
import config from 'config';

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

@Injectable()
export class ImportLogsCommand extends LoggingCommand {

  private S3 = new AWS.S3(config.get('S3.credentials'));

  async importFromS3(zipName, zipPath) {
    console.log('Importing from S3');
    return new Promise(async (resolve, reject) => {
      // TODO: replace with credentials from config
      const params = {
        Bucket: config.get('S3.bucket'),
        Key: zipName
      };
      await this.S3.getObject(params).promise().then(async output => {
        if (!output) {
          console.log('Could not import data from s3.');
          reject();
        }
        console.log('Writting the downloaded zip into disk.');
        const err: any = await writeFileAsync(zipPath, output.Body);
        if (err) {
          reject();
        }
        resolve();
      }).catch(reject);
    });
  }

  async writeToDisk(zipPath, date) {
    console.log('Unzipping logs');
    return new Promise(async (resolve, reject) => {
      const zip = new AdmZip(zipPath);
      const zipEntries = zip.getEntries();

      if (!zipEntries.length) {
        console.log('No entries in zip file');
        reject();
      }
      const zipEntry = zipEntries[0];
      const data = zipEntry.getData().toString('utf8');
      const fileName = path.join(os.tmpdir(), `logs_${date}.txt`);
      const err: any = await writeFileAsync(fileName, data);
      if (err) {
        console.log(`Error in writting file: ${err}`);
        reject();
      }
      const logs = await readFileAsync(fileName, { encoding: 'utf8'});
      const parsedLogs = JSON.parse(logs.toString());
      resolve(parsedLogs);
    });
  }

  async addLogsToDb(logs) {
    console.log('Inserting logs into DB');
    return await this.sequelize.transaction(async transaction => {
      await Promise.all(logs.map(async (record: any) => {
        const { date, uuid, type, ip, meta, groupId, category, data } = record;
        let logGroup = await this.sequelize.models.LogGroup.findOne({
          where: {
            date
          }
        });
        if (!logGroup) {
          logGroup = await this.sequelize.models.LogGroup.create({
            date,
            uuid,
            type,
            ip,
            meta,
            isImported: true
          }, { transaction });
        }
        await this.sequelize.models.LogMessage.create({
          date,
          category,
          data,
          groupId,
          isImported: true
        }, { transaction });
      }));
    });
  }

  async importData(date) {
    // delete all records from logs DB before importing new ones
    await this.sequelize.models.LogGroup.destroy({
      where: {}
    });
    await this.sequelize.models.LogGroup.destroy({
      where: {}
    });
    const zipName = `logs_${date}.zip`;
    const zipPath = path.join(os.tmpdir(), zipName);
    // if zip file doesn't already exist in tmp, import it from s3, otherwise add it to DB directly
    if (!fs.existsSync(zipPath)) {
      await this.importFromS3(zipName, zipPath);
    }
    // write zip file content to disk
    const logs: any = await this.writeToDisk(zipPath, date);
    await this.addLogsToDb(logs);
  }

  @Command({
    command: 'import:logs',
    describe: 'Import logs',
    autoExit: false
  })
  async create(
    @Option({
      name: 'sort',
      // @ts-ignore
      describe: 'sort records asc or desc',
      type: 'string',
      choices: ['asc', 'desc'],
      default: 'desc'
    }) sort?: string,
    @Option({
      name: 'limit',
      // @ts-ignore
      describe: 'number of records limit',
      type: 'number',
      default: 10
    }) limit?: number,
    @Option({
      name: 'last',
      // @ts-ignore
      describe: 'last x-min/h',
      type: 'string'
    }) last?: string,
    @Option({
      name: 'method',
      // @ts-ignore
      describe: 'request method',
      type: 'string',
      choices: ['get', 'post', 'put', 'patch', 'delete']
    }) method?: string,
    @Option({
      name: 'url',
      // @ts-ignore
      describe: 'request url',
      type: 'string'
    }) url?: string,
    @Option({
      name: 'from',
      // @ts-ignore
      describe: 'from date/time',
      type: 'string'
    }) from?: string,
    @Option({
      name: 'to',
      // @ts-ignore
      describe: 'to date/time',
      type: 'string'
    }) to?: string
  ) {
    if (process.env.MODE !== 'logs') {
      throw new Error(`Make sure you're running the script in logs mode`);
    }
    if (!from) {
      throw new Error('Missing date');
    }
    const date = moment(from).format('YYYY-MM-DD');
    await this.importData(date);
    const where: any = {};
    if (last) {
      const [amt, unit] = last.match(/^(\d+)([mh])$/).slice(1);
      const amount = parseInt(amt, 10);
      const since = new Date();
      if (unit === 'm') {
        since.setMinutes(since.getMinutes() - amount);
      } else if (unit === 'h') {
        since.setHours(since.getHours() - amount);
      }
      where.date = {
        [Op.gt]: since
      };
    }
    if (method) {
      where['meta.method'] = {
        [Op.iLike]: method
      };
    }
    if (url) {
      where['meta.originalUrl'] = {
        [Op.iLike]: `%${url}%`
      };
    }
    const recordSort = sort === 'asc' ? 'ASC' : 'DESC';
    console.log(where);

    await this.displayData({
      where,
      limit,
      sort: recordSort
    });
  }
}
