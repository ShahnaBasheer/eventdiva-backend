import { Schema } from 'mongoose';



export interface IReview {
    customerId: Schema.Types.ObjectId;
    itemId: Schema.Types.ObjectId;
    itemType: string;
    rating: number;
    comment?: string;
    createdAt: Date;
    updatedAt: Date;
}

export default IReview;
