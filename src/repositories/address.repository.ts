import { IAddressDocument } from 'interfaces/address.interface';
import Address from '../models/addressModel';
import BaseRepository from './base.repository';



class AddressRepository extends BaseRepository<IAddressDocument> {

    constructor(){
        super(Address);
    }
    
}

export default AddressRepository;



