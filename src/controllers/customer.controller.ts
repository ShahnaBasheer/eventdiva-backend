import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { validationResult } from "express-validator";
import { BadRequestError } from "../errors/customError";
import createSuccessResponse from "../utils/responseFormatter";
import { CustomRequest } from "../interfaces/request.interface";
import CustomerService from "../services/customer.service";
import { customerService, eventPlannerService, notificationService, venueVendorService } from "../config/dependencyContainer";
import { Status } from '../utils/status-options';
import { parseQueryToStringArray } from '../utils/helperFunctions';
import EventPlannerService from "../services/eventPlanner.service";
import VenueVendorService from "../services/venueVendor.service";
import NotificationService from "../services/notification.service";


class CustomerController {
  constructor(
    private customerService: CustomerService,
    private eventPlannerService: EventPlannerService,
    private venueVendorService: VenueVendorService,
    private notificationService: NotificationService
  ) {}


  // Get Customer Profile
  getCustomerProfile = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const customerDetail = await this.customerService.getCustomer(
        req.user?.id,
        req.user.vendorType
      );
      createSuccessResponse(200, { customerDetail }, "successful", res, req);
    }
  );

  // Update Customer Profile
  updateCustomerProfile = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { firstName, lastName, mobile } = req.body;
      const data = { firstName, lastName, mobile };
      const customerDetail = await this.customerService.updateCustomer(
        req.user?.id,
        data
      );
      req.user = customerDetail;
      createSuccessResponse(200, { customerDetail }, "successful", res, req);
    }
  );

  // Update Email Profile
  updateEmailProfile = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { email } = req.body;
      const customerDetail = await this.customerService.otpSendForUpdateEmail(
        req.user,
        email
      );
      createSuccessResponse(
        200,
        null,
        "OTP has been Sent Successfully!",
        res,
        req
      );
    }
  );

  // Verify Email Profile
  verifyEmailProfile = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const formValue = req.body.formValue;
      const customerDetail = await this.customerService.otpVerifyForEmail(
        req.user,
        formValue
      );
      req.user = customerDetail;
      createSuccessResponse(
        200,
        { customerDetail },
        "OTP has been Sent Successfully!",
        res,
        req
      );
    }
  );

  // Change Password
  passwordChangeProfile = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const formValue = req.body.formValue;
      const customerDetail = await this.customerService.passwordChange(
        req.user,
        formValue
      );
      createSuccessResponse(
        200,
        null,
        "Password has been Changed Successfully!",
        res,
        req
      );
    }
  );

  getCustomerHome = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      createSuccessResponse(200, null, "successfull", res, req);
    }
  );


  getContactPage = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      createSuccessResponse(
        200,
        null,
        "successfully fetch contact page!",
        res,
        req
      );
    }
  );

  getAboutPage = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      createSuccessResponse(
        200,
        null,
        "successfully fetch about page!",
        res,
        req
      );
    }
  );

  getAllEventPlanners = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      let { page = "1", limit = "10", services, location, search } = req.query;

      // Convert page and limit to integers
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);
      const parsedServices = parseQueryToStringArray(services);
      const parsedLocation = location ? String(location) : "";
      const searchItem = search ? String(search) : "";

      // Create filters object
      const filters = {
        services: parsedServices,
        location: parsedLocation || null,
      };

      const eventPlanners = await this.eventPlannerService.getAllEventPlanners(
        pageNumber,
        limitNumber,
        Status.Approved,
        filters,
        searchItem
      );

      createSuccessResponse(
        200,
        { ...eventPlanners },
        "successfully fetch event planners",
        res,
        req
      );
    }
  );


  getAllVenues = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      // Extract query parameters
      let {
        page = 1,
        limit = 10,
        services,
        amenities,
        location,
        venueTypes,
        search,
      } = req.query;

      // Convert page and limit to integers
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);
      const searchItem = search ? String(search) : "";

      // Use the utility function to parse query parameters
      const parsedServices = parseQueryToStringArray(services);
      const parsedAmenities = parseQueryToStringArray(amenities);
      const parsedVenueTypes = parseQueryToStringArray(venueTypes);
      const parsedLocation = location ? String(location) : "";

      // Create filters object
      const filters = {
        services: parsedServices,
        amenities: parsedAmenities,
        venueTypes: parsedVenueTypes,
        location: parsedLocation || null,
      };

      // Call the service with filters
      const venues = await this.venueVendorService.getAllVenues(
        pageNumber,
        limitNumber,
        Status.Approved,
        filters,
        searchItem
      );

      // Send a success response
      createSuccessResponse(
        200,
        { ...venues },
        "Successfully fetched venues",
        res,
        req
      );
    }
  );


  getVenueBookingPage = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { slug } = req.params;
      const venueData = await this.venueVendorService.getVenue({
        slug,
        approval: Status.Approved,
      });
      createSuccessResponse(
        200,
        { venueData },
        "successfully fetch venue detail for booking",
        res,
        req
      );
    }
  );

  createVenueBooking = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { slug } = req.params;
      const eventInfo = req.body?.eventInfo;
      const addressInfo = req.body?.addressInfo;
      const servicesInfo = req.body.servicesInfo;
      const servicesRequested = req.body.servicesRequested;
      let data;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(errors.array());
        throw new BadRequestError("Validation failed");
      }

      if (eventInfo && addressInfo && servicesInfo) {
        data = await this.venueVendorService.venueBooking(
          {
            ...eventInfo,
            addressInfo,
            ...servicesInfo,
            services: servicesRequested,
            user: req.user,
          },
          slug
        );
      }
      createSuccessResponse(
        200,
        data,
        "successfully fetch venue detail for booking",
        res,
        req
      );
    }
  );

  venueRazorPayment = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      let bookedData = await this.venueVendorService.razorPayment(req?.body);
      createSuccessResponse(200, { bookedData }, "successfull", res, req);
    }
  );

  getAllBookings = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const allBookings = await this.customerService.getAllBookings(req.user?.id);
      createSuccessResponse(
        200,
        { allBookings },
        "successfully fetch all bookings",
        res,
        req
      );
    }
  );

  getPlannerBookingForm = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { slug } = req.params;
      const plannerData = await this.eventPlannerService.getEventPlanner({
        slug,
        approval: Status.Approved,
      });
      createSuccessResponse(
        200,
        { plannerData },
        "successfully fetch planner detail for booking",
        res,
        req
      );
    }
  );

  createPlannerBooking = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { slug } = req.params;
      const eventInfo = req.body?.eventInfo;
      const addressInfo = req.body?.addressInfo;
      const paymentInfo = req.body?.paymentInfo;
      let data;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(errors.array());
        throw new BadRequestError("Validation failed");
      }

      if (eventInfo && addressInfo && paymentInfo) {
        data = await this.eventPlannerService.plannerBooking(
          {
            ...eventInfo,
            addressInfo,
            ...paymentInfo,
            user: req.user,
          },
          slug
        );
      }
      createSuccessResponse(
        200,
        data,
        "successfully fetch planner booking for booking",
        res,
        req
      );
    }
  );

  plannerRazorPayment = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      let bookedData = await this.eventPlannerService.razorPayment(req?.body);
      createSuccessResponse(200, { bookedData }, "successfull", res, req);
    }
  );

  checkVenueAvailability = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { slug } = req.params;
      const {
        eventType,
        isMultipleDays,
        startDate,
        endDate,
        startTime,
        endTime,
      } = req.body;

      const isAvailable = await this.venueVendorService.checkAvailability(
        { eventType, isMultipleDays, startDate, endDate, startTime, endTime },
        slug
      );

      createSuccessResponse(200, { isAvailable }, "successfull", res, req);
    }
  );

  checkPlannerAvailability = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { slug } = req.params;
      const {
        eventType,
        isMultipleDays,
        startDate,
        endDate,
        startTime,
        endTime,
      } = req.body;

      const isAvailable = await this.eventPlannerService.checkAvailability(
        { eventType, isMultipleDays, startDate, endDate, startTime, endTime },
        slug
      );

      createSuccessResponse(200, { isAvailable }, "successfull", res, req);
    }
  );

  getNotifications = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const data = await this.notificationService.getNotifications(
        req.user?.id,
        req.user?.role
      );
      createSuccessResponse(
        200,
        { notifications: data.notifications, readCount: data.readCount },
        "successfull",
        res,
        req
      );
    }
  );

  changeReadStatus = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const notification = await this.notificationService.updateReadStatus(
        req.body.id
      );
      createSuccessResponse(200, { notification }, "successfull", res, req);
    }
  );

  deleteNotification = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const notification = await this.notificationService.deleteNotification(
        req.params.id
      );
      createSuccessResponse(200, { notification }, "successfull", res, req);
    }
  );

  getPlannerBookingDetails = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { bookingId } = req.params;
      const bookingData = await this.eventPlannerService.getOneBooking(bookingId);
      let fullPayment = 0;
      // Calculate the total sum of amounts
      if (bookingData) {
        const totalServiceCharges =
          bookingData?.charges?.fullPayment?.servicesCharges?.reduce(
            (sum, charge) => sum + charge.cost,
            0
          ) || 0;
        fullPayment =
          (bookingData?.charges?.fullPayment?.planningFee || 0) +
          totalServiceCharges;
      }

      console.log(fullPayment);

      createSuccessResponse(
        200,
        { bookingData, fullPayment },
        "successfully fetch planner detail for booking",
        res,
        req
      );
    }
  );

  getVenueBookingDetails = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { bookingId } = req.params;
      const bookingData = await this.venueVendorService.getOneBooking(bookingId);
      let fullPayment = 0;
      // Calculate the total sum of amounts
      if (bookingData) {
        const totalServiceCharges =
          bookingData?.charges?.fullPayment?.servicesCharges?.reduce(
            (sum, charge) => sum + charge.cost,
            0
          ) || 0;
        fullPayment =
          (bookingData?.charges?.fullPayment?.venueRental || 0) +
          totalServiceCharges;
      }

      console.log(fullPayment);

      createSuccessResponse(
        200,
        { bookingData, fullPayment },
        "successfully fetch planner detail for booking",
        res,
        req
      );
    }
  );

  plannerAdvancePayment = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { bookingId } = req.params;
      const data = await this.eventPlannerService.payAdvancepayment(bookingId);
      createSuccessResponse(
        200,
        { ...data },
        "successfully fetch planner booking for booking",
        res,
        req
      );
    }
  );

  plannerFullPayment = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { bookingId } = req.params;
      const data = await this.eventPlannerService.payFullpayment(bookingId);
      createSuccessResponse(
        200,
        { ...data },
        "successfully fetch planner booking for booking",
        res,
        req
      );
    }
  );

  venueAdvancePayment = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { bookingId } = req.params;
      const data = await this.venueVendorService.payAdvancepayment(bookingId);
      createSuccessResponse(
        200,
        { ...data },
        "successfully fetch planner booking for booking",
        res,
        req
      );
    }
  );

  venueFullPayment = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { bookingId } = req.params;
      const data = await this.venueVendorService.payFullpayment(bookingId);
      createSuccessResponse(
        200,
        { ...data },
        "successfully fetch planner booking for booking",
        res,
        req
      );
    }
  );
}

export default new CustomerController(
  customerService, eventPlannerService, venueVendorService, notificationService
);
;

// const signupCustomer = asyncHandler(async (req: Request, res: Response): Promise<void> => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         throw new BadRequestError('Validation failed');
//         // res.status(400).json({ errors: errors.array() });
//     }
//     const { email, password, firstName, lastName } = req.body;
//     const response = await userService.signupUser({ email, password, firstName, lastName } , UserRole.Customer);

//     if(response){
//         createSuccessResponse(201, { email },"OTP sent successfully to your email address!", res, req);
//     }
// })

// const verifyOtp = asyncHandler( async(req: Request, res: Response): Promise<void> => {
//     const { email, otp } = req.body;
//     const isVerified = await userService.otpVerification(email, otp, UserRole.Customer);
//     if (isVerified) {
//         createSuccessResponse(200, null, "You have successfully signed up! Please Login", res);
//     }
// })

// const resendOtp = asyncHandler( async(req: Request, res: Response): Promise<void> => {
//     const { email } = req.body;
//     const result = await userService.resendOtp( email, UserRole.Customer );
//     const remainingLimit = res.getHeader('X-RateLimit-Remaining');;

//     if (result) {
//       createSuccessResponse(201, { email, remainingLimit }, "OTP resent successfully to your email address", res);
//     }
// })

// const loginCustomer = asyncHandler( async(req: Request, res: Response): Promise<void> => {
//     const { email, password } = req.body;

//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         throw new BadRequestError('Validation failed');
//     }
//     const data = await userService.loginUser(email, password, UserRole.Customer);

//     if(data){
//         res.cookie(process.env.CUSTOMER_REFRESH!, data?.refreshToken, {
//             httpOnly: true,
//             secure: true,
//             maxAge: 3 * 24 * 60 * 60 * 1000, //3 * 24 * 60 * 60 * 1000
//         });
//         createSuccessResponse(200, { token: data.accessToken, user: data.user },'Login successfull', res)
//     }
// });

// const signinWithGoogle = asyncHandler (async(req: Request, res: Response): Promise<void> => {
//     const { idToken } = req.body;

//     const data = await userService.verifyWithGoogle(idToken, UserRole.Customer);

//     if(data){
//         res.cookie(process.env.CUSTOMER_REFRESH!, data?.refreshToken, {
//             httpOnly: true,
//             secure: true,
//             maxAge: 3 * 24 * 60 * 60 * 1000,
//         });
//         createSuccessResponse(200, { token: data?.accessToken, user: data?.customer },'Login successful', res)
//     }

// })

// //logout user
// const logout = asyncHandler(async (req, res) => {
//     const refreshToken = req?.cookies[process.env.CUSTOMER_REFRESH!];

//     if (!refreshToken) {
//         throw new UnauthorizedError("Something Went Wrong!");
//     }
//     // Clear both access token and refresh token cookies
//     res.clearCookie(process.env.CUSTOMER_REFRESH!);
//     createSuccessResponse(200, null, 'Successfully Logout!', res);
// });

// const getCustomerProfile = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
//     const customerDetail = await customerService.getCustomer(req?.user?.id, req.user.vendorType);
//     createSuccessResponse(200, { customerDetail } , "successfull", res, req);
// });

// const updateCustomerProfile = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
//     const { firstName, lastName, mobile} = req.body;
//     const data = {firstName, lastName,  mobile };
//     const customerDetail = await customerService.updateCustomer(req?.user?.id, data);
//     req.user = customerDetail;
//     createSuccessResponse(200, { customerDetail } , "successfull", res, req);
// });

// const updateEmailProfile = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
//     const { email} = req.body;
//     const customerDetail = await customerService.otpSendForUpdateEmail(req?.user, email);
//     createSuccessResponse(200, null , "OTP has been Sent Successfully!", res, req);
// });

// const verifyEmailProfile = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
//     const formValue = req.body.formValue;
//     const customerDetail = await customerService.otpVerifyForEmail(req?.user, formValue);
//     req.user = customerDetail;
//     createSuccessResponse(200, { customerDetail } , "OTP has been Sent Successfully!", res, req);
// });

// const passWordChangeProfile = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
//     const formValue = req.body.formValue;
//     const customerDetail = await customerService.passwordChange(req?.user, formValue);
//     createSuccessResponse(200, null , "Paasword has been Change Successfully!", res, req);
// });

// export {
//     signupCustomer,
//     verifyOtp,
//     resendOtp,
//     loginCustomer,
//     signinWithGoogle,
//     logout,
//     getCustomerProfile,
//     updateCustomerProfile,
//     updateEmailProfile,
//     verifyEmailProfile,
//     passWordChangeProfile

// };
 // Customer Signup
  // signupCustomer = asyncHandler(
  //   async (req: Request, res: Response): Promise<void> => {
  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) {
  //       throw new BadRequestError("Validation failed");
  //     }
  //     const { email, password, firstName, lastName } = req.body;
  //     const response = await this.userService.signupUser(
  //       { email, password, firstName, lastName },
  //       UserRole.Customer
  //     );

  //     if (response) {
  //       createSuccessResponse(
  //         201,
  //         { email },
  //         "OTP sent successfully to your email address!",
  //         res,
  //         req
  //       );
  //     }
  //   }
  // );
 // OTP Verification
//  verifyOtp = asyncHandler(
//   async (req: Request, res: Response): Promise<void> => {
//     const { email, otp } = req.body;
//     const isVerified = await this.userService.otpVerification(
//       email,
//       otp,
//       UserRole.Customer
//     );
//     if (isVerified) {
//       createSuccessResponse(
//         200,
//         null,
//         "You have successfully signed up! Please Login",
//         res
//       );
//     }
//   }
// );

// // Resend OTP
// resendOtp = asyncHandler(
//   async (req: Request, res: Response): Promise<void> => {
//     const { email } = req.body;
//     const result = await this.userService.resendOtp(email, UserRole.Customer);
//     const remainingLimit = res.getHeader("X-RateLimit-Remaining");

//     if (result) {
//       createSuccessResponse(
//         201,
//         { email, remainingLimit },
//         "OTP resent successfully to your email address",
//         res
//       );
//     }
//   }
// );
