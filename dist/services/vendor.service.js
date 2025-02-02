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
const emailSend_1 = require("../utils/emailSend");
class VendorService {
    constructor(_vendorRepository) {
        this._vendorRepository = _vendorRepository;
    }
    getVendor(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const vendor = yield this._vendorRepository.getById(id);
            if (!vendor) {
                return null;
            }
            return vendor;
        });
    }
    // async getNotifications(userId: string): Promise<INotification[] | null>{
    //     const notifications = await this._notificationrepository.getAllByFilter({ userId });
    //     return notifications;
    // }
    updateVendor(vendorId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedData = yield this._vendorRepository.update({ _id: vendorId }, data);
            return updatedData;
        });
    }
    otpSendForUpdateEmail(user, email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 1. Validate the new email
                const existingVendor = yield this._vendorRepository.getOneByFilter({ email });
                if (existingVendor) {
                    throw new customError_1.ConflictError('Email already in use');
                }
                // 3. Generate OTPs
                const oldEmailOtp = yield (0, emailSend_1.sendOtpByEmail)(user === null || user === void 0 ? void 0 : user.email);
                const newEmailOtp = yield (0, emailSend_1.sendOtpByEmail)(email);
                const vendor = yield this._vendorRepository.update({ _id: user.id }, { otp: oldEmailOtp, otpTimestamp: new Date(),
                    newotp: newEmailOtp, newotpTimestamp: new Date()
                });
                console.log(vendor, "vendor");
                return true;
            }
            catch (error) {
                console.error('Error updating vendor email:', error);
                throw new customError_1.BadRequestError('Failed to send OTP! Try again later');
            }
        });
    }
    otpVerifyForEmail(user, formValue) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const currentTime = new Date();
                // Validate old OTP
                if (!(user === null || user === void 0 ? void 0 : user.otp) || !(user === null || user === void 0 ? void 0 : user.otpTimestamp) || (user === null || user === void 0 ? void 0 : user.otp) !== formValue.otpOld) {
                    throw new customError_1.BadRequestError(`Invalid OTP for ${user.email}`);
                }
                // Check if old OTP is expired
                const otpTimestamp = new Date(user === null || user === void 0 ? void 0 : user.otpTimestamp);
                const oldtimeDifferenceInMinutes = (currentTime.getTime() - otpTimestamp.getTime()) / (1000 * 60);
                if (oldtimeDifferenceInMinutes > 2) {
                    throw new customError_1.BadRequestError(`OTP is Expired for ${user.email}`);
                }
                // Validate new OTP
                if (!(user === null || user === void 0 ? void 0 : user.newotp) || !(user === null || user === void 0 ? void 0 : user.newotpTimestamp) || (user === null || user === void 0 ? void 0 : user.newotp) !== formValue.otpNew) {
                    throw new customError_1.BadRequestError(`Invalid OTP for ${formValue.email}`);
                }
                // Check if new OTP is expired
                const newotpTimestamp = new Date(user === null || user === void 0 ? void 0 : user.newotpTimestamp);
                const newtimeDifferenceInMinutes = (currentTime.getTime() - newotpTimestamp.getTime()) / (1000 * 60);
                if (newtimeDifferenceInMinutes > 2) {
                    throw new customError_1.BadRequestError(`OTP is Expired for ${formValue.email}`);
                }
                // Update user in the database
                const detail = yield this._vendorRepository.update({ email: user.email }, {
                    $set: { email: formValue.email },
                    $unset: { otpTimestamp: '', otp: '', newotpTimestamp: '', newotp: '' }
                });
                return detail; // Return success response
            }
            catch (error) {
                console.error("Error during OTP verification for email change:", error);
                throw error;
            }
        });
    }
    passwordChange(user, formValue) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (user.password) {
                    const isMatch = yield bcrypt_1.default.compare(formValue.currentPassword, user.password);
                    if (!isMatch) {
                        throw new customError_1.BadRequestError("Current password is incorrect.");
                    }
                    // Step 2: Ensure the new password and confirm new password match
                    if (formValue.newPassword !== formValue.confirmNewPassword) {
                        throw new customError_1.BadRequestError("New password and confirm password do not match.");
                    }
                }
                // Step 3: Hash the new password
                const salt = yield bcrypt_1.default.genSalt(10);
                const hashedNewPassword = yield bcrypt_1.default.hash(formValue.newPassword, salt);
                // Step 4: Update the password in the database
                const details = yield this._vendorRepository.update({ _id: user._id }, {
                    $set: { password: hashedNewPassword }
                });
                // Step 5: Return success message
                return details;
            }
            catch (error) {
                console.error("Error changing password:", error);
                if (error instanceof customError_1.BadRequestError)
                    throw error;
                else
                    throw new customError_1.BadRequestError("Failed to change password. Please try again.");
            }
        });
    }
}
exports.default = VendorService;
/*
private async createUser(user: IVendorData): Promise<any> {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password as string, salt);
        // Convert the plain object to a Mongoose document
        return await this._vendorRepository.create({ ...user, password: hashedPassword });
    }

    private async comparePassword(enteredPassword: string, password: string){
        return await bcrypt.compare(enteredPassword, password);
    }

    async getUserById(id: string): Promise<IVendorDocument | null>{
        return await this._vendorRepository.getById(id);
    }

    async signupUser(user: IVendor): Promise<boolean> {
        const existingUser = await this._vendorRepository.getByEmail(user.email);

        if (existingUser) {
            if(existingUser?.isVerified){
                throw new ConflictError("Email already exists");
            } else {
                await this._vendorRepository.delete(existingUser.id!);
            }
        }
        const otp = await sendOtpByEmail(user?.email);
        // Save OTP in database or in-memory store for verification
        await this.createUser({ ...user, otp, otpTimestamp: new Date() });
        return true;
    }

    async otpVerification(email: string, otp: string): Promise<boolean> {
        const user = await this._vendorRepository.getByEmail(email);
        
        if(user && user?.isVerified) throw new ConflictError('User Already Exist!');
        
        if (!user?.otp || !user?.otpTimestamp || user?.otp !== otp) {
            throw new BadRequestError("Invalid OTP");
        }

        const currentTime = new Date();
        const otpTimestamp = new Date(user?.otpTimestamp);
        const timeDifferenceInMinutes = (currentTime.getTime() - otpTimestamp.getTime()) / (1000 * 60);
        
        if (timeDifferenceInMinutes > 2) throw new BadRequestError("OTP is Expired"); // OTP expired
        
        // Update user in database
        await this._vendorRepository.update({email},  {
            $set: { isVerified: true },
            $unset: { otpTimestamp: '', otp: '' }
        });
        await welcomeEmail(email);

        const notificationDocument = {
            userId: user.id,
            userType: 'Vendor',
            message: `Welcome to our platform! Your account has been created successfully.`,
            isRead: false,
            notificationType: NotificationType.SIGNUP
        };

        await this._notificationrepository.create(notificationDocument);
        return true;
    }


    async resendOTP(email: string): Promise<boolean> {
        const user = await this._vendorRepository.getByEmail(email);
      
        if (user) {
            if(user?.isVerified){
                throw new ConflictError('User is already verified');
            }
        } else {
            throw new UnauthorizedError('User not found')
        }
        const otp = await sendOtpByEmail(user?.email);
        await this._vendorRepository.update({email},  {
            $set: { otp , otpTimestamp: new Date() },
        });
        return true;
    }


    async loginUser(email: string, password: string): Promise<{accessToken: string ,refreshToken: string, vendor: IVendor}>{
        const user = await this._vendorRepository.getOneByFilter({ email }) as IVendorDocument;
        
        if(user && user?.isBlocked) throw new ForbiddenError('User is blocked');

        if(user && user?.isVerified && user?.password && await this.comparePassword(password, user?.password)){
            const accessToken = generateVendorToken(user.id!, user.role!)
            const refreshToken = generateRefreshVendorToken(user.id!, user.role!)
            const vendor = this.extractUserData(user);
            return { accessToken, refreshToken, vendor };
        } else {
            throw new UnauthorizedError('Invalid email or password')
        }
    }

    extractUserData(user: IVendorDocument){
        const extracted = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            ...(user?.serviceName && { serviceName: user?.serviceName }),
            vendorType: user.vendorType,
            role: user.role,
            ...(user?.mobile && { mobile: user.mobile })
        };
        return extracted;
    }
        async getAllVendors(
        page: number,
        limit: number
      ): Promise<{ vendors: IVendor[]; totalCount: number, totalPages: number }> {
        try {
          const skip = (page - 1) * limit;
          let filterQuery: Record<string, any> = {}; // Add your custom filter logic here
      
          const pipeline = [
            {
              $match: filterQuery, // Match your filter query first
            },
            {
              $lookup: {
                from: 'addresses', // Join with 'addresses' collection
                localField: 'address',
                foreignField: '_id',
                as: 'address',
              },
            },
            {
              $facet: {
                vendors: [
                  { $skip: skip }, // Skip the documents based on the page number
                  { $limit: limit }, // Limit the number of documents returned
                  {
                    $project: {
                      firstName: 1,
                      lastName: 1,
                      vendorType: 1,
                      address: 1,
                      role: 1,
                      email: 1,
                      mobile: 1,
                      isVerified: 1,
                      isBlocked: 1,
                      createdAt: 1,
                    },
                  },
                ],
                totalCount: [
                  { $count: 'count' }, // Count total documents matching the query
                ],
              },
            },
          ];
      
          // Execute the aggregation pipeline
          const result = await this._vendorRepository.getAggregateData(pipeline) ?? [];
      
          // Extract customers and totalCount from the result
          const vendors = result[0]?.vendors || [];
          const totalCount = result[0]?.totalCount[0]?.count || 0; // Ensure default value in case it's missing
          const totalPages = Math.ceil(totalCount/ limit);

          console.log(vendors)
          return { vendors, totalCount, totalPages };
        } catch (error) {
          console.error('Error fetching paginated customers:', error);
          throw error;
        }
    }
        
    async blockUser(id: string): Promise<IVendor | null> {
        return await this._vendorRepository.block(id);
    }

    async unblockUser(id: string): Promise<IVendor | null> {
        return await this._vendorRepository.unblock(id);
    }
*/ 
