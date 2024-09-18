import { IAdminDocument } from '../interfaces/admin.interface';
import mongoose, { Schema } from 'mongoose';


// Define the Admin schema
const adminSchema: Schema<IAdminDocument> = new Schema({
    fullName: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: 'admin',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  },{ timestamps: true }
);

const Admin = mongoose.model<IAdminDocument>('Admin', adminSchema);

export default Admin;