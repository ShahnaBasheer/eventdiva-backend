import bcrypt from 'bcrypt';
import { ConflictError, UnauthorizedError } from "../errors/customError";
import { generateAdminToken, generateRefreshAdminToken } from "../config/jwToken";
import { IAdmin, IAdminDocument} from "../interfaces/admin.interface";
import AdminRepository from "../repositories/admin.repository";
import Admin from '../models/adminModel';



class AdminService {
    private adminRepository!: AdminRepository;

    constructor() {
        this.adminRepository = new AdminRepository();
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
    
}



export default AdminService;
