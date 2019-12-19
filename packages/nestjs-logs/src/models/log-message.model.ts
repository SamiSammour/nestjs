import { Table, Column, DataType, NotNull, BelongsTo } from 'sequelize-typescript';

import { LogMessageCategories } from '../common/enum/message-categories.enum';
import { AlphaModel } from '@alphaapps/nestjs-db';
import { LogGroup } from './log-group.model';

@Table
export class LogMessage extends AlphaModel<LogMessage> {
  @NotNull
  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  date: Date;

  @Column({
    type: DataType.ENUM(
      LogMessageCategories.DATABASE,
      LogMessageCategories.REQBODY,
      LogMessageCategories.REWRITE
    )
  })
  category: LogMessageCategories;

  @Column({
    type: DataType.JSON
  })
  data: object;

  @BelongsTo(() => LogGroup, 'groupId')
  group: LogGroup;
}
