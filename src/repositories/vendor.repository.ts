import Vendor from '../models/vendorModel';
import BaseRepository from '../repositories/base.repository';
import { IVendorDocument } from '../interfaces/vendor.interface';



class VendorRepository extends BaseRepository<IVendorDocument>{

    constructor(){
        super(Vendor);
    }


    async block(vendorId: string): Promise<IVendorDocument | null> {
        return await Vendor.findByIdAndUpdate(vendorId, { isBlocked: true }, {new:true});
    }
    
    async unblock(vendorId: string): Promise<IVendorDocument | null> {
        return await Vendor.findByIdAndUpdate(vendorId, { isBlocked: false }, {new:true});
    }
    

    
}

export default VendorRepository;



