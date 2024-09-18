import { Schema } from "mongoose";
import { Status } from "../utils/status-options";


const eventDateSchema: Schema = new Schema({
    startDate: { type: Date, required: true },
    endDate: { 
        type: Date, 
        required: true
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
})


const paymentSchema: Schema = new Schema({
    type: { type: String, required: true, enum: ['Platform Fee', 'Advance Payment', 'Full Payment']},
    amount: { type: Number, required: true },
    status: { 
        type: String, 
        required: true, 
        enum: [Status.Pending, Status.Paid, Status.Failed, Status.Cancelled],
        default: Status.Pending
    },
    mode: { type: String, required: true, enum: ['Razorpay'] },
    paymentInfo: { type: Schema.Types.Mixed, required: true } , 
}, { timestamps: true })


export {
    eventDateSchema,
    paymentSchema
}