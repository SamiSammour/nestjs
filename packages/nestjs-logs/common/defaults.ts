import config from 'config';
import { join } from 'path';

export const modelsDir = process.env.MODE === 'logs'
  ? config.get('LOG_MODELS_DIR')
  : config.get('MODELS_DIR');

export const models = [join(process.cwd(), '/dist', modelsDir)];
