import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../user/schemas/user.squema'; // Ajuste o caminho se necessário

export type WaterDocument = Water & Document;

@Schema({ collection: 'water_tracking', timestamps: true })
export class Water {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true, default: 0 })
  consumedMl: number;
}

export const WaterSchema = SchemaFactory.createForClass(Water);
