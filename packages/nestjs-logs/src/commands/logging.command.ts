// tslint:disable:no-console
/**
 * This scripts can be run using the following command:
 * MODE=logs CLI_PATH='./src/logs/app/cli.ts' npx nestjs-command read:logs \
 *  --sort=<asc|desc> \
 *  --limit=<number> \
 *  --last=<duration> \
 *  --url=<string> \
 *  --method=<http method> \
 *  --from=<iso date> \
 *  --to=<iso date>
 */
import { Injectable, Inject } from '@nestjs/common';
import { Command, Option } from 'nestjs-command';
import * as readline from 'readline';
import { Op } from 'sequelize';
import * as util from 'util';
import * as _ from 'lodash';
import moment from 'moment';
import d from 'debug';

const packageName = process.env.npm_package_name;
const debug = d(`${packageName}:log-command`);

@Injectable()
export class LoggingCommand {
  public sequelize;
  constructor(
    @Inject('SEQUELIZE')
    private readonly sequelizeInstance
  ) {
    this.sequelize = sequelizeInstance;
  }

  public rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  public question = q => new Promise(((resolve) => {
    this.rl.question(q, resolve);
  }))

  @Command({
    command: 'read:logs',
    describe: 'Read logs',
    autoExit: false
  })
  async create(
    @Option({
      name: 'sort',
      describe: 'sort records asc or desc',
      type: 'string',
      choices: ['asc', 'desc'],
      default: 'desc'
    }) sort?: string,
    @Option({
      name: 'limit',
      describe: 'number of records limit',
      type: 'number',
      default: 10
    }) limit?: number,
    @Option({
      name: 'last',
      describe: 'last x-min/h',
      type: 'string'
    }) last?: string,
    @Option({
      name: 'method',
      describe: 'request method',
      type: 'string',
      choices: ['get', 'post', 'put', 'patch', 'delete']
    }) method?: string,
    @Option({
      name: 'url',
      describe: 'request url',
      type: 'string'
    }) url?: string,
    @Option({
      name: 'from',
      describe: 'from date/time',
      type: 'string'
    }) from?: string,
    @Option({
      name: 'to',
      describe: 'to date/time',
      type: 'string'
    }) to?: string
  ) {
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
    if (from && moment(from).isValid()) {
      where.date = {
        [Op.gte]: moment(from)
      };
    }
    if (to && moment(to).isValid()) {
      where.date = where.date || {};
      where.date[Op.lte] = moment(to);
    }
    const recordSort = sort === 'asc' ? 'ASC' : 'DESC';
    debug(where);
    await this.displayData({
      where,
      limit,
      sort: recordSort
    });
  }

  async displayData({ where, sort, limit}) {
    const groups = await this.sequelize.models.LogGroup.findAll({
      where,
      limit,
      order: [['date', sort]]
    });
    console.table(groups.map((g: any) => {
      const meta = _.get(g, 'meta.originalUrl');
      return {
        date: g.date.toISOString().replace('T', ' ').substr(8, 13),
        uuid: g.uuid.substr(0, 9),
        type: g.type,
        ip: g.ip,
        method: _.get(g, 'meta.method'),
        meta: meta.length > 83
          ? `${meta.substr(0, 80)}...`
          : meta
      };
    }));
    const answer: any = await this.question('Please enter id (or type q to quit):');
    if (answer === 'q') {
      process.exit(0);
    }
    const index = parseInt(answer, 10);

    if (Number.isNaN(index)) { return; }
    const group = groups[index];
    const messages = await this.sequelize.models.LogMessage.findAll({
      where: {
        groupId: group.id
      },
      order: ['date']
    });

    messages.forEach(this.printMessage);
    const finalAnswer = await this.question('Enter to continue (or type q to quit)');
    if (finalAnswer === 'q') {
      process.exit(0);
    }
    this.displayData({ where, sort, limit });
  }

  printMessage(message) {
    console.log(message.createdAt, message.level, message.category);
    console.log(util.inspect(message.data, {
      colors: true,
      depth: 10
    }));
  }
}
