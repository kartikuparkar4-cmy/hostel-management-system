import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IRoomDocument extends Document {
  number: string;
  occupants: (Types.ObjectId | string)[];
  createdAt: Date;
  updatedAt: Date;
}

export const RoomSchema = new Schema<IRoomDocument>(
  {
    number: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
    },
    occupants: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      validate: [
        {
          validator: (arr: Types.ObjectId[]) => arr.length <= 2,
          message: 'Room capacity cannot exceed 2 students',
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Room: Model<IRoomDocument> =
  mongoose.models.Room || mongoose.model<IRoomDocument>('Room', RoomSchema);

export default Room;
