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

    async updateVendor(vendorId: string, data: any){

        const updatedData = await this._vendorRepository.update({ _id: vendorId }, data);
        return updatedData;
    }

    async otpSendForUpdateEmail(user: IVendorDocument, email: string){
        try {
            // 1. Validate the new email
            const existingVendor = await this._vendorRepository.getOneByFilter({ email });
            if (existingVendor) {
                throw new ConflictError('Email already in use');
            }
    
            // 3. Generate OTPs
            const oldEmailOtp =  await sendOtpByEmail(user?.email);
            const newEmailOtp = await sendOtpByEmail(email);
            
            await this._vendorRepository.update({ _id: user.id }, 
                { otp: oldEmailOtp, otpTimestamp: new Date(),
                  newotp: newEmailOtp, newotpTimestamp: new Date()
                });
                
            return true;
        } catch (error) {
            console.error('Error updating vendor email:', error);
            throw new BadRequestError('Failed to send OTP! Try again later');
        }
    }

    async otpVerifyForEmail(user: IVendorDocument, formValue: { otpOld: string, otpNew: string, email: string }) {
        try {
            const currentTime = new Date();
    
            // Validate old OTP
            if (!user?.otp || !user?.otpTimestamp || user?.otp !== formValue.otpOld) {
                throw new BadRequestError(`Invalid OTP for ${user.email}`);
            }
    
            // Check if old OTP is expired
            const otpTimestamp = new Date(user?.otpTimestamp);
            const oldtimeDifferenceInMinutes = (currentTime.getTime() - otpTimestamp.getTime()) / (1000 * 60);
            if (oldtimeDifferenceInMinutes > 2) {
                throw new BadRequestError(`OTP is Expired for ${user.email}`);
            }
    
            // Validate new OTP
            if (!user?.newotp || !user?.newotpTimestamp || user?.newotp !== formValue.otpNew) {
                throw new BadRequestError(`Invalid OTP for ${formValue.email}`);
            }
    
            // Check if new OTP is expired
            const newotpTimestamp = new Date(user?.newotpTimestamp);
            const newtimeDifferenceInMinutes = (currentTime.getTime() - newotpTimestamp.getTime()) / (1000 * 60);
            if (newtimeDifferenceInMinutes > 2) {
                throw new BadRequestError(`OTP is Expired for ${formValue.email}`);
            }
    
            // Update user in the database
            const detail = await this._vendorRepository.update({ email: user.email }, {
                $set: { email: formValue.email },
                $unset: { otpTimestamp: '', otp: '', newotpTimestamp: '', newotp: '' }
            });
    
            return detail; // Return success response
    
        } catch (error) {
            console.error("Error during OTP verification for email change:", error);
            throw error;
        }
    }

    async passwordChange(user: IVendorDocument, formValue: any) {
        try {
            if(user.password){
                const isMatch = await bcrypt.compare(formValue.currentPassword, user.password);
                if (!isMatch) {
                  throw new BadRequestError("Current password is incorrect.");
                }
          
                // Step 2: Ensure the new password and confirm new password match
                if (formValue.newPassword !== formValue.confirmNewPassword) {
                  throw new BadRequestError("New password and confirm password do not match.");
                } 
            }

            // Step 3: Hash the new password
            const salt = await bcrypt.genSalt(10);
            const hashedNewPassword = await bcrypt.hash(formValue.newPassword, salt);
      
            // Step 4: Update the password in the database
            const details = await this._vendorRepository.update({ _id: user._id }, {
              $set: { password: hashedNewPassword }
            });
      

            // Step 5: Return success message
            return details;
          
        } catch (error) {
          console.error("Error changing password:", error);
          if(error instanceof BadRequestError) throw error;
          else throw new BadRequestError("Failed to change password. Please try again.");
          
        }
      }
    

   
    
}



export default VendorService;
