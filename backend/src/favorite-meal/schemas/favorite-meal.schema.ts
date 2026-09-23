import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FavoriteMealDocument = FavoriteMeal & Document;

@Schema({ _id: false })
export class FavoriteFoodItem {
  @Prop({ type: Types.ObjectId, ref: 'Food', required: true })
  foodId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  unit: string;

  @Prop({ required: true })
  calories: number;

  @Prop()
  protein?: number;

  @Prop()
  carbs?: number;

  @Prop()
  fat?: number;
}

const FavoriteFoodItemSchema = SchemaFactory.createForClass(FavoriteFoodItem);

@Schema({ timestamps: true })
export class FavoriteMeal {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  mealSession: string;

  @Prop({ type: [FavoriteFoodItemSchema], required: true })
  foods: FavoriteFoodItem[];
}

export const FavoriteMealSchema = SchemaFactory.createForClass(FavoriteMeal);
