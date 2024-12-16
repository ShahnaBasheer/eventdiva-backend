import { Response } from "express";
import asyncHandler from "express-async-handler";
import createSuccessResponse from "../utils/responseFormatter";
import { CustomRequest } from "../interfaces/request.interface";
import { UserRole } from "../utils/important-variables";
import AdminService from "../services/admin.service";
import { adminService, eventPlannerService, sharedService, venueVendorService } from "../config/dependencyContainer";
import VenueVendorService from "../services/venueVendor.service";
import EventPlannerService from "../services/eventPlanner.service";
import SharedService from "../services/shared.service";



class AdminController {
  constructor(
    private adminService: AdminService,
    private sharedService: SharedService,
    private eventPlannerService: EventPlannerService,
    private venueVendorService: VenueVendorService
  ) {}
  
  // Block Customer
  blockUser = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id, role } = req.params;
      await this.adminService.blockUser(id, role as UserRole);
      createSuccessResponse(200, null, "Customer successfully blocked!", res, req);
    }
  );

  // Unblock Customer
  unblockUser = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id, role } = req.params;
      await this.adminService.unblockUser(id, role as UserRole);
      createSuccessResponse(200, null, "Customer successfully unblocked!", res, req);
    }
  );


  getAdminDashBoard = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const data = await this.adminService.getDashboardData();
      createSuccessResponse(200, { ...data }, "successfull", res, req);
    }
  );

  getAllCustomers = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      let { page = 1, limit = 10 } = req.query;
      page = parseInt(page as string);
      limit = parseInt(limit as string);
      const data = await this.sharedService.getAllUsers(
        page,
        limit,
        UserRole.Customer
      );
      createSuccessResponse(200, { ...data }, "successfull", res, req);
    }
  );

  getAllVendors = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      let { page = 1, limit = 10 } = req.query;
      page = parseInt(page as string);
      limit = parseInt(limit as string);
      const vendors = await this.sharedService.getAllUsers(
        page,
        limit,
        UserRole.Vendor
      );
      createSuccessResponse(200, { ...vendors }, "successfull", res, req);
    }
  );

  getAllVenues = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      let { page = 1, limit = 10 } = req.query;
      page = parseInt(page as string);
      limit = parseInt(limit as string);
      const venues = await this.venueVendorService.getAllVenues(page, limit);
      createSuccessResponse(200, { ...venues }, "successfull", res, req);
    }
  );

  getAllPlanners = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      let { page = 1, limit = 10 } = req.query;
      page = parseInt(page as string);
      limit = parseInt(limit as string);
      const eventPlanners = await this.eventPlannerService.getAllEventPlanners(
        page,
        limit
      );
      createSuccessResponse(200, { ...eventPlanners }, "successfull", res, req);
    }
  );

  getAllVenuesBookings = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      let { page = 1, limit = 10 } = req.query;
      page = parseInt(page as string);
      limit = parseInt(limit as string);
      const bookings = await this.venueVendorService.getAllvenueBookings(
        {},
        page,
        limit
      );
      createSuccessResponse(200, { ...bookings }, "successfull", res, req);
    }
  );

  getAllPlannersBookings = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      let { page = 1, limit = 10 } = req.query;
      page = parseInt(page as string);
      limit = parseInt(limit as string);
      const bookings = await this.eventPlannerService.getAllplannerBookings(
        {},
        page,
        limit
      );
      createSuccessResponse(200, { ...bookings }, "successfull", res, req);
    }
  );

  venueStatusApproval = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { slug, status } = req.params;
      const venueData = await this.venueVendorService.venueStatusChange(
        slug,
        status
      );
      createSuccessResponse(
        200,
        { venueData },
        "successfully Approved venue",
        res,
        req
      );
    }
  );

  plannerStatusApproval = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { slug, status } = req.params;
      const plannerData = await this.eventPlannerService.plannerStatusChange(
        slug,
        status
      );
      createSuccessResponse(
        200,
        { plannerData },
        "successfully Approved venue",
        res,
        req
      );
    }
  );
}


export default new AdminController(
  adminService, sharedService, eventPlannerService, venueVendorService
);




// // Admin Login
// loginAdmin = asyncHandler(
//   async (req: Request, res: Response): Promise<void> => {
//     const { email, password } = req.body;

//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       throw new BadRequestError("Validation failed");
//     }

//     const data = await this.userService.loginUser(
//       email,
//       password,
//       UserRole.Admin
//     );

//     if (data) {
//       res.cookie(process.env.ADMIN_REFRESH!, data?.refreshToken, {
//         httpOnly: true,
//         secure: true,
//         maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
//       });
//       createSuccessResponse(
//         200,
//         { token: data.accessToken, user: data.user },
//         "Admin successfully logged in",
//         res
//       );
//     }
//   }
// );

// // Admin Signup
// signupAdmin = asyncHandler(
//   async (req: Request, res: Response): Promise<void> => {
//     const { firstName, lastName, email, password } = req.body;

//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       throw new BadRequestError("Validation failed");
//     }

//     const response = await this.userService.signupUser(
//       { email, password, firstName, lastName },
//       UserRole.Admin
//     );

//     if (response) {
//       createSuccessResponse(201, null, "Admin successfully signed up!", res);
//     }
//   }
// );

// // Admin Logout
// logoutAdmin = asyncHandler(
//   async (req: Request, res: Response): Promise<void> => {
//     const refreshToken = req?.cookies[process.env.ADMIN_REFRESH!];

//     if (!refreshToken) {
//       console.log("No refresh token in cookies");
//       throw new UnauthorizedError("Something went wrong!");
//     }

//     // Clear the refresh token cookie
//     res.clearCookie(process.env.ADMIN_REFRESH!);
//     createSuccessResponse(200, null, "Admin successfully logged out!", res);
//   }
// );
