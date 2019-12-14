import config from 'config';
import { parse } from 'url';
import d from 'debug';

const db = config.get('db');
const logsDB = config.get('logsDB');
const packageName = process.env.npm_package_name;
const debug = d(`${packageName}:database`);
const def = process.env.MODE === 'logs' ? logsDB.define || {} : db.define || {};

let connectionInfo = {
  dialect: process.env.MODE === 'logs' ? logsDB.dialect : db.dialect,
  host: process.env.MODE === 'logs' ? logsDB.host : process.env.DB_HOST || db.host,
  port: process.env.MODE === 'logs' ? logsDB.port : process.env.DB_PORT || db.port,
  username: process.env.MODE === 'logs' ? logsDB.username : process.env.DB_USERNAME || db.username,
  password: process.env.MODE === 'logs' ? logsDB.password : process.env.DB_PASS || db.password,
  database: process.env.MODE === 'logs' ? logsDB.database : process.env.DB_DATABASE || db.database,
};
if (process.env.DB_URL) {
  const parsed = parse(process.env.DB_URL);
  const [username, password] = parsed.auth.split(':');
  connectionInfo = {
    dialect: parsed.protocol.slice(0, -1),
    host: parsed.host,
    port: parsed.port,
    database: parsed.path.substr(1),
    username,
    password
  };
}

export const dbConfig: any = {
  ...connectionInfo,
  logging: str => debug(str),
  define: {
    underscored: def.underscored !== undefined ? def.underscored : true,
    paranoid: def.paranoid !== undefined ? def.paranoid : true,
    timestamps: def.timestamps !== undefined ? def.timestamps : true,
    freezeTableName: def.freezeTableName !== undefined ? def.freezeTableName : false
  }
};
