import { IcustomerDocument } from '../interfaces/user.interface';
import Customer from '../models/customerModel';
import BaseRepository from './base.repository';



class CustomerRepository extends BaseRepository<IcustomerDocument> {
    
    constructor(){
        super(Customer);
    }
    
}

export default CustomerRepository;



