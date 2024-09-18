import BaseRepository from './base.repository';
import { IAvailabilityDocument } from '../interfaces/availability.interface';
import Availability from '../models/availabilityModel';
import { Filter } from 'interfaces/utilities.interface';



class AvailabilityRepository extends BaseRepository<IAvailabilityDocument> {

    constructor(){
        super(Availability);
    }

    async findOneByFilter(filter: Filter){
        return await Availability.findOne({ ...filter })
        .populate({
            path: 'bookedDates.slots.bookingId',
        })
        .exec();
    }


}

export default AvailabilityRepository;



