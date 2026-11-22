import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IBookmark extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  questionId: Types.ObjectId;
  createdAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

bookmarkSchema.index({ userId: 1, questionId: 1 }, { unique: true });

export const Bookmark = mongoose.model<IBookmark>('Bookmark', bookmarkSchema);
