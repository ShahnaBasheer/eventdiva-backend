
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import createSuccessResponse from '../utils/responseFormatter';
import { notificationService, vendorService } from '../config/dependencyContainer';
import { CustomRequest } from '../interfaces/request.interface';
import VendorService from '../services/vendor.service';
import NotificationService from '../services/notification.service';



class VendorController {
  
  constructor(
    private vendorService: VendorService,
    private notificationService: NotificationService
){}

  
  


  getNotifications = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const data = await this.notificationService.getNotifications(req.user.id, req.user.role);
    createSuccessResponse(
      200,
      { notifications: data.notifications, readCount: data.readCount },
      'Successfully retrieved notifications',
      res,
      req
    );
  });

  changeReadStatus = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const notification = await this.notificationService.updateReadStatus(req.body.id);
    createSuccessResponse(200, { notification }, 'Read status updated successfully', res, req);
  });

  deleteNotification = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const notification = await this.notificationService.deleteNotification(req.params.id);
    createSuccessResponse(200, { notification }, 'Notification deleted successfully', res, req);
  });

  getVendorProfile = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    console.log(req.user, "vendor")
    const vendorDetail = req.user;
    createSuccessResponse(200, { vendorDetail }, 'Vendor profile retrieved successfully', res, req);
  });

  updateVendorProfile = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const { firstName, lastName, mobile } = req.body;
    const data = { firstName, lastName, mobile };
    const vendorDetail = await this.vendorService.updateVendor(req.user.id, data);
    createSuccessResponse(200, { vendorDetail }, 'Vendor profile updated successfully', res, req);
  });

  updateEmailProfile = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const { email } = req.body;
    const vendorDetail = await this.vendorService.otpSendForUpdateEmail(req.user, email);
    createSuccessResponse(200, null, 'OTP sent successfully for email update!', res, req);
  });

  verifyEmailProfile = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const formValue = req.body.formValue;
    const vendorDetail = await this.vendorService.otpVerifyForEmail(req.user, formValue);
    createSuccessResponse(200, { vendorDetail }, 'Email updated successfully!', res, req);
  });

  passwordChangeProfile = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const formValue = req.body.formValue;
    await this.vendorService.passwordChange(req.user, formValue);
    createSuccessResponse(200, null, 'Password changed successfully!', res, req);
  });
}


export default new VendorController(vendorService, notificationService );


// const signupVendor = asyncHandler(async (req: Request, res: Response): Promise<void> => {   
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         throw new BadRequestError('Validation failed');
//         // res.status(400).json({ errors: errors.array() });
//     }        
//     const { email, password, firstName, lastName, vendorType } = req.body;
//     const response = await userService.signupUser({ email, password, firstName, lastName, vendorType }, UserRole.Vendor);

//     if(response){
//         createSuccessResponse(201, { email },"OTP sent successfully to your email address", res, req);
//     }
// })


// const verifyOtp = asyncHandler( async(req: Request, res: Response): Promise<void> => {
//     const { email, otp } = req.body;
//     const isVerified = await userService.otpVerification(email, otp, UserRole.Vendor);
//     if (isVerified) {
//         createSuccessResponse(200, null, "You have successfully signed up! Please Login", res); 
//     } 
// })


// const resendOtp = asyncHandler( async(req: Request, res: Response): Promise<void> => {
//     const { email } = req.body;
//     const result = await userService.resendOtp( email, UserRole.Vendor );
//     const remainingLimit = res.getHeader('X-RateLimit-Remaining');

//     if (result) {
//       createSuccessResponse(201, { email, remainingLimit }, "OTP resent successfully to your email address", res); 
//     } 
// })


// const loginVendor = asyncHandler( async(req: Request, res: Response): Promise<void> => {
//     const { email, password } = req.body;
    
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         throw new BadRequestError('Validation failed');
//     } 
//     const data = await userService.loginUser(email, password, UserRole.Vendor);
//     if(data){
//         res.cookie(process.env.VENDOR_REFRESH!, data?.refreshToken, {
//             httpOnly: true,
//             secure: true,
//             maxAge: 3 * 24 * 60 * 60 * 1000, //3 * 24 * 60 * 60 * 1000
//         });
//         createSuccessResponse(200, { token: data.accessToken, user: data.user },'Login successful', res)
//     }
// });


// //logout user
// const logout = asyncHandler(async (req, res) => {
//     const refreshToken = req?.cookies[process.env.VENDOR_REFRESH!];
    
//     if (!refreshToken) {
//         console.log("no refresh token in cookies");
//         throw new UnauthorizedError("Something Went Wrong!");
//     }
//     // Clear both access token and refresh token cookies
//     res.clearCookie(process.env.VENDOR_REFRESH!);
//     createSuccessResponse(200, null, 'Successfully Logout!', res);
// });


// const getNotifications = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
//     const data = await notificationService.getNotifications(req.user?.id, req.user?.role);
//     console.log(data, "notfication")
//     createSuccessResponse(200, { notifications: data.notifications, readCount: data.readCount } , "successfull", res, req)
// });

// const changeReadStatus = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
//     const notification = await notificationService.updateReadStatus(req.body.id);
//     createSuccessResponse(200, { notification } , "successfull", res, req)
// });

// const deleteNotification = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
//     console.log(req.params, "njjjcxnd")
//     const notification = await notificationService.deleteNotification(req.params.id);
//     createSuccessResponse(200, { notification } , "successfull", res, req)
// });


// const getVendorProfile = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
//     const vendorDetail = await vendorService.getVendor(req?.user?.id, req.user.vendorType);
//     createSuccessResponse(200, { vendorDetail } , "successfull", res, req);
// });


// const updateVendorProfile = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
//     const { firstName, lastName, mobile} = req.body;
//     const data = {firstName, lastName,  mobile };
//     const vendorDetail = await vendorService.updateVendor(req?.user?.id, data);    
//     createSuccessResponse(200, { vendorDetail } , "successfull", res, req);
// });

// const updateEmailProfile = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
//     const { email} = req.body;
//     const vendorDetail = await vendorService.otpSendForUpdateEmail(req?.user, email);
//     createSuccessResponse(200, null , "OTP has been Sent Successfully!", res, req);
// });


// const verifyEmailProfile = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
//     const formValue = req.body.formValue;
//     const vendorDetail = await vendorService.otpVerifyForEmail(req?.user, formValue);
//     createSuccessResponse(200, { vendorDetail } , "OTP has been Sent Successfully!", res, req);
// });

// const passWordChangeProfile = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
//     const formValue = req.body.formValue;
//     const vendorDetail = await vendorService.passwordChange(req?.user, formValue);
//     createSuccessResponse(200, null , "Paasword has been Change Successfully!", res, req);
// });


// export {
//     signupVendor,
//     verifyOtp,
//     resendOtp,
//     loginVendor,
//     logout,
//     getNotifications,
//     deleteNotification,
//     changeReadStatus,
//     updateVendorProfile,
//     getVendorProfile,
//     updateEmailProfile,
//     verifyEmailProfile,
//     passWordChangeProfile
// };

// signupVendor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     throw new BadRequestError('Validation failed');
//   }

//   const { email, password, firstName, lastName, vendorType } = req.body;
//   const response = await this.userService.signupUser(
//     { email, password, firstName, lastName, vendorType },
//     UserRole.Vendor
//   );

//   if (response) {
//     createSuccessResponse(201, { email }, 'OTP sent successfully to your email address', res, req);
//   }
// });

// loginVendor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
//   const { email, password } = req.body;

//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     throw new BadRequestError('Validation failed');
//   }

//   const data = await this.userService.loginUser(email, password, UserRole.Vendor);
//   if (data) {
//     res.cookie(process.env.VENDOR_REFRESH!, data.refreshToken, {
//       httpOnly: true,
//       secure: true,
//       maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
//     });

//     createSuccessResponse(200, { token: data.accessToken, user: data.user }, 'Login successful', res);
//   }
// });

// logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
//   const refreshToken = req.cookies[process.env.VENDOR_REFRESH!];
//   if (!refreshToken) {
//     throw new UnauthorizedError('Something Went Wrong!');
//   }

//   res.clearCookie(process.env.VENDOR_REFRESH!);
//   createSuccessResponse(200, null, 'Successfully Logout!', res);
// });





