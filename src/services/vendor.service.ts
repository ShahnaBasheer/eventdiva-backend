import bcrypt from 'bcrypt';
import { BadRequestError, ConflictError, ForbiddenError, UnauthorizedError } from "../errors/customError";
import { IVendor, IVendorDocument } from '../interfaces/vendor.interface';
import VendorRepository from '../repositories/vendor.repository';
import { sendOtpByEmail, welcomeEmail } from '../utils/emailSend';
import { generateRefreshVendorToken, generateVendorToken } from '../config/jwToken';
import NotificationRepository from '../repositories/notification.repository';
import { INotification } from '../interfaces/notification.interface';
import { NotificationType } from '../utils/eventsVariables';



class VendorService {
    private _vendorRepository!: VendorRepository;
    private _notificationrepository: NotificationRepository;

    constructor() {
        this._vendorRepository = new VendorRepository();
        this._notificationrepository = new NotificationRepository();
    }

    private async createUser(user: IVendor): Promise<any> {
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

    async getVendor(id: string, vendorType: string): Promise<IVendor | null>{
        const vendor = await this._vendorRepository.getVendor(id);
        console.log(vendor?.vendorType, vendorType)
        if(vendor?.vendorType !== vendorType || !vendor){
            return null
        }
        return vendor;
    }


    async getAllVendors(): Promise<IVendor[]> {
        return await this._vendorRepository.getAll({});
    }

    async blockUser(id: string): Promise<IVendor | null> {
        return await this._vendorRepository.block(id);
    }

    async unblockUser(id: string): Promise<IVendor | null> {
        return await this._vendorRepository.unblock(id);
    }

    // async getNotifications(userId: string): Promise<INotification[] | null>{
    //     const notifications = await this._notificationrepository.getAllByFilter({ userId });
    //     return notifications;
    // }
    
}



export default VendorService;
