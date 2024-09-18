import BaseRepository from './base.repository';
import { Filter } from 'interfaces/utilities.interface';
import Venue from '../models/venueModel';
import { IVenue, IVenueDocument } from 'interfaces/venue.interface';



class VenueVendorRepository extends BaseRepository<IVenueDocument> {

    constructor(){
        super(Venue);
    }


    async getVenueDetail(filter: Filter): Promise<IVenue | null> {
        return await Venue.findOne({ ...filter, isDeleted: false })
          .populate('address').exec();
    }

    async getVenue(filter: Filter): Promise<IVenue | null>{
        return await Venue.findOne({ ...filter }).populate('address').exec()
    }
    
}

export default VenueVendorRepository;
