import { ICustomerDocument } from '../interfaces/customer.interface';
import Customer from '../models/customerModel';
import BaseRepository from './base.repository';



class CustomerRepository extends BaseRepository<ICustomerDocument> {
    
    constructor(){
        super(Customer);
    }

    async block(vendorId: string): Promise<ICustomerDocument | null> {
        return await Customer.findByIdAndUpdate(vendorId, { isBlocked: true }, {new:true});
    }
    
    async unblock(vendorId: string): Promise<ICustomerDocument | null> {
        return await Customer.findByIdAndUpdate(vendorId, { isBlocked: false }, {new:true});
    }
    
}

export default CustomerRepository;



