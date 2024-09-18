"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentSchema = exports.eventDateSchema = void 0;
const mongoose_1 = require("mongoose");
const status_options_1 = require("../utils/status-options");
const eventDateSchema = new mongoose_1.Schema({
    startDate: { type: Date, required: true },
    endDate: {
        type: Date,
        required: true
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
});
exports.eventDateSchema = eventDateSchema;
const paymentSchema = new mongoose_1.Schema({
    type: { type: String, required: true, enum: ['Platform Fee', 'Advance Payment', 'Full Payment'] },
    amount: { type: Number, required: true },
    status: {
        type: String,
        required: true,
        enum: [status_options_1.Status.Pending, status_options_1.Status.Paid, status_options_1.Status.Failed, status_options_1.Status.Cancelled],
        default: status_options_1.Status.Pending
    },
    mode: { type: String, required: true, enum: ['Razorpay'] },
    paymentInfo: { type: mongoose_1.Schema.Types.Mixed, required: true },
}, { timestamps: true });
exports.paymentSchema = paymentSchema;
