import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IComplaintDocument extends Document {
  student: Types.ObjectId | string;
  room: Types.ObjectId | string;
  text: string;
  status: 'Pending' | 'Resolved';
  createdAt: Date;
  updatedAt: Date;
}

export const ComplaintSchema = new Schema<IComplaintDocument>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room reference is required'],
    },
    text: {
      type: String,
      required: [true, 'Complaint text is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Resolved'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

export const Complaint: Model<IComplaintDocument> =
  mongoose.models.Complaint || mongoose.model<IComplaintDocument>('Complaint', ComplaintSchema);

export default Complaint;
