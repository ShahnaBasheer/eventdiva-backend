import EventPlanner from '../models/eventPlannerModel';
import { IEventPlanner, IEventPlannerDocument  } from '../interfaces/eventPlanner.interface';
import BaseRepository from './base.repository';
import { Filter } from 'interfaces/utilities.interface';



class EventPlannerRepository extends BaseRepository<IEventPlannerDocument> {

    constructor(){
        super(EventPlanner);
    }


    async getPlannerDetail(filter: Filter): Promise<IEventPlanner | null> {
        return await EventPlanner.findOne({ ...filter, isDeleted: false })
        .populate('address').exec();
    }

    async getPlanner(filter: Filter): Promise<IEventPlanner | null>{
        return await EventPlanner.findOne({ ...filter }).populate('address').exec()
    }
    
}

export default EventPlannerRepository;



