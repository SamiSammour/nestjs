import { Sequelize } from 'sequelize-typescript';
import { dbConfig } from './sequelize.config';

export function createDatabaseProvider(modelsDir) {
  return [{
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize(dbConfig);
      sequelize.addModels(modelsDir);
      await sequelize.sync({ force: dbConfig.force });
      return sequelize;
    }
  }];
}
