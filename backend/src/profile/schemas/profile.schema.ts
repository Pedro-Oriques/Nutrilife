import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../user/schemas/user.squema';

export type ProfileDocument = Profile & Document;

export const FOOD_RESTRICTIONS = [
  'Sem restrições',
  'Celíaco',
  'Vegano',
  'Vegetariano',
  'Colesterol alto',
];

export const PHYSICAL_ACTIVITIES = [
  'Sedentário',
  'Pouco ativo',
  'Ativo',
  'Muito Ativo',
  'Extremamente Ativo',
];

@Schema({ collection: 'profiles', timestamps: true })
export class Profile {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  birthDate: Date;

  @Prop({ required: true, min: 1, max: 300 })
  height: number;

  @Prop({ required: true, min: 1, max: 300 })
  weight: number;

  @Prop({
    required: true,
    enum: ['Feminino', 'Masculino'],
  })
  gender: string;

  @Prop({
    type: [String],
    required: true,
    enum: FOOD_RESTRICTIONS,
  })
  foodRestrictions: string[];

  @Prop({
    type: [String],
    default: [],
  })
  otherFoods: string[];

  @Prop({
    required: true,
    min: 1200,
  })
  dailyCalorieGoal: number;

  @Prop({ required: true })
  proteinGoal: number;

  @Prop({ required: true })
  carbsGoal: number;

  @Prop({ required: true })
  fatGoal: number;

  @Prop({
    required: true,
  })
  dailyWaterGoal: number;

  @Prop({
    required: true,
    enum: ['Perda de peso', 'Ganho de massa', 'Manter saúde'],
  })
  goal: string;

  @Prop({
    required: true,
    type: String,
    enum: PHYSICAL_ACTIVITIES,
  })
  physicalActivity: string;

  @Prop({ required: true, default: false })
  lgpdConsent: boolean;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
