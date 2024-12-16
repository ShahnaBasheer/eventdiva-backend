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
const responseFormatter_1 = __importDefault(require("../../utils/responseFormatter"));
const express_validator_1 = require("express-validator");
const customError_1 = require("../../errors/customError");
const dependencyContainer_1 = require("../../config/dependencyContainer");
class VenueVendorController {
    constructor(venueVendorService) {
        this.venueVendorService = venueVendorService;
        this.getVenueVendorDashboard = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const venueVendorData = yield this.venueVendorService.getDashboardData((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            (0, responseFormatter_1.default)(200, Object.assign({}, venueVendorData), 'Successful', res, req);
        }));
        this.registerVenueVendorService = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { venueInfo, addressInfo, priceInfo, description, services, amenities, areas } = req.body;
            const files = req.files;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                console.log(errors.array());
                throw new customError_1.BadRequestError('Validation failed');
            }
            if (venueInfo && addressInfo && description && services && amenities && priceInfo && areas) {
                yield this.venueVendorService.createVenue(Object.assign(Object.assign(Object.assign(Object.assign({}, venueInfo), { addressInfo }), priceInfo), { description, service: services, amenities,
                    areas, user: req.user }), files);
            }
            (0, responseFormatter_1.default)(200, null, 'Successful', res, req);
        }));
        this.getAllVenueBookings = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            let { page = 1, limit = 10, status, selectedMonth, selectedYear, selectedEventType, selectedDays } = req.query;
            const filters = {
                selectedMonth: selectedMonth ? parseInt(selectedMonth, 10) : null,
                selectedYear: selectedYear ? parseInt(selectedYear, 10) : null,
                selectedEventType: (selectedEventType === null || selectedEventType === void 0 ? void 0 : selectedEventType.toString()) || null,
                selectedDays: (selectedDays === null || selectedDays === void 0 ? void 0 : selectedDays.toString()) || '',
            };
            const bookings = yield this.venueVendorService.getAllvenueBookings({ user: req.user }, parseInt(page), parseInt(limit), status === null || status === void 0 ? void 0 : status.toString(), filters);
            (0, responseFormatter_1.default)(200, Object.assign({}, bookings), 'Successful', res, req);
        }));
        this.getVenueBookingDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { bookingId } = req.params;
            const bookingData = yield this.venueVendorService.getOneBooking(bookingId);
            (0, responseFormatter_1.default)(200, { bookingData }, 'Successful', res, req);
        }));
        this.changeBookingStatus = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { bookingId } = req.params;
            const { status } = req.body;
            const bookingData = yield this.venueVendorService.changeBookingStatus(bookingId, status, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            (0, responseFormatter_1.default)(200, { bookingData }, 'Successful', res, req);
        }));
        this.generateAdvancePayment = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { advancePayment, bookingId } = req.body.formValue;
            const bookingData = yield this.venueVendorService.generateAdvancePayment(bookingId, advancePayment);
            (0, responseFormatter_1.default)(200, { bookingData }, 'Successful', res, req);
        }));
        this.getAvailabilityInfo = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const availabilityData = yield this.venueVendorService.getAvailabilityInfo((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            (0, responseFormatter_1.default)(200, { availabilityData }, 'Successful', res, req);
        }));
        this.addHoliday = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { date } = req.body;
            yield this.venueVendorService.addHoliday((_a = req.user) === null || _a === void 0 ? void 0 : _a.id, date);
            (0, responseFormatter_1.default)(200, null, 'Holiday added successfully', res, req);
        }));
        this.addNewEvent = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { formValue } = req.body;
            yield this.venueVendorService.addHoliday((_a = req.user) === null || _a === void 0 ? void 0 : _a.id, formValue);
            (0, responseFormatter_1.default)(200, null, 'Event added successfully', res, req);
        }));
        this.generateFullPayment = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { fullPaymentCharges, bookingId } = req.body;
            const bookingData = yield this.venueVendorService.generateFullPayment(bookingId, fullPaymentCharges);
            (0, responseFormatter_1.default)(200, Object.assign({}, bookingData), 'Successful', res, req);
        }));
    }
}
exports.default = new VenueVendorController(dependencyContainer_1.venueVendorService);
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
