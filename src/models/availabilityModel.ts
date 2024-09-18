import { IAvailabilityDocument, Slot } from '../interfaces/availability.interface';
import mongoose, { Schema  } from 'mongoose';




// Slot schema
const SlotSchema: Schema<Slot> = new mongoose.Schema({
    startTime: { 
        type: String, 
        required: true 
    }, 
    endTime: { 
        type: String, 
        required: true 
    }, 
    isExternal: {
        type: Boolean,
        default: false
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,  
        refPath: 'bookingType',  // Dynamic reference based on bookingType field
        required: function() {
            return !this.isExternal;
        } 
    },
    externalBookingDetails: {
        type: new mongoose.Schema({
            customerName: { type: String }, 
            eventName: { type: String }, 
            place: { type: String }, 
        }, { _id: false }), // Disable _id for subdocument
        required: function(this: Slot) {
            return this.isExternal;
        }
    }
},{ timestamps: true,  _id: false });



// Availability schema
const AvailabilitySchema: Schema = new mongoose.Schema({
    vendorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Vendor', 
        required: true,
        unique: true 
    },
    maxEvents: { 
        type: Number, 
        required: true
    },
    bookingType: {
        type: String,
        enum: ['VenueBooking', 'EventPlannerBooking'],
        required: true
    },
    bookedDates: {
        type: [{
            date: {
                type: Date,
                required: true
            },
            slots: {
                type: [SlotSchema],
            }
        }],
    },
    holyDays: [{
        type: Date,
    }]
}, { timestamps: true });

// // Pre-save middleware for custom validation
// AvailabilitySchema.pre<Availability>('save', function(next) {
//     try {
//         const dateStrings = this.bookedDates.map(dateSlot => dateSlot.date.toISOString());
//         const uniqueDateStrings = new Set(dateStrings);
    
//         if (dateStrings.length !== uniqueDateStrings.size) {
//             throw new Error('Duplicate dates found in bookedDates array!');
//         }

//         next();
//     } catch (error: any) {
//         next(error);
//     }
// });

const Availability = mongoose.model<IAvailabilityDocument>('Availability', AvailabilitySchema);

export default Availability;


// type: mongoose.Schema.Types.ObjectId, 
//         refPath: 'bookingType', // Dynamic reference based on bookingType field
//         required: function() {
//             return !this.isExternal;
//         } 