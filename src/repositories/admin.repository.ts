import Admin from '../models/adminModel';
import { IAdminDocument } from '../interfaces/admin.interface';
import BaseRepository from './base.repository';



class AdminRepository extends BaseRepository<IAdminDocument> {

    constructor(){
        super(Admin);
    }
    
    // async createUser(user: IAdmin): Promise<IAdmin | null> {
    //     const createdUser = await Admin.create(user);
    //     if (!createdUser) {
    //         throw new Error('Failed to create user');
    //     }
    //     return createdUser; 
    // }

    // async findUserByEmail(email: string): Promise<IAdmin | null> {
    //     return await Admin.findOne({ email });
    // }

    // async findUserById(id: string): Promise<IAdmin | null>{
    //     return await Admin.findById(id);
    // }
}

export default AdminRepository;



