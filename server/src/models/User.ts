import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type Role = 'student' | 'admin';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  targetRole: string;
  experienceLevel: 'fresher' | '1-3 years' | '3+ years';
  streakCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['student', 'admin'], default: 'student', required: true },
    targetRole: { type: String, default: 'Full Stack Developer', trim: true },
    experienceLevel: {
      type: String,
      enum: ['fresher', '1-3 years', '3+ years'],
      default: 'fresher',
    },
    streakCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

userSchema.methods.toSafeJSON = function toSafeJSON(this: IUser) {
  return {
    id: String(this._id),
    name: this.name,
    email: this.email,
    role: this.role,
    targetRole: this.targetRole,
    experienceLevel: this.experienceLevel,
    streakCount: this.streakCount,
  };
};

export const User = mongoose.model<IUser>('User', userSchema);
