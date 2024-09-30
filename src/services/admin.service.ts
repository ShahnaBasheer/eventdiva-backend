import bcrypt from 'bcrypt';
import { BadRequestError, ConflictError, UnauthorizedError } from "../errors/customError";
import { generateAdminToken, generateRefreshAdminToken } from "../config/jwToken";
import { IAdmin, IAdminDocument} from "../interfaces/admin.interface";
import AdminRepository from "../repositories/admin.repository";
import CustomerRepository from '../repositories/customer.repository';
import VendorRepository from '../repositories/vendor.repository';
import PlannerBookingRepository from '../repositories/plannerBooking.repository';
import VenueBookingRepository from '../repositories/venueBooking.repository';



class AdminService {
    private adminRepository!: AdminRepository;
    private customerRepository!: CustomerRepository;
    private vendorRepository!: VendorRepository;
    private _plannerBookingrepository: PlannerBookingRepository;
    private _venueBookingrepository: VenueBookingRepository;
    

    constructor() {
        this.adminRepository = new AdminRepository();
        this.customerRepository = new CustomerRepository();
        this.vendorRepository = new VendorRepository();
        this._plannerBookingrepository = new PlannerBookingRepository();
        this._venueBookingrepository = new VenueBookingRepository();
    }

    private async createUser(user: IAdmin): Promise<IAdmin> {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password as string, salt);
        // Convert the plain object to a Mongoose document
        return await this.adminRepository.create({ ...user, password: hashedPassword });
    }

    private async comparePassword(enteredPassword: string, password: string){
        return await bcrypt.compare(enteredPassword, password);
    }

    async getUserById(id: string): Promise<IAdminDocument | null>{
        return await this.adminRepository.getById(id);
    }

    async loginUser(email: string, password: string): Promise<any>{
        const user = await this.adminRepository.getOneByFilter({ email });
       
        if(user && user?.password && await this.comparePassword(password, user?.password)){
            const accessToken = generateAdminToken(user.id!, user.role!)
            const refreshToken = generateRefreshAdminToken(user.id!, user.role!)
            const admin = this.extractUserData(user);
            console.log(admin,"knnkkn")
            return { accessToken, refreshToken, admin };
        } else {
            throw new UnauthorizedError('Invalid email or password') 
        }
    }

    async signupAdmin(user: IAdmin): Promise<boolean> {
        const existingUser = await this.adminRepository.getOneByFilter({email: user.email});
        if (existingUser) {
            throw new ConflictError("Email already exists");
        } 
        await this.createUser(user);
        return true;
    }


    extractUserData(user: IAdmin){
        const extracted = {
            fullName: user.fullName,
            email: user.email,
            role: user.role,
        };
        return extracted;
    }

    async getDashboardData(): Promise<any>{
        try {
            const totalUsers = await this.customerRepository.getCount({});
            const totalVendors = await this.vendorRepository.getCount({});
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
