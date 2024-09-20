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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const customError_1 = require("../errors/customError");
const jwToken_1 = require("../config/jwToken");
const admin_repository_1 = __importDefault(require("../repositories/admin.repository"));
const customer_repository_1 = __importDefault(require("../repositories/customer.repository"));
const vendor_repository_1 = __importDefault(require("../repositories/vendor.repository"));
const plannerBooking_repository_1 = __importDefault(require("../repositories/plannerBooking.repository"));
const venueBooking_repository_1 = __importDefault(require("../repositories/venueBooking.repository"));
class AdminService {
    constructor() {
        this.adminRepository = new admin_repository_1.default();
        this.customerRepository = new customer_repository_1.default();
        this.vendorRepository = new vendor_repository_1.default();
        this._plannerBookingrepository = new plannerBooking_repository_1.default();
        this._venueBookingrepository = new venueBooking_repository_1.default();
    }
    createUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const salt = yield bcrypt_1.default.genSalt(10);
            const hashedPassword = yield bcrypt_1.default.hash(user.password, salt);
            // Convert the plain object to a Mongoose document
            return yield this.adminRepository.create(Object.assign(Object.assign({}, user), { password: hashedPassword }));
        });
    }
    comparePassword(enteredPassword, password) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bcrypt_1.default.compare(enteredPassword, password);
        });
    }
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.adminRepository.getById(id);
        });
    }
    loginUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.adminRepository.getOneByFilter({ email });
            if (user && (user === null || user === void 0 ? void 0 : user.password) && (yield this.comparePassword(password, user === null || user === void 0 ? void 0 : user.password))) {
                const accessToken = (0, jwToken_1.generateAdminToken)(user.id, user.role);
                const refreshToken = (0, jwToken_1.generateRefreshAdminToken)(user.id, user.role);
                const admin = this.extractUserData(user);
                console.log(admin, "knnkkn");
                return { accessToken, refreshToken, admin };
            }
            else {
                throw new customError_1.UnauthorizedError('Invalid email or password');
            }
        });
    }
    signupAdmin(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield this.adminRepository.getOneByFilter({ email: user.email });
            if (existingUser) {
                throw new customError_1.ConflictError("Email already exists");
            }
            yield this.createUser(user);
            return true;
        });
    }
    extractUserData(user) {
        const extracted = {
            fullName: user.fullName,
            email: user.email,
            role: user.role,
        };
        return extracted;
    }
    getDashboardData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const totalUsers = yield this.customerRepository.getCount();
                const totalVendors = yield this.vendorRepository.getCount();
                const totalPlannerBookings = yield this._plannerBookingrepository.getCount();
                const totalVenueBookings = yield this._venueBookingrepository.getCount();
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
