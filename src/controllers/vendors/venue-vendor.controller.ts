import { Response } from "express";
import asyncHandler from "express-async-handler";
import { CustomRequest } from "../../interfaces/request.interface";
import createSuccessResponse from "../../utils/responseFormatter";
import { validationResult } from "express-validator";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../../errors/customError";
import { venueVendorService } from "../../config/dependencyContainer";
import VenueVendorService from "../../services/venueVendor.service";
import { UserRole } from "utils/important-variables";
import { Status } from "utils/status-options";
import { generateServiceFilter } from "utils/helperFunctions";


class VenueVendorController {

  constructor(private venueVendorService: VenueVendorService){}

  getVenueVendorDashboard = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const venueVendorData = await  this.venueVendorService.getDashboardData(req.user?.id);
      createSuccessResponse(200, { ...venueVendorData }, 'Successful', res, req);
    }
  );


  registerVenueVendorService = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { venueInfo, addressInfo, priceInfo, description, services, amenities, areas } = req.body;
      const files = req.files;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(errors.array());
        throw new BadRequestError('Validation failed');
      }

      if (venueInfo && addressInfo && description && services && amenities && priceInfo && areas) {
        await  this.venueVendorService.createVenue(
          {
            ...venueInfo,
            addressInfo,
            ...priceInfo,
            description,
            service: services,
            amenities,
            areas,
            user: req.user,
          },
          files
        );
      }
      createSuccessResponse(200, null, 'Successful', res, req);
    }
  );

  getAllVenueBookings = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      let { page = 1, limit = 10, status, selectedMonth, selectedYear, selectedEventType, selectedDays } = req.query;

      const filters = {
        selectedMonth: selectedMonth ? parseInt(selectedMonth as string, 10) : null,
        selectedYear: selectedYear ? parseInt(selectedYear as string, 10) : null,
        selectedEventType: selectedEventType?.toString() || null,
        selectedDays: selectedDays?.toString() || '',
      };

      const bookings = await  this.venueVendorService.getAllvenueBookings(
        { user: req.user },
        parseInt(page as string),
        parseInt(limit as string),
        status?.toString(),
        filters
      );
      createSuccessResponse(200, { ...bookings }, 'Successful', res, req);
    }
  );

  getVenueBookingDetails = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { bookingId } = req.params;
      const bookingData = await  this.venueVendorService.getOneBooking(bookingId);
      createSuccessResponse(200, { bookingData }, 'Successful', res, req);
    }
  );

  changeBookingStatus = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { bookingId } = req.params;
      const { status } = req.body;
      const bookingData = await  this.venueVendorService.changeBookingStatus(bookingId, status, req.user?.id);
      createSuccessResponse(200, { bookingData }, 'Successful', res, req);
    }
  );

  generateAdvancePayment = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { advancePayment, bookingId } = req.body.formValue;
      const bookingData = await  this.venueVendorService.generateAdvancePayment(bookingId, advancePayment);
      createSuccessResponse(200, { bookingData }, 'Successful', res, req);
    }
  );

  getAvailabilityInfo = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const availabilityData = await  this.venueVendorService.getAvailabilityInfo(req.user?.id);
      createSuccessResponse(200, { availabilityData }, 'Successful', res, req);
    }
  );

  addHoliday = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { date } = req.body;
      await  this.venueVendorService.addHoliday(req.user?.id, date);
      createSuccessResponse(200, null, 'Holiday added successfully', res, req);
    }
  );

  addNewEvent = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { formValue } = req.body;
      await  this.venueVendorService.addHoliday(req.user?.id, formValue);
      createSuccessResponse(200, null, 'Event added successfully', res, req);
    }
  );

  generateFullPayment = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { fullPaymentCharges, bookingId } = req.body;
      const bookingData = await  this.venueVendorService.generateFullPayment(bookingId, fullPaymentCharges);
      createSuccessResponse(200, { ...bookingData }, 'Successful', res, req);
    }
  );
}

export default new VenueVendorController(venueVendorService);



// const getVenueVendorDashboard = asyncHandler(
//   async (req: CustomRequest, res: Response): Promise<void> => {
//     console.log("i am here in venue vendorr dashboard");
//     const veneueVendorData = await  this.venueVendorService.getDashboardData(
//       req.user?.id
//     );
//     console.log(veneueVendorData);
//     createSuccessResponse(
//       200,
//       { ...veneueVendorData },
//       "successfull",
//       res,
//       req
//     );
//   }
// );

// const getVenueVendorProfile = asyncHandler(
//   async (req: CustomRequest, res: Response): Promise<void> => {
//     const vendorDetail = await vendorService.getVendor(
//       req?.user?.id,
//       "venue-vendor"
//     );
//     createSuccessResponse(200, { vendorDetail }, "successfull", res, req);
//   }
// );

// const getVenueVendorService = asyncHandler(
//   async (req: CustomRequest, res: Response): Promise<void> => {
//     const venueVendorData = await  this.venueVendorService.getVenue({
//       vendorId: req.user?.id,
//     });
//     createSuccessResponse(200, { venueVendorData }, "successfull", res, req);
//   }
// );

// const registerVenueVendorService = asyncHandler(
//   async (req: CustomRequest, res: Response): Promise<void> => {
//     const venueInfo = req.body?.venueInfo;
//     const addressInfo = req.body?.addressInfo;
//     const priceInfo = req.body?.priceInfo;
//     const description = req.body.description;
//     const services = req.body.services;
//     const amenities = req.body.amenities;
//     const areas = req.body.areas;
//     const files = req.files;

//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       console.log(errors.array());
//       throw new BadRequestError("Validation failed");
//     }

//     if (
//       venueInfo &&
//       addressInfo &&
//       description &&
//       services &&
//       amenities &&
//       priceInfo &&
//       areas
//     ) {
//       await  this.venueVendorService.createVenue(
//         {
//           ...venueInfo,
//           addressInfo,
//           ...priceInfo,
//           description,
//           service: services,
//           amenities,
//           areas,
//           user: req.user,
//         },
//         files
//       );
//     }
//     createSuccessResponse(200, null, "successfull", res, req);
//   }
// );

// const getAllVenueBookings = asyncHandler(
//   async (req: CustomRequest, res: Response): Promise<void> => {
//     let {
//       page = 1,
//       limit = 10,
//       status,
//       selectedMonth,
//       selectedYear,
//       selectedEventType,
//       selectedDays,
//     } = req.query;
//     page = parseInt(page as string);
//     limit = parseInt(limit as string);
//     status = status?.toString();

//     const filters = {
//       selectedMonth: selectedMonth
//         ? parseInt(selectedMonth as string, 10)
//         : null,
//       selectedYear: selectedYear ? parseInt(selectedYear as string, 10) : null,
//       selectedEventType: selectedEventType?.toString() || null,
//       selectedDays: selectedDays?.toString() || "",
//     };

//     const bookings = await  this.venueVendorService.getAllvenueBookings(
//       { user: req.user },
//       page,
//       limit,
//       status,
//       filters
//     );
//     createSuccessResponse(200, { ...bookings }, "successfull", res, req);
//   }
// );

// const getVenueBookingDetails = asyncHandler(
//   async (req: CustomRequest, res: Response): Promise<void> => {
//     const { bookingId } = req.params;
//     const bookingData = await  this.venueVendorService.getOneBooking(bookingId);
//     createSuccessResponse(200, { bookingData }, "successfull", res, req);
//   }
// );

// const changeBookingStatus = asyncHandler(
//   async (req: CustomRequest, res: Response): Promise<void> => {
//     const { bookingId } = req.params;
//     const { status } = req.body;
//     const bookingData = await  this.venueVendorService.changeBookingStatus(
//       bookingId,
//       status,
//       req?.user?.id
//     );
//     createSuccessResponse(200, { bookingData }, "successfull", res, req);
//   }
// );

// const generateAdvancePayment = asyncHandler(
//   async (req: CustomRequest, res: Response): Promise<void> => {
//     const { advancePayment, bookingId } = req.body?.formValue;
//     const bookingData = await  this.venueVendorService.generateAdvancePayment(
//       bookingId,
//       advancePayment
//     );
//     console.log(bookingData);
//     createSuccessResponse(200, { bookingData }, "successfull", res, req);
//   }
// );

// const getAvailabilityInfo = asyncHandler(
//   async (req: CustomRequest, res: Response): Promise<void> => {
//     const availabilityData = await  this.venueVendorService.getAvailabilityInfo(
//       req?.user?.id
//     );
//     console.log(availabilityData);
//     createSuccessResponse(200, { availabilityData }, "successfull", res, req);
//   }
// );

// const addHoliday = asyncHandler(
//   async (req: CustomRequest, res: Response): Promise<void> => {
//     const { date } = req.body;
//     const holiday = await  this.venueVendorService.addHoliday(req.user?.id, date);
//     createSuccessResponse(200, null, "Holiday added successfully", res, req);
//   }
// );

// const addNewEvent = asyncHandler(
//   async (req: CustomRequest, res: Response): Promise<void> => {
//     const { formValue } = req.body;
//     const holiday = await  this.venueVendorService.addHoliday(req.user?.id, formValue);
//     createSuccessResponse(200, null, "Holiday added successfully", res, req);
//   }
// );

// const generateFullPayment = asyncHandler(
//   async (req: CustomRequest, res: Response): Promise<void> => {
//     const { fullPaymentCharges, bookingId } = req.body;
//     console.log(fullPaymentCharges, bookingId);
//     const bookingData = await  this.venueVendorService.generateFullPayment(
//       bookingId,
//       fullPaymentCharges
//     );
//     console.log(bookingData, "bookingData");
//     createSuccessResponse(200, { ...bookingData }, "successfull", res, req);
//   }
// );

// export {
//   getVenueVendorDashboard,
//   getVenueVendorProfile,
//   getVenueVendorService,
//   registerVenueVendorService,
//   getAllVenueBookings,
//   getVenueBookingDetails,
//   changeBookingStatus,
//   generateAdvancePayment,
//   getAvailabilityInfo,
//   addHoliday,
//   addNewEvent,
//   generateFullPayment,
// };
