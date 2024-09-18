import Vendor from '../models/vendorModel';
import BaseRepository from '../repositories/base.repository';
import { IVendor, IVendorDocument } from '../interfaces/vendor.interface';



class VendorRepository extends BaseRepository<IVendorDocument>{

    constructor(){
        super(Vendor);
    }


    async getVendor(id: string){
        return await Vendor.findById(id).exec(); 
    }
    
    

    
}

export default VendorRepository;



