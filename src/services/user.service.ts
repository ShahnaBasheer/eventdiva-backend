import bcrypt from 'bcrypt';
import VendorRepository from '../repositories/vendor.repository';
import AdminRepository from '../repositories/admin.repository';
import CustomerRepository from '../repositories/customer.repository';
import { BadRequestError, ConflictError, ForbiddenError, UnauthorizedError } from '../errors/customError';
import { IUser, IUserDocument, UserRole } from '../utils/important-variables';
import { capitalize, createToken, isVendorDocument } from '../utils/helperFunctions';
import { sendOtpByEmail, welcomeEmail } from '../utils/emailSend';
import NotificationRepository from '../repositories/notification.repository';
import { NotificationType } from '../utils/eventsVariables';
import { IVendor, IVendorDocument } from 'interfaces/vendor.interface';
import { ICustomer, ICustomerDocument } from 'interfaces/customer.interface';
import { OAuth2Client } from 'google-auth-library';


export default class UserService{
    constructor(
        private _vendorRepository: VendorRepository,
        private _adminRepository: AdminRepository,
        private _customerRepository: CustomerRepository,
        private _notificationrepository: NotificationRepository
    ) {}

    private async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }

    private async comparePassword(enteredPassword: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(enteredPassword, hashedPassword);
    }

    private getRepositoryByRole(role: UserRole) {
        if (role === UserRole.Vendor) return this._vendorRepository;
        if (role === UserRole.Admin) return this._adminRepository;
        if (role === UserRole.Customer) return this._customerRepository;
        throw new BadRequestError('Invalid role');
    }

    async createUser(user: IUser , role: UserRole): Promise<IUser> {
        const repository = this.getRepositoryByRole(role);
        const hashedPassword = await this.hashPassword(user.password as string);
        return await repository.create({ ...user, password: hashedPassword });
    }

    async getUserById(id: string, role: UserRole): Promise<IUserDocument | null> {
        const repository = this.getRepositoryByRole(role);
        return await repository.getById(id);
    }

    async loginUser(
        email: string,
        password: string,
        role: UserRole
    ): Promise<{ accessToken: string; refreshToken: string; user: Partial<IUser> }> {
        const repository = this.getRepositoryByRole(role);
        const user = await repository.getOneByFilter({ email });

        if (!user) throw new UnauthorizedError('Invalid email or password');

        // Check if the user is blocked
        if ('isBlocked' in user && user.isBlocked) {
            throw new ForbiddenError('User account is blocked');
        }

        const isPasswordValid = user.password && (await this.comparePassword(password, user.password));
        if (!isPasswordValid) throw new UnauthorizedError('Invalid email or password');
         
        const { accessToken, refreshToken } = createToken(user.id!, role);
        if(!refreshToken || !accessToken) throw new Error('Failed to generate authentication tokens');

        const sanitizedUser = this.extractUserData(user);

        return { accessToken, refreshToken, user: sanitizedUser };
    }

    async signupUser(user: IUser, role: UserRole): Promise<boolean> {
        const repository = this.getRepositoryByRole(role);
        const existingUser = await repository.getByEmail(user.email);

        if (existingUser) {
            if (existingUser?.isVerified) {
                throw new ConflictError('Email already exists');
            } else {
                await repository.delete(existingUser.id!);
            }
        }

        if (role === UserRole.Admin) {
            await this.createUser(user, role);
            return true;
        } 
        const otp = await sendOtpByEmail(user.email);
        const userWithOtp = { ...user, otp, otpTimestamp: new Date() };
        await this.createUser(userWithOtp, role);

        return true;
    }

    async verifyWithGoogle(idToken: string, role: UserRole) { 
        try {
            if (role === UserRole.Admin) {
                throw new BadRequestError('Google verification is not allowed for admin');
            }
            const repository = this.getRepositoryByRole(role);
            const client = new OAuth2Client(process.env.GOOGLE_ID);   
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_ID,
            });
            const payload = ticket.getPayload();
    
            if (!payload) {
                throw new BadRequestError('Invalid payload received from Google authentication');
            }
    
            const { sub, given_name, family_name, email } = payload;
            console.log(payload)
            let user: ICustomerDocument | IVendorDocument | null = await repository.getOneByFilter({ googleId: sub});

            if (user && user.isBlocked) {
                throw new ForbiddenError('User account is blocked');
            }

            if (!user) {
                
                if (given_name && email) {
                    // Convert the plain object to a Mongoose document
                    const userDocument = {
                        googleId: sub,
                        firstName: given_name,
                        lastName: family_name || ' ',
                        email,
                        isVerified: true, 
                    };
            
                    user = await repository.create(userDocument);
                    await welcomeEmail(email);

                    const notificationDocument = {
                        userId: user.id, 
                        userType: capitalize(role), 
                        message: `Welcome to our platform! Your account has been created successfully.`, 
                        isRead: false,
                        notificationType: NotificationType.SIGNUP
                    };
            
                    await this._notificationrepository.create(notificationDocument);
                } else {
                    throw new BadRequestError('Missing required fields for user creation');
                }
            }
    
            const { accessToken, refreshToken } = createToken(user.id!, role);
            if(!refreshToken || !accessToken) throw new Error('Failed to generate authentication tokens');
    
            return { accessToken, refreshToken, user: this.extractUserData(user) };   
        } catch (error) {
            console.log(error, 'Error occur during google authentication');
            if(error instanceof ForbiddenError || error instanceof BadRequestError) throw error;
            throw new UnauthorizedError('Authentication failed');
        }
    }
 

    async otpVerification(email: string, otp: string, role: UserRole): Promise<boolean> {
        if (role === 'admin') {
            throw new BadRequestError('Google verification is not allowed for admin');
        }
        const repository = this.getRepositoryByRole(role);
        const user: IVendorDocument | ICustomerDocument | null = await repository.getByEmail(email);

        if (!user || user.otp !== otp) throw new BadRequestError('Invalid OTP');

        const otpTimestamp = new Date(user.otpTimestamp as Date);
        const currentTime = new Date();
        const timeDifference = (currentTime.getTime() - otpTimestamp.getTime()) / (1000 * 60); // in minutes

        if (timeDifference > 2) throw new BadRequestError('OTP expired');

        await repository.update(user.id!, {
            $set: { isVerified: true },
            $unset: { otp: '', otpTimestamp: '' },
        });

        await welcomeEmail(email);

        const notificationDocument = {
            userId: user.id, 
            userType: role, 
            message: `Welcome to our platform! Your account has been created successfully.`, 
            isRead: false,
            notificationType: NotificationType.SIGNUP
        };

        await this._notificationrepository.create(notificationDocument);
        return true;
    }

    async resendOtp(email: string, role: UserRole): Promise<boolean> {
        const repository = this.getRepositoryByRole(role);
        const user = await repository.getByEmail(email);

        if (!user) throw new UnauthorizedError('User not found');
        if (user.isVerified) throw new ConflictError('User is already verified');

        const otp = await sendOtpByEmail(email);
        await repository.update(user.id!, {
            $set: { otp, otpTimestamp: new Date() },
        });
        return true;
    }


    extractUserData(user: IUserDocument): Partial<IUser> {
        // Base extracted data (common fields)
        const extractedData: Partial<IUser> = {
            ...(user?.id && { id: user.id }),
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            role: user.role,
        };
    
        // Add vendor-specific fields if user is a vendor
        if (isVendorDocument(user) && user.role === UserRole.Vendor) {
            Object.assign(extractedData, {
                ...(user.vendorType && { vendorType: user.vendorType }),
                ...(user.serviceName && { serviceName: user.serviceName }),
            });
        }
    
        // Add mobile field if present
        if ('mobile' in user && user.mobile) {
            Object.assign(extractedData, { mobile: user.mobile,})
        }
    
        return extractedData;
    }
}
