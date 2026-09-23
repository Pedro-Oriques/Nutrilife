import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type WeightEntryDocument = HydratedDocument<WeightEntry>;

@Schema({ collection: 'weight_entries', timestamps: true })
export class WeightEntry {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 300 })
  weight: number;

  @Prop({ required: true, default: () => new Date() })
  recordedAt: Date;
}

export const WeightEntrySchema = SchemaFactory.createForClass(WeightEntry);
