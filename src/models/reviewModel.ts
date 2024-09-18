

import mongoose, { Schema, Document } from 'mongoose';
import IReview from '../interfaces/review.interface';

const reviewSchema: Schema = new Schema(
    {
        customerId: { 
            type: Schema.Types.ObjectId, 
            ref: 'Customer', 
            required: true 

        },
        itemId: { 
            type: Schema.Types.ObjectId, 
            required: true 

        },
        itemType: { 
            type: String, 
            required: true 

        },
        rating: { 
            type: Number, 
            required: true 

        },
        comment: { 
            type: String 

        },
    },
    { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

const Review = mongoose.model<IReview & Document>('Review', reviewSchema);

export default Review;
