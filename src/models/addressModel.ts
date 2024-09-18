import mongoose, { Schema, Document, } from 'mongoose';
import { IAddressDocument } from '../interfaces/address.interface';


// Define the Address schema
const addressSchema: Schema = new Schema(
  {
    building: {
        type: String, 
        required: true 
    },
    street: {
        type: String, 
    },
    city: { 
        type: String, 
        required: true 
    },
    town: { 
        type: String, 
    },
    district: { 
        type: String, 
        required: true 
    },
    state: { 
        type: String, 
        required: true 
    },
    landmark: {
        type: String, 
    },
    pincode: {
        type: Number, 
        required: true 
    },
  },
  {
    timestamps: true, // This automatically adds `createdAt` and `updatedAt` fields
  }
);

const Address = mongoose.model<IAddressDocument>('Address', addressSchema);

export default  Address