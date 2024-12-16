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
exports.EventPlannerController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const responseFormatter_1 = __importDefault(require("../../utils/responseFormatter"));
const express_validator_1 = require("express-validator");
const customError_1 = require("../../errors/customError");
const dependencyContainer_1 = require("../../config/dependencyContainer");
class EventPlannerController {
    constructor(eventPlannerService) {
        this.eventPlannerService = eventPlannerService;
        this.getEventPlannerDashboard = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const eventPlannerData = yield this.eventPlannerService.getDashboardData((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            (0, responseFormatter_1.default)(200, Object.assign({}, eventPlannerData), "successfull", res, req);
        }));
        this.registerEventPlannerService = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { companyInfo, addressInfo, description, services, plannedCities } = req.body;
            const files = req.files;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                console.log(errors.array());
                throw new customError_1.BadRequestError("Validation failed");
            }
            if (companyInfo && addressInfo && description && services && plannedCities) {
                yield this.eventPlannerService.createEventPlanner(Object.assign(Object.assign({}, companyInfo), { addressInfo,
                    description, service: services, plannedCities, user: req.user }), files);
            }
            (0, responseFormatter_1.default)(200, null, "successfull", res, req);
        }));
        this.getAllPlannerBookings = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            let { page = 1, limit = 10, status, selectedMonth, selectedYear, selectedEventType, selectedDays } = req.query;
            page = parseInt(page);
            limit = parseInt(limit);
            status = status === null || status === void 0 ? void 0 : status.toString();
            const filters = {
                selectedMonth: selectedMonth ? parseInt(selectedMonth, 10) : null,
                selectedYear: selectedYear ? parseInt(selectedYear, 10) : null,
                selectedEventType: (selectedEventType === null || selectedEventType === void 0 ? void 0 : selectedEventType.toString()) || null,
                selectedDays: (selectedDays === null || selectedDays === void 0 ? void 0 : selectedDays.toString()) || "",
            };
            const bookings = yield this.eventPlannerService.getAllplannerBookings({ user: req.user }, page, limit, status, filters);
            (0, responseFormatter_1.default)(200, Object.assign({}, bookings), "successfull", res, req);
        }));
        this.getPlannerBookingDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { bookingId } = req.params;
            const bookingData = yield this.eventPlannerService.getOneBooking(bookingId);
            (0, responseFormatter_1.default)(200, { bookingData }, "successfull", res, req);
        }));
        this.changeBookingStatus = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { bookingId } = req.params;
            const { status } = req.body;
            const bookingData = yield this.eventPlannerService.changeBookingStatus(bookingId, status, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            (0, responseFormatter_1.default)(200, { bookingData }, "successfull", res, req);
        }));
        this.generateAdvancePayment = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { advancePayment, bookingId } = req.body.formValue;
            const bookingData = yield this.eventPlannerService.generateAdvancePayment(bookingId, advancePayment);
            console.log(bookingData, "bookingData", bookingId, advancePayment);
            (0, responseFormatter_1.default)(200, { bookingData }, "successfull", res, req);
        }));
        this.getAvailabilityInfo = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const availabilityData = yield this.eventPlannerService.getAvailabilityInfo((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id);
            console.log(availabilityData, "availability data");
            (0, responseFormatter_1.default)(200, { availabilityData }, "successfull", res, req);
        }));
        this.addHoliday = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { date } = req.body;
            const holiday = yield this.eventPlannerService.addHoliday((_a = req.user) === null || _a === void 0 ? void 0 : _a.id, date);
            (0, responseFormatter_1.default)(200, null, "Holiday added successfully", res, req);
        }));
        this.addNewEvent = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { formValue } = req.body;
            const holiday = yield this.eventPlannerService.addNewEvent((_a = req.user) === null || _a === void 0 ? void 0 : _a.id, formValue);
            (0, responseFormatter_1.default)(200, null, "Event added successfully", res, req);
        }));
        this.generateFullPayment = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { fullPaymentCharges, bookingId } = req.body;
            console.log(fullPaymentCharges, bookingId);
            const bookingData = yield this.eventPlannerService.generateFullPayment(bookingId, fullPaymentCharges);
            console.log(bookingData, "bookingData");
            (0, responseFormatter_1.default)(200, Object.assign({}, bookingData), "successfull", res, req);
        }));
    }
}
exports.EventPlannerController = EventPlannerController;
exports.default = new EventPlannerController(dependencyContainer_1.eventPlannerService);
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
