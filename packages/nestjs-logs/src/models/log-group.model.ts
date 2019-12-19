import { Table, Column, DataType, HasMany, NotNull, Unique } from 'sequelize-typescript';
import { LogGroupTypes } from '../common/enum/group-types.enum';
import { AlphaModel } from '@alphaapps/nestjs-db';
import { LogMessage } from './log-message.model';

@Table({
  paranoid: false,
  timestamps: false
})
export class LogGroup extends AlphaModel<LogGroup> {
  @NotNull
  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  date: Date;

  @Unique
  @Column({
    type: DataType.UUID
  })
  uuid: string;

  @Column({
    type: DataType.ENUM(LogGroupTypes.HTTP, LogGroupTypes.SOCKET)
  })
  type: LogGroupTypes;

  @Column({
    type: 'inet'
  })
  ip: string;

  @Column({
    type: DataType.JSON
  })
  meta: object;

  @HasMany(() => LogMessage, 'groupId')
  messages: LogMessage[];
}
