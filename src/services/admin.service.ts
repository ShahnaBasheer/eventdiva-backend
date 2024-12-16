import bcrypt from 'bcrypt';
import { BadRequestError, ConflictError, UnauthorizedError } from "../errors/customError";
import { generateAdminToken, generateRefreshAdminToken } from "../config/jwToken";
import { IAdmin, IAdminData, IAdminDocument} from "../interfaces/admin.interface";
import AdminRepository from "../repositories/admin.repository";
import CustomerRepository from '../repositories/customer.repository';
import VendorRepository from '../repositories/vendor.repository';
import PlannerBookingRepository from '../repositories/plannerBooking.repository';
import VenueBookingRepository from '../repositories/venueBooking.repository';
import { UserRole, VCDocType } from 'utils/important-variables';



class AdminService {
   

    constructor(
        private _adminRepository: AdminRepository,
        private _customerRepository: CustomerRepository,
        private _vendorRepository: VendorRepository,
        private _plannerBookingrepository: PlannerBookingRepository,
        private _venueBookingrepository: VenueBookingRepository,
        
    ) {}

    async getUserById(id: string): Promise<IAdminDocument | null>{
        return await this._adminRepository.getById(id);
    }

  
    private getRepositoryByRole(role: UserRole) {
        if (role === 'vendor') return this._vendorRepository;
        if (role === 'customer') return this._customerRepository;
        throw new BadRequestError('Invalid role');
    }
    async blockUser(userId: string, role: UserRole): Promise<VCDocType | null> {
        if (!role || !userId) {
            throw new UnauthorizedError("userId and role must be provided");
        }
        const repository = this.getRepositoryByRole(role);
        return await repository.block(userId);
    }
      
    async unblockUser(userId: string, role: UserRole): Promise<VCDocType | null> {
        if (!role || !userId) {
            throw new UnauthorizedError("userId and role must be provided");
        }
        const repository = this.getRepositoryByRole(role);
        return await repository.unblock(userId);
    }

    async getDashboardData(): Promise<any>{
        try {
            const totalUsers = await this._customerRepository.getCount({});
            const totalVendors = await this._vendorRepository.getCount({});
            const totalPlannerBookings = await this._plannerBookingrepository.getCount({});
            const totalVenueBookings = await this._venueBookingrepository.getCount({});
            // const allPlannerBookings = await this._plannerBookingrepository.find({ type: 'planner' });
            // const allVenueBookings = await this._venueBookingrepository.find({ type: 'venue' });
        

            const venuebookingStatusPipeline = [
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                      _id: 0, 
                      status: "$_id",        // Project the status field from _id
                      count: 1               // Include the count field
                    }
                  }
            ];

            const plannerbookingStatusPipeline = [
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                      _id: 0, 
                      status: "$_id",        // Project the status field from _id
                      count: 1               // Include the count field
                    }
                  }
            ];

            const allVenueBookings = await this._venueBookingrepository.getAggregateData(venuebookingStatusPipeline);
            const allPlannerBookings = await this._plannerBookingrepository.getAggregateData(plannerbookingStatusPipeline);

            return ({
                totalUsers, totalVendors,
                totalPlannerBookings, totalVenueBookings,
                allPlannerBookings, allVenueBookings,
            });
          } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw new BadRequestError('Failed to Fetch Dashboard Details! Try again Later!')
          }
    }


    
}



export default AdminService;



// async loginUser(email: string, password: string): Promise<any>{
//     const user = await this._adminRepository.getOneByFilter({ email });
   
//     if(user && user?.password && await this.comparePassword(password, user?.password)){
//         const accessToken = generateAdminToken(user.id!, user.role!)
//         const refreshToken = generateRefreshAdminToken(user.id!, user.role!)
//         const admin = this.extractUserData(user);
//         return { accessToken, refreshToken, admin };
//     } else {
//         throw new UnauthorizedError('Invalid email or password') 
//     }
// }

// async signupAdmin(user: IAdmin): Promise<boolean> {
//     const existingUser = await this._adminRepository.getOneByFilter({email: user.email});
//     if (existingUser) {
//         throw new ConflictError("Email already exists");
//     } 
//     await this.createUser(user);
//     return true;
// }


// extractUserData(user: IAdmin){
//     const extracted = {
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//         role: user.role,
//     };
//     return extracted;
// }
    // private async createUser(user: IAdminData): Promise<IAdmin> {
    //     const salt = await bcrypt.genSalt(10);
    //     const hashedPassword = await bcrypt.hash(user.password as string, salt);
    //     // Convert the plain object to a Mongoose document
    //     return await this._adminRepository.create({ ...user, password: hashedPassword });
    // }

    // private async comparePassword(enteredPassword: string, password: string){
    //     return await bcrypt.compare(enteredPassword, password);
    // }
