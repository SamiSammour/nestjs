import { Model, Table } from 'sequelize-typescript';

@Table
export class AlphaModel<T> extends Model<T> {
  toJSON(): object {
    const json = this.get();
    Object.entries(json).forEach(([key, value]) => {
      if (value && value.toJSON) {
        json[key] = value.toJSON();
      }
    });
    return json;
  }
}
