import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FoodDocument = HydratedDocument<Food>;

export const FOOD_RESTRICTIONS = [
  'Sem restrições',
  'Celíaco',
  'Vegano',
  'Vegetariano',
  'Colesterol alto',
];

@Schema({ collection: 'foods', timestamps: true })
export class Food {
  @Prop({ required: true, index: 'text' })
  name: string;

  @Prop({ required: true })
  caloriesPer100g: number;

  @Prop({ required: false })
  protein?: number;

  @Prop({ required: false })
  carbs?: number;

  @Prop({ required: false })
  fat?: number;

  @Prop({
    type: [String],
    default: ['Sem restrições'],
    enum: FOOD_RESTRICTIONS,
  })
  foodRestrictions: string[];
}

export const FoodSchema = SchemaFactory.createForClass(Food);
