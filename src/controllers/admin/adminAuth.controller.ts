
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';
import { BadRequestError, UnauthorizedError  } from '../../errors/customError';
import createSuccessResponse from '../../utils/responseFormatter';
import AdminService from '../../services/admin.service';
import CustomerService from '../../services/customer.service';
import { CustomRequest } from '../../interfaces/request.interface';
import VendorService from '../../services/vendor.service';



const adminService = new AdminService();
const customerService = new CustomerService();
const vendorService = new VendorService();



const loginAdmin = asyncHandler( async(req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new BadRequestError('Validation failed');
    } 
    const data = await adminService.loginUser(email, password);

    if(data){
        res.cookie(process.env.ADMIN_REFRESH!, data?.refreshToken, {
            httpOnly: true,
            secure: true,
            maxAge: 3 * 24 * 60 * 60 * 1000, //3 days
        });
        createSuccessResponse(200, { token: data.accessToken, user: data.admin },'Admin successfully logged in', res)
    }
});



const signupAdmin = asyncHandler( async(req: Request, res: Response): Promise<void> => {
    const { fullName, email, password } = req.body;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        throw new BadRequestError('Validation failed');
    } 
    const response = await adminService.signupAdmin({ email, password, fullName });
    if(response){
        createSuccessResponse(201, null, "Admin Successfully Signup!", res)
    }
});


//logout user
const logoutAdmin = asyncHandler(async (req, res) => {
    const refreshToken = req?.cookies[process.env.ADMIN_REFRESH!];
    
    if (!refreshToken) {
        console.log("no refresh token in cookies");
        throw new UnauthorizedError("Something Went Wrong!");
    }
    // Clear both access token and refresh token cookies
    res.clearCookie(process.env.ADMIN_REFRESH!);
    createSuccessResponse(200, null, 'Successfully Logout admin!', res);
});


//Block Customer
const blockCutomer = asyncHandler( async (req: CustomRequest, res: Response ):Promise<void> => {
    const { id } = req.params;
    const user = await customerService.blockUser(id);
    createSuccessResponse(200, null, 'User successfully blocked!', res, req);    
});

//Unblock Customer
const unblockCustomer = asyncHandler( async (req: CustomRequest, res: Response ):Promise<void> => {
    const { id } = req.params;
    const user = await customerService.unblockUser(id);
    createSuccessResponse(200, null, 'User successfully unblocked!', res, req);  
});

//Block Vendor
const blockVendor = asyncHandler( async (req: CustomRequest, res: Response ):Promise<void> => {
    const { id } = req.params;
    const user = await vendorService.blockUser(id);
    createSuccessResponse(200, null, 'User successfully blocked!', res, req);    
});

//Unblock Vendor
const unblockVendor = asyncHandler( async (req: CustomRequest, res: Response ):Promise<void> => {
    const { id } = req.params;
    const user = await vendorService.unblockUser(id);
    createSuccessResponse(200, null, 'User successfully unblocked!', res, req);  
});



export {
    loginAdmin,
    signupAdmin,
    logoutAdmin,
    blockCutomer,
    unblockCustomer,
    blockVendor,
    unblockVendor
};




