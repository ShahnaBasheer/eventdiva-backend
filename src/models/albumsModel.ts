import { IAlbumDocument } from "interfaces/album.interface";
import mongoose, { Schema } from "mongoose";



const AlbumSchema: Schema = new Schema(
    {   vendorId: {
            type: Schema.Types.ObjectId,
            ref: 'Vendor', 
            required: true 
        },
        eventTitle: {
          type: String,
          required: true,
          trim: true
        },
        eventType: {
          type: String,
          required: true,
          enum: ["Wedding", "Corporate Event", "Social Event", "Themed Event", "Destination Event", "Other"] // Predefined project categories with an option for customization
        },
        place: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
          trim: true
        },
        images: {
          type: [String],
          trim: true
        }
    },
    { timestamps: true }  
)






  const Album = mongoose.model<IAlbumDocument>('Album', AlbumSchema);

  export default Album