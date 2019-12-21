import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response } from 'express';
import uuidv4 from 'uuid/v4';
import d from 'debug';

const packageName = process.env.npm_package_name;
const debug = d(`${packageName}:logs`);

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  public sequelize;
  constructor(
    @Inject('SEQUELIZE')
    private readonly sequelizeInstance
  ) {
    this.sequelize = sequelizeInstance;
  }

  use(req: Request, res: Response, next: () => void) {
    const now: any = new Date();
    // don't log options requests
    if (req.method === 'OPTIONS') {
      return next();
    }
    if (req.url === '/heartbeat' && req.method === 'GET') {
      return null;
    }

    this.log(req, res, {
      type: 'http',
      now
    });
    next();
  }

  log(req: Request, res: Response, { type, now }) {
    let groupId;
    let ip = null;
    const queue = [];
    const uuid = uuidv4();
    const {
      originalUrl,
      ip: reqIp,
      headers,
      method,
      url
    } = req;

    if (res) {
      res.set('X-Alpha-LGID', uuid);
      ({ ip } = req);
    }
    // create log group
    const meta = {
      originalUrl,
      ip: reqIp,
      headers,
      method,
      url
    };
    this.sequelize.models.LogGroup.create({
      date: now,
      uuid,
      type,
      meta,
      ip
    }).then((logGroup) => {
      groupId = logGroup.id;
      this.processQueue(groupId, queue);
    }).catch(err => {
      groupId = false;
      debug('Failed to save the log.', err);
      this.processQueue(groupId, queue);
    });
    // process request body
    queue.push({
      data: req.body,
      category: 'reqbody',
      date: new Date()
    });
    this.processQueue(groupId, queue);
  }

  processQueue(groupId: number, queue: any[]) {
    if (!groupId) { return; }
    const messages = queue.splice(0, queue.length);
    if (!messages.length) { return; }
    // append groupId to messages
    for (const m of messages) {
      m.groupId = groupId;
    }
    this.sequelize.models.LogMessage.bulkCreate(messages);
  }
}
