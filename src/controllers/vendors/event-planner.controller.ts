import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { CustomRequest } from '../../interfaces/request.interface';
import createSuccessResponse from '../../utils/responseFormatter';
import { validationResult } from 'express-validator';
import { BadRequestError } from '../../errors/customError';
import { eventPlannerService } from '../../config/dependencyContainer';
import EventPlannerService from '../../services/eventPlanner.service';




export class EventPlannerController {

  constructor(private eventPlannerService: EventPlannerService) {}

  getEventPlannerDashboard = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const eventPlannerData = await this.eventPlannerService.getDashboardData(
        req.user?.id
      );
      createSuccessResponse(200, { ...eventPlannerData }, "successfull", res, req);
    }
  );

  registerEventPlannerService = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { companyInfo, addressInfo, description, services, plannedCities } = req.body;
      const files = req.files;

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        console.log(errors.array());
        throw new BadRequestError("Validation failed");
      }

      if (companyInfo && addressInfo && description && services && plannedCities) {
        await this.eventPlannerService.createEventPlanner(
          {
            ...companyInfo,
            addressInfo,
            description,
            service: services,
            plannedCities,
            user: req.user,
          },
          files
        );
      }
      createSuccessResponse(200, null, "successfull", res, req);
    }
  );

  getAllPlannerBookings = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      let { page = 1, limit = 10, status, selectedMonth, selectedYear, selectedEventType, selectedDays } =
        req.query;
      page = parseInt(page as string);
      limit = parseInt(limit as string);
      status = status?.toString();

      const filters = {
        selectedMonth: selectedMonth ? parseInt(selectedMonth as string, 10) : null,
        selectedYear: selectedYear ? parseInt(selectedYear as string, 10) : null,
        selectedEventType: selectedEventType?.toString() || null,
        selectedDays: selectedDays?.toString() || "",
      };

      const bookings = await this.eventPlannerService.getAllplannerBookings(
        { user: req.user },
        page,
        limit,
        status,
        filters
      );
      createSuccessResponse(200, { ...bookings }, "successfull", res, req);
    }
  );

  getPlannerBookingDetails = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { bookingId } = req.params;
      const bookingData = await this.eventPlannerService.getOneBooking(bookingId);
      createSuccessResponse(200, { bookingData }, "successfull", res, req);
    }
  );

  changeBookingStatus = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { bookingId } = req.params;
      const { status } = req.body;
      const bookingData = await this.eventPlannerService.changeBookingStatus(
        bookingId,
        status,
        req.user?.id
      );
      createSuccessResponse(200, { bookingData }, "successfull", res, req);
    }
  );

  generateAdvancePayment = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { advancePayment, bookingId } = req.body.formValue;
      const bookingData = await this.eventPlannerService.generateAdvancePayment(
        bookingId,
        advancePayment
      );
      console.log(bookingData, "bookingData", bookingId, advancePayment);
      createSuccessResponse(200, { bookingData }, "successfull", res, req);
    }
  );

  getAvailabilityInfo = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const availabilityData = await this.eventPlannerService.getAvailabilityInfo(
        req?.user?.id
      );
      console.log(availabilityData, "availability data");
      createSuccessResponse(200, { availabilityData }, "successfull", res, req);
    }
  );

  addHoliday = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { date } = req.body;
      const holiday = await this.eventPlannerService.addHoliday(req.user?.id, date);
      createSuccessResponse(200, null, "Holiday added successfully", res, req);
    }
  );

  addNewEvent = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { formValue } = req.body;
      const holiday = await this.eventPlannerService.addNewEvent(req.user?.id, formValue);
      createSuccessResponse(200, null, "Event added successfully", res, req);
    }
  );

  generateFullPayment = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { fullPaymentCharges, bookingId } = req.body;
      console.log(fullPaymentCharges, bookingId);
      const bookingData = await this.eventPlannerService.generateFullPayment(
        bookingId,
        fullPaymentCharges
      );
      console.log(bookingData, "bookingData");
      createSuccessResponse(200, { ...bookingData }, "successfull", res, req);
    }
  );
}


export default new EventPlannerController(eventPlannerService);


// const getEventPlannerDashboard = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
//     const eventPlannerData = await eventPlannerService.getDashboardData(req.user?.id);
//     console.log("i am here in eventplanner dashboard", eventPlannerData);
//     createSuccessResponse(200, { ...eventPlannerData } , "successfull", res, req)
// });


// const getEventPlanner= asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
//     const eventPlannerData = await eventPlannerService.getEventPlanner({ vendorId: req.user?.id });
//     createSuccessResponse(200, { eventPlannerData } , "successfull", res, req);
// });


// const registerEventPlannerService = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
//     const companyInfo = req.body?.companyInfo;
//     const addressInfo = req.body?.addressInfo;
//     const description = req.body.description;     
//     const services = req.body.services;
//     const plannedCities = req.body.plannedCities;
//     const files = req.files
    
//     const errors = validationResult(req);
    
//     if (!errors.isEmpty()) {
//         console.log( errors.array())
//         throw new BadRequestError('Validation failed'); 
//     } 
     
//     if(companyInfo && addressInfo && description && services && plannedCities){
//         await eventPlannerService.createEventPlanner({
//             ...companyInfo, addressInfo, description, service: services, plannedCities,
//             user: req.user
//         }, files)
//     }     
//     createSuccessResponse(200, null , "successfull", res, req);
// });

// const getAllPlannerBookings = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
//     let { page = 1, limit = 10, status, selectedMonth, selectedYear, selectedEventType, selectedDays } = req.query;
//     page = parseInt(page as string);
//     limit = parseInt(limit as string);
//     status = status?.toString();


//     const filters = {
//         selectedMonth : selectedMonth ? parseInt(selectedMonth as string, 10) : null,
//         selectedYear : selectedYear ? parseInt(selectedYear as string, 10) : null,
//         selectedEventType : selectedEventType?.toString() || null,
//         selectedDays : selectedDays?.toString() || '',
//     }
    
//     const bookings = await eventPlannerService.getAllplannerBookings({user: req.user}, page, limit, status, filters);
//     createSuccessResponse(200, { ...bookings } , "successfull", res, req);
// });


// const getPlannerBookingDetails = asyncHandler( async(req: CustomRequest, res: Response): Promise<void> => {
//     const { bookingId } = req.params;
//     const bookingData = await eventPlannerService.getOneBooking(bookingId);
//     createSuccessResponse(200, { bookingData } , "successfull", res, req);
// })


// const changeBookingStatus = asyncHandler( async(req: CustomRequest, res: Response): Promise<void> => {
//     const { bookingId } = req.params;
//     const { status } = req.body;
//     const bookingData = await eventPlannerService.changeBookingStatus(bookingId, status, req.user?.id);
//     createSuccessResponse(200, { bookingData } , "successfull", res, req);
// })

// const generateAdvancePayment = asyncHandler( async(req: CustomRequest, res: Response): Promise<void> => {
//     const { advancePayment, bookingId } = req.body.formValue;
//     const bookingData = await eventPlannerService.generateAdvancePayment(bookingId, advancePayment);
//     console.log(bookingData, "bookingData", bookingId, advancePayment)
//     createSuccessResponse(200, { bookingData } , "successfull", res, req);
// })

// const getAvailabilityInfo = asyncHandler( async(req: CustomRequest, res: Response): Promise<void> => {
//     const availabilityData = await eventPlannerService.getAvailabilityInfo(req?.user?.id);
//     console.log(availabilityData, "availability data")
//     createSuccessResponse(200, { availabilityData } , "successfull", res, req);
// })


// const addHoliday = asyncHandler( async(req: CustomRequest, res: Response): Promise<void> => {
//     const { date } = req.body;
//     const holiday = await eventPlannerService.addHoliday(req.user?.id, date);
//     createSuccessResponse(200, null , "Holiday added successfully", res, req);
// });


// const addNewEvent = asyncHandler( async(req: CustomRequest, res: Response): Promise<void> => {
//     const { formValue } = req.body;
//     const holiday = await eventPlannerService.addNewEvent(req.user?.id, formValue);
//     createSuccessResponse(200, null , "Holiday added successfully", res, req);
// });

// const generateFullPayment = asyncHandler( async(req: CustomRequest, res: Response): Promise<void> => {
//     const { fullPaymentCharges, bookingId } = req.body;
//     console.log(fullPaymentCharges, bookingId);
//     const bookingData = await eventPlannerService.generateFullPayment(bookingId, fullPaymentCharges);
//     console.log(bookingData, "bookingData")
//     createSuccessResponse(200, { ...bookingData } , "successfull", res, req);
// })

// export {
//     getEventPlannerDashboard,
//     getEventPlanner,
//     registerEventPlannerService,
//     getAllPlannerBookings,
//     getPlannerBookingDetails,
//     changeBookingStatus,
//     generateAdvancePayment,
//     getAvailabilityInfo,
//     addHoliday,
//     addNewEvent,
//     generateFullPayment

// };




