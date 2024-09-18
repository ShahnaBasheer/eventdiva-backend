import mongoose, { Document } from "mongoose";



interface IAlbum {
    vendorId: mongoose.Types.ObjectId;
    eventTitle: string;
    eventType: "Wedding" | "Corporate Event" | "Social Event" | "Themed Event" | "Destination Event" | "Other";
    place: string;
    description: string;
    images: string[];
    createdAt?: Date;
    updatedAt?: Date;
}


interface IAlbumDocument extends IAlbum, Document {}

export { 
    IAlbum, 
    IAlbumDocument
};
