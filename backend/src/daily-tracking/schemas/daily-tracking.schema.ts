import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DailyTrackingDocument = HydratedDocument<DailyTracking>;

@Schema({ collection: 'daily-tracking', timestamps: true })
export class DailyTracking {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Food', required: true })
  foodId: Types.ObjectId;

  @Prop({ required: true })
  foodName: string;

  @Prop({ required: true })
  calories: number;

  @Prop({ default: 0 })
  protein: number;

  @Prop({ default: 0 })
  carbs: number;

  @Prop({ default: 0 })
  fat: number;

  @Prop({ required: true, min: 1, max: 9999 })
  quantity: number;

  @Prop({
    required: true,
    enum: ['g', 'kg', 'ml', 'L', 'mg', 'mcg'],
  })
  unit: string;

  @Prop({
    required: true,
    enum: [
      'cafe_da_manha',
      'lanche_manha',
      'almoco',
      'lanche_tarde',
      'jantar',
      'ceia',
    ],
  })
  mealSession: string;

  @Prop({ required: true, default: () => new Date() })
  date: Date;
}

export const DailyTrackingSchema = SchemaFactory.createForClass(DailyTracking);
