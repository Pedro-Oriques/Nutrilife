import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PointsRecordDocument = HydratedDocument<PointsRecord>;

@Schema({ collection: 'points_records', timestamps: true })
export class PointsRecord {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['login', 'agua', 'peso', 'cafe_da_manha', 'almoco', 'jantar', 'lanche'],
  })
  actionType: string;

  @Prop({ required: true })
  points: number;

  @Prop({ required: true })
  date: string;
}

export const PointsRecordSchema = SchemaFactory.createForClass(PointsRecord);

PointsRecordSchema.index({ userId: 1, actionType: 1, date: 1 }, { unique: true });
