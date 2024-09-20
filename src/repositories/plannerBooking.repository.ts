import BaseRepository from './base.repository';;
import { Filter } from '../interfaces/utilities.interface';
import EventPlannerBooking from '../models/eventPlannerBookingModel';
import { IEventPlannerBooking, IEventPlannerBookingDocument } from '../interfaces/eventPlannerBooking.interface';



class PlannerBookingRepository extends BaseRepository<IEventPlannerBookingDocument> {

    constructor(){
        super(EventPlannerBooking);
    }


    async registerBooking(data: IEventPlannerBooking): Promise<IEventPlannerBooking | null> {
        const booking =  await EventPlannerBooking.create(data);
        if (!booking) {
            throw new Error('Failed to register booking');
        }
        return booking;
    }

    async getOne(filter: Filter){
        return await EventPlannerBooking.findOne({ ...filter })
           .populate('address')
           .populate('eventPlannerId')
           .exec();
    }

    async getAllBookings(filter: Filter){
        return await EventPlannerBooking.find({ ...filter })
           .populate('address')
           .populate('eventPlannerId')
           .populate('customerId')
           .exec();
    }

    async getBookings(filter: Filter){
        return await EventPlannerBooking.find({ ...filter })
           .populate('address')
           .populate('eventPlannerId')
           .sort({ createdAt: -1 }) 
           .exec();
    }

    async getOneBooking(filter: Filter): Promise<IEventPlannerBooking | null>{
        return await EventPlannerBooking.findOne({ ...filter })
           .populate('address')
           .populate('eventPlannerId')
           .populate('customerId')
           .exec();
    }
    
}

export default PlannerBookingRepository;
