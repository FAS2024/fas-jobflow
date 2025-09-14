import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  REQUESTER = 'REQUESTER',
  RESOLVER = 'RESOLVER',
  SUPERVISOR = 'SUPERVISOR',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: UserRole.REQUESTER })
  role: UserRole;

  @Prop({ type: String, default: null }) 
  currentRefreshToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
