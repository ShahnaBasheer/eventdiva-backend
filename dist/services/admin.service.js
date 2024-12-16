"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const customError_1 = require("../errors/customError");
class AdminService {
    constructor(_adminRepository, _customerRepository, _vendorRepository, _plannerBookingrepository, _venueBookingrepository) {
        this._adminRepository = _adminRepository;
        this._customerRepository = _customerRepository;
        this._vendorRepository = _vendorRepository;
        this._plannerBookingrepository = _plannerBookingrepository;
        this._venueBookingrepository = _venueBookingrepository;
    }
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._adminRepository.getById(id);
        });
    }
    getRepositoryByRole(role) {
        if (role === 'vendor')
            return this._vendorRepository;
        if (role === 'customer')
            return this._customerRepository;
        throw new customError_1.BadRequestError('Invalid role');
    }
    blockUser(userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!role || !userId) {
                throw new customError_1.UnauthorizedError("userId and role must be provided");
            }
            const repository = this.getRepositoryByRole(role);
            return yield repository.block(userId);
        });
    }
    unblockUser(userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!role || !userId) {
                throw new customError_1.UnauthorizedError("userId and role must be provided");
            }
            const repository = this.getRepositoryByRole(role);
            return yield repository.unblock(userId);
        });
    }
    getDashboardData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const totalUsers = yield this._customerRepository.getCount({});
                const totalVendors = yield this._vendorRepository.getCount({});
                const totalPlannerBookings = yield this._plannerBookingrepository.getCount({});
                const totalVenueBookings = yield this._venueBookingrepository.getCount({});
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
                            status: "$_id", // Project the status field from _id
                            count: 1 // Include the count field
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
                            status: "$_id", // Project the status field from _id
                            count: 1 // Include the count field
                        }
                    }
                ];
                const allVenueBookings = yield this._venueBookingrepository.getAggregateData(venuebookingStatusPipeline);
                const allPlannerBookings = yield this._plannerBookingrepository.getAggregateData(plannerbookingStatusPipeline);
                return ({
                    totalUsers, totalVendors,
                    totalPlannerBookings, totalVenueBookings,
                    allPlannerBookings, allVenueBookings,
                });
            }
            catch (error) {
                console.error('Error fetching dashboard data:', error);
                throw new customError_1.BadRequestError('Failed to Fetch Dashboard Details! Try again Later!');
            }
        });
    }
}
exports.default = AdminService;
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
