import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';
import CustomerService from '../../services/customer.service';
import { BadRequestError, UnauthorizedError  } from '../../errors/customError';
import createSuccessResponse from '../../utils/responseFormatter';
import { CustomRequest } from 'interfaces/request.interface';



const customerService = new CustomerService();


const signupCustomer = asyncHandler(async (req: Request, res: Response): Promise<void> => {   
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new BadRequestError('Validation failed');
        // res.status(400).json({ errors: errors.array() });
    }        
    const { email, password, firstName, lastName } = req.body;
    const response = await customerService.signupUser({ email, password, firstName, lastName });

    if(response){
        createSuccessResponse(201, { email },"OTP sent successfully to your email address", res, req);
    }
})

const verifyOtp = asyncHandler( async(req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;
    const isVerified = await customerService.otpVerification(email, otp);
    if (isVerified) {
        createSuccessResponse(200, null, "You have successfully signed up! Please Login", res); 
    } 
})


const resendOtp = asyncHandler( async(req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    const result = await customerService.resendOTP( email );
    const remainingLimit = res.getHeader('X-RateLimit-Remaining');;

    if (result) {
      createSuccessResponse(201, { email, remainingLimit }, "OTP resent successfully to your email address", res); 
    } 
})


const loginCustomer = asyncHandler( async(req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new BadRequestError('Validation failed');
    } 
    const data = await customerService.loginUser(email, password);

    if(data){
        res.cookie(process.env.CUSTOMER_REFRESH!, data?.refreshToken, {
            httpOnly: true,
            secure: true,
            maxAge: 3 * 24 * 60 * 60 * 1000, //3 * 24 * 60 * 60 * 1000
        });
        createSuccessResponse(200, { token: data.accessToken, user: data.customer },'Login successful', res)
    }
});


const signinWithGoogle = asyncHandler (async(req: Request, res: Response): Promise<void> => {
    const { idToken } = req.body;
    
    const data = await customerService.verifyWithGoogle(idToken);

    if(data){
        res.cookie(process.env.CUSTOMER_REFRESH!, data?.refreshToken, {
            httpOnly: true,
            secure: true,
            maxAge: 3 * 24 * 60 * 60 * 1000, 
        });
        createSuccessResponse(200, { token: data?.accessToken, user: data?.customer },'Login successful', res)
    }

})

//logout user
const logout = asyncHandler(async (req, res) => {
    const refreshToken = req?.cookies[process.env.CUSTOMER_REFRESH!];
    
    if (!refreshToken) {
        throw new UnauthorizedError("Something Went Wrong!");
    }
    // Clear both access token and refresh token cookies
    res.clearCookie(process.env.CUSTOMER_REFRESH!);
    createSuccessResponse(200, null, 'Successfully Logout!', res);
});



const getCustomerProfile = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const customerDetail = await customerService.getCustomer(req?.user?.id, req.user.vendorType);
    createSuccessResponse(200, { customerDetail } , "successfull", res, req);
});


const updateCustomerProfile = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const { firstName, lastName, mobile} = req.body;
    const data = {firstName, lastName,  mobile };
    const customerDetail = await customerService.updateCustomer(req?.user?.id, data);
    req.user = customerDetail;
    createSuccessResponse(200, { customerDetail } , "successfull", res, req);
});

const updateEmailProfile = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const { email} = req.body;
    const customerDetail = await customerService.otpSendForUpdateEmail(req?.user, email);
    createSuccessResponse(200, null , "OTP has been Sent Successfully!", res, req);
});


const verifyEmailProfile = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const formValue = req.body.formValue;
    const customerDetail = await customerService.otpVerifyForEmail(req?.user, formValue);
    req.user = customerDetail;
    createSuccessResponse(200, { customerDetail } , "OTP has been Sent Successfully!", res, req);
});

const passWordChangeProfile = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    const formValue = req.body.formValue;
    const customerDetail = await customerService.passwordChange(req?.user, formValue);
    createSuccessResponse(200, null , "Paasword has been Change Successfully!", res, req);
});


export {
    signupCustomer,
    verifyOtp,
    resendOtp,
    loginCustomer,
    signinWithGoogle,
    logout,
    getCustomerProfile,
    updateCustomerProfile,
    updateEmailProfile,
    verifyEmailProfile,
    passWordChangeProfile

};




