import { Prop, Schema } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema()
export class AbstractDocument {
  @Prop({ type: SchemaTypes.ObjectId })
  _id: Types.ObjectId;

  createdBy?: Types.ObjectId | string;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date = null;

  deleted?: boolean = false;

  version?: number = null;
}
