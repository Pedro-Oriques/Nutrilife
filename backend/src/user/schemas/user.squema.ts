
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ collection: 'users', timestamps: true })
export class User {
  @Prop({ required: true, maxLength: 100 })
  fullName: string;

  @Prop({ required: false, default: 'user', enum: ['user', 'admin'] })
  role: string;

  @Prop({
    required: true,
    unique: true,
    maxLength: 50,
    lowercase: true,
    trim: true,
    match: /^([^\s@]+)@((?:[^\s@]+\.)+[^\s@]+)$/,
  })
  email: string;

  @Prop({ required: false })
  secretQuestion?: string;

  @Prop({ required: false, trim: true })
  secretAnswer?: string;

  @Prop({ required: true })
  password: string;

  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
