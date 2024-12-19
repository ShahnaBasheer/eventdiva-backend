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
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const responseFormatter_1 = __importDefault(require("../utils/responseFormatter"));
const dependencyContainer_1 = require("../config/dependencyContainer");
class VendorController {
    constructor(vendorService, notificationService) {
        this.vendorService = vendorService;
        this.notificationService = notificationService;
        this.getVendorProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const vendorDetail = req.user;
            (0, responseFormatter_1.default)(200, { vendorDetail }, 'Vendor profile retrieved successfully', res, req);
        }));
        this.updateVendorProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { firstName, lastName, mobile } = req.body;
            const data = { firstName, lastName, mobile };
            const vendorDetail = yield this.vendorService.updateVendor(req.user.id, data);
            (0, responseFormatter_1.default)(200, { vendorDetail }, 'Vendor profile updated successfully', res, req);
        }));
        this.updateEmailProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            const vendorDetail = yield this.vendorService.otpSendForUpdateEmail(req.user, email);
            (0, responseFormatter_1.default)(200, null, 'OTP sent successfully for email update!', res, req);
        }));
        this.verifyEmailProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const formValue = req.body.formValue;
            const vendorDetail = yield this.vendorService.otpVerifyForEmail(req.user, formValue);
            (0, responseFormatter_1.default)(200, { vendorDetail }, 'Email updated successfully!', res, req);
        }));
        this.passwordChangeProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const formValue = req.body.formValue;
            yield this.vendorService.passwordChange(req.user, formValue);
            (0, responseFormatter_1.default)(200, null, 'Password changed successfully!', res, req);
        }));
    }
}
exports.default = new VendorController(dependencyContainer_1.vendorService, dependencyContainer_1.notificationService);
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