import BaseRepository from './base.repository';;
import VenueBooking from '../models/venueBookingModel';
import { IVenueBooking, IVenueBookingDocument } from '../interfaces/venueBooking.interface';
import { Filter } from 'interfaces/utilities.interface';



class VenueBookingRepository extends BaseRepository<IVenueBookingDocument> {

    constructor(){
        super(VenueBooking);
    }


    async registerBooking(data: IVenueBooking): Promise<IVenueBooking | null> {
        const booking =  await VenueBooking.create(data);
        if (!booking) {
            throw new Error('Failed to register booking');
        }
        return booking;
    }

    async getOne(filter: Filter){
        return await VenueBooking.findOne({ ...filter })
           .populate('address')
           .populate('venueId')
           .exec();
    }

    async getAllBookings(filter: Filter, skip: number = 0, limit: number = 0){
        return await VenueBooking.find({ ...filter })
           .populate('address')
           .populate('venueId')
           .populate('customerId')
           .skip(skip) 
           .limit(limit) 
           .exec();
    }

    async getBookings(filter: Filter){
        return await VenueBooking.find({ ...filter })
           .populate('address')
           .populate('venueId')
           .sort({ createdAt: -1 }) 
           .exec();
    }

    async getOneBooking(filter: Filter): Promise<IVenueBooking | null>{
        return await VenueBooking.findOne({ ...filter })
           .populate('address')
           .populate('venueId')
           .populate('customerId')
           .exec();
    }
    
}

export default VenueBookingRepository;
