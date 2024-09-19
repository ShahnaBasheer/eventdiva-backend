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
const address_repository_1 = __importDefault(require("../repositories/address.repository"));
const eventPlanner_repository_1 = __importDefault(require("../repositories/eventPlanner.repository"));
const razorpay_1 = __importDefault(require("razorpay"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const slugify_1 = __importDefault(require("slugify"));
const customError_1 = require("../errors/customError");
const plannerBooking_repository_1 = __importDefault(require("../repositories/plannerBooking.repository"));
const helperFunctions_1 = require("../utils/helperFunctions");
const status_options_1 = require("../utils/status-options");
const availability_repository_1 = __importDefault(require("../repositories/availability.repository"));
const notification_repository_1 = __importDefault(require("../repositories/notification.repository"));
const socketIo_1 = require("../config/socketIo");
class EventPlannerService {
    constructor() {
        this._eventPlannerRepository = new eventPlanner_repository_1.default();
        this._addressRepository = new address_repository_1.default();
        this._plannerBookingrepository = new plannerBooking_repository_1.default();
        this._availabilityrepository = new availability_repository_1.default();
        this._notificationrepository = new notification_repository_1.default();
    }
    createEventPlanner(userInfo, files) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(files === null || files === void 0 ? void 0 : files.coverPic))
                throw new customError_1.ConflictError('Cover Picture is required');
            if (!(files === null || files === void 0 ? void 0 : files.document))
                throw new customError_1.ConflictError('Document is required');
            if (!(files === null || files === void 0 ? void 0 : files.portfolios))
                throw new customError_1.ConflictError('Portfolio files are required');
            if (!userInfo.addressInfo.street)
                delete userInfo.addressInfo.street;
            if (!userInfo.addressInfo.town)
                delete userInfo.addressInfo.town;
            if (!userInfo.addressInfo.landmark)
                delete userInfo.addressInfo.landmark;
            const address = yield this._addressRepository.create(Object.assign({}, userInfo.addressInfo));
            if (!address) {
                throw new customError_1.BadRequestError("Address creation failed. Please check the provided information!");
            }
            const coverPicPath = yield this.fileStore(files === null || files === void 0 ? void 0 : files.coverPic, process.env.EP_COVERPIC, "EP_coverPic");
            const docPath = yield this.fileStore(files === null || files === void 0 ? void 0 : files.document, process.env.EP_DOCUMENTS, "EP_doc");
            const portPath = yield this.fileStore(files === null || files === void 0 ? void 0 : files.portfolios, process.env.EP_PORTFOLIOS, "EP_portfolio");
            // Check if the company name is unique
            const existingEventPlanner = yield this._eventPlannerRepository.getOneByFilter({ company: userInfo.company });
            if (existingEventPlanner) {
                throw new customError_1.ConflictError('Company name already exists. Please choose a different name.');
            }
            // Check if the email address is unique
            const existingEmail = yield this._eventPlannerRepository.getOneByFilter({ 'contact.email': userInfo.email });
            if (existingEmail) {
                throw new customError_1.ConflictError('Email address already in use. Please choose a different email.');
            }
            // Generate a slug from company name
            const uniqueId = Math.floor(1000 + Math.random() * (90000 - 1000 + 1));
            const slug = (0, slugify_1.default)(userInfo.company, { lower: true, strict: true });
            if (address) {
                // Prepare data for event planner
                const userData = {
                    vendorId: userInfo.user._id,
                    address: address.id,
                    contact: {
                        email: userInfo.email,
                        mobile: userInfo.mobile,
                    },
                    company: userInfo.company,
                    slug: `${slug}-${uniqueId}`,
                    startYear: userInfo.startYear,
                    services: userInfo.service,
                    description: userInfo.description,
                    coverPic: coverPicPath[0],
                    portfolios: portPath,
                    document: docPath[0],
                    planningFee: {
                        minPrice: userInfo.minPrice,
                        maxPrice: userInfo.maxPrice,
                    },
                    plannedCities: userInfo.plannedCities,
                };
                // // Create event planner document
                const userDoc = yield this._eventPlannerRepository.create(userData);
                if (userDoc) {
                    const availabilityData = {
                        vendorId: userDoc.vendorId,
                        maxEvents: userInfo.maxEvents,
                        bookingType: 'EventPlannerBooking',
                        bookedDates: [],
                        holyDays: []
                    };
                    yield this._availabilityrepository.create(availabilityData);
                    // Emit notification via socket.io
                    const io = (0, socketIo_1.getIO)();
                    // await this._notificationrepository.create({ 
                    //         userId:  userInfo.user._id, 
                    //         userType: 'Vendor',
                    //         message: `Your service has been successfully registered.`,
                    //         notificationType: 'service_registered' 
                    //     }
                    // )  
                    console.log("heyyy you are here");
                    const notification = {
                        userId: userInfo.user._id,
                        role: 'Vendor',
                        message: `Your service has been successfully registered.`,
                        type: 'service_registered'
                    };
                    // Emit the notification event to the relevant client using Socket.IO
                    yield io.emit('save-notifications', notification);
                }
                return userDoc;
            }
            return null;
        });
    }
    fileStore(files, directory, fName) {
        return __awaiter(this, void 0, void 0, function* () {
            const processedImages = [];
            if (files) {
                for (const key in files) {
                    const file = files[key];
                    if (directory && fName) {
                        const originalExtension = path_1.default.extname(file.originalname);
                        const fileName = `${fName}_${Date.now()}${originalExtension}`;
                        if (!fs_1.default.existsSync(directory)) {
                            fs_1.default.mkdirSync(directory, { recursive: true });
                        }
                        const filePath = `${directory}/${fileName}`;
                        processedImages.push(fileName);
                        try {
                            yield fs_1.default.promises.writeFile(filePath, file.buffer);
                        }
                        catch (error) {
                            console.log("error", error === null || error === void 0 ? void 0 : error.message);
                            throw new customError_1.BadRequestError('');
                        }
                    }
                }
            }
            return processedImages;
        });
    }
    getEventPlanner(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._eventPlannerRepository.getPlannerDetail(Object.assign({}, filter));
        });
    }
    getAllEventPlanners(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._eventPlannerRepository.getAllWithPopuate(Object.assign({}, filter));
        });
    }
    getAllBookings(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const planner = yield this._eventPlannerRepository.getPlanner(filter);
            let bookings = null;
            if (planner) {
                bookings = yield this._plannerBookingrepository.getAllBookings({ eventPlannerId: planner.id });
            }
            return bookings;
        });
    }
    getAllplannerBookings(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._plannerBookingrepository.getAllBookings(Object.assign({}, filter));
        });
    }
    plannerBooking(userInfo, slug) {
        return __awaiter(this, void 0, void 0, function* () {
            let booking;
            const planner = yield this.getEventPlanner({ slug, approval: status_options_1.Status.Approved });
            if (!planner) {
                throw new Error(" Event Planner does not Exist!");
            }
            const address = yield this._addressRepository.create(userInfo.addressInfo);
            if (!address) {
                throw new customError_1.BadRequestError("Address creation failed. Please check the provided information!");
            }
            let razorpayOrderData;
            if (userInfo.paymentMode === 'Razorpay') {
                const options = {
                    amount: 50 * 100,
                    currency: 'INR',
                };
                const razorpayInstance = new razorpay_1.default({
                    key_id: process.env.RAZOR_KEY_ID || '',
                    key_secret: process.env.RAZOR_KEY_SECRET || '',
                });
                razorpayOrderData = yield razorpayInstance.orders.create(options);
                razorpayOrderData.amount_paid = 50;
            }
            if (razorpayOrderData) {
                let bookingInfo = {
                    bookingId: (0, helperFunctions_1.generateOrderId)('EP'),
                    eventPlannerId: planner.id,
                    customerId: userInfo.user.id,
                    address: address.id,
                    eventType: userInfo.eventType,
                    eventName: userInfo.eventName,
                    isMultipleDays: userInfo.isMultipleDays,
                    totalCost: 50,
                    guests: userInfo.guests,
                    contact: {
                        email: userInfo.email,
                        mobile: userInfo.mobile,
                    },
                    additionalNeeds: userInfo.additionalNeeds,
                    charges: {
                        platformCharge: 50
                    },
                    eventDate: {
                        startDate: userInfo.eventDate.startDate,
                        endDate: userInfo.eventDate.endDate,
                        startTime: userInfo.eventDate.startTime,
                        endTime: userInfo.eventDate.endTime
                    },
                    payments: [
                        {
                            type: 'Platform Fee',
                            amount: userInfo.platformCharge,
                            mode: userInfo.paymentMode,
                            paymentInfo: razorpayOrderData,
                        },
                    ]
                };
                booking = (yield this._plannerBookingrepository.registerBooking(bookingInfo));
            }
            return { razorpayOrderData, booking: booking === null || booking === void 0 ? void 0 : booking.id };
        });
    }
    razorPayment(razorPayData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = razorPayData;
            const CryptoJS = require('crypto-js');
            let bookedData;
            const generatedSignature = CryptoJS.HmacSHA256(`${razorpay_order_id}|${razorpay_payment_id}`, process.env.RAZOR_KEY_SECRET || '').toString();
            bookedData = yield this._plannerBookingrepository.getOne({ 'payments.paymentInfo.id': razorpay_order_id });
            if (!bookedData) {
                throw new customError_1.BadRequestError('Booking data not found. Payment verification failed.');
            }
            if (generatedSignature === razorpay_signature) {
                bookedData.payments[0].status = status_options_1.Status.Paid;
            }
            else {
                bookedData.payments[0].status = status_options_1.Status.Failed;
                throw new customError_1.BadRequestError('Invalid payment signature. Potential fraud attempt.');
            }
            yield bookedData.save();
            yield this._notificationrepository.create({
                userId: bookedData.customerId,
                userType: 'Customer',
                message: `Your booking for ${bookedData.eventName} has been placed successfully`,
                notificationType: 'booking_placed',
            });
            return bookedData;
        });
    }
    getOneBooking(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._plannerBookingrepository.getOneBooking({ bookingId });
        });
    }
    changeBookingStatus(bookingId, status, vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const plannerData = yield this._plannerBookingrepository.update({ bookingId }, { status: status.toLowerCase() });
            if (!plannerData) {
                throw new customError_1.BadRequestError('Booking not found!');
            }
            try {
                if (plannerData && plannerData.status === status_options_1.Status.Confirmed) {
                    const availabilityModel = yield this._availabilityrepository.findOneByFilter({ vendorId });
                    if (!availabilityModel) {
                        throw new customError_1.BadRequestError('Availability schema not found!');
                    }
                    // Convert startDate and endDate to Date objects
                    const startDate = new Date(plannerData.eventDate.startDate);
                    const endDate = new Date(plannerData.eventDate.endDate);
                    while (startDate <= endDate) {
                        // Check if the specific date exists in bookedDates
                        const existingDate = availabilityModel.bookedDates.find((dateObj) => dateObj.date.getTime() === startDate.getTime());
                        const newSlot = {
                            startTime: plannerData === null || plannerData === void 0 ? void 0 : plannerData.eventDate.startTime,
                            endTime: plannerData === null || plannerData === void 0 ? void 0 : plannerData.eventDate.endTime,
                            isExternal: false,
                            bookingId: plannerData._id,
                        };
                        if (existingDate) {
                            // Check if adding the new slot would exceed the maximum allowed slots
                            if (existingDate.slots.length >= availabilityModel.maxEvents) {
                                throw new customError_1.BadRequestError(`Cannot add more slots for ${startDate.toDateString()}, maximum limit reached.`);
                            }
                            // If the date exists, push the new slot into the existing date's slots array
                            yield this._availabilityrepository.update({ vendorId, 'bookedDates.date': startDate }, { $push: { 'bookedDates.$.slots': newSlot } });
                        }
                        else {
                            yield this._availabilityrepository.update({ vendorId }, { $push: { bookedDates: {
                                        date: new Date(startDate),
                                        slots: [newSlot],
                                    } } });
                        }
                        // Move to the next day
                        startDate.setDate(startDate.getDate() + 1);
                    }
                    yield this._notificationrepository.create({
                        userId: vendorId,
                        userType: 'Vendor',
                        message: `Booking for ${plannerData.bookingId} has been Confirmed`,
                        notificationType: 'booking_confirmation'
                    });
                    yield this._notificationrepository.create({
                        userId: plannerData.customerId,
                        userType: 'Customer',
                        message: `Your Booking for ${plannerData.bookingId} has been Confirmed`,
                        notificationType: 'booking_confirmation'
                    });
                }
            }
            catch (error) {
                console.error('Error in changeBookingStatus:', error.message);
                yield this._plannerBookingrepository.update({ bookingId }, { status: status_options_1.Status.Pending });
                if (error instanceof customError_1.BadRequestError)
                    throw error;
                throw new Error(`Failed to change booking status`);
            }
            return plannerData;
        });
    }
    generateAdvancePayment(bookingId, advancePayment) {
        return __awaiter(this, void 0, void 0, function* () {
            const bookingData = yield this._plannerBookingrepository.update({ bookingId }, { 'charges.advancePayments': advancePayment });
            console.log(bookingData);
            if (bookingData) {
                yield this._notificationrepository.create({
                    userId: bookingData.customerId,
                    userType: 'Customer',
                    message: `Advance Payment for ${bookingData.bookingId} has been generated`,
                    notificationType: 'advance_payment'
                });
            }
            return bookingData;
        });
    }
    checkAvailability(formData, vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const startDate = new Date(formData.startDate);
                const endDate = (formData === null || formData === void 0 ? void 0 : formData.endDate) ? new Date(formData.endDate) : startDate;
                if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                    throw new customError_1.BadRequestError('Invalid date format. Please try again later.');
                }
                // Get today's date and add 5 days to it
                const today = new Date();
                const minDate = new Date(today);
                minDate.setDate(today.getDate() + 5); // Set the minimum date to 5 days after today
                // Check if the selected start date is at least 5 days after today
                if (startDate.getTime() < minDate.getTime()) {
                    throw new customError_1.BadRequestError('The selected date must be at least 5 days after today.');
                }
                let datesArray = [];
                for (let date = new Date(startDate); date.getTime() <= endDate.getTime(); date.setDate(date.getDate() + 1)) {
                    datesArray.push(new Date(date));
                }
                const availabilityData = yield this._availabilityrepository.findOneByFilter({
                    vendorId,
                    holyDays: { $nin: datesArray } // Filter out documents where holyDays include any of the dates in datesArray
                });
                if (availabilityData) {
                    // Check if any date in the range is booked
                    const isBooked = datesArray.some(date => availabilityData.bookedDates.some(bookedDate => {
                        if (date.getTime() === bookedDate.date.getTime()) {
                            return bookedDate.slots.length >= availabilityData.maxEvents;
                        }
                        return false;
                    }));
                    if (isBooked) {
                        console.log('Some dates or slots are not available.');
                        return false; // Slot is not available
                    }
                    console.log('All dates and slots are available.');
                    return true; // Slot is available
                }
                else {
                    console.log('No availability data found for vendor.');
                    return false; // No availability data found
                }
            }
            catch (error) {
                console.error('Error checking availability:', error);
                throw error;
            }
        });
    }
    getAvailabilityInfo(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._availabilityrepository.findOneByFilter({ vendorId });
        });
    }
    plannerStatusChange(slug, status) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(slug, status);
            let change = status_options_1.Status.Pending;
            if (status === 'approved') {
                change = status_options_1.Status.Approved;
            }
            else if (status === 'rejected') {
                change = status_options_1.Status.Rejected;
            }
            return yield this._eventPlannerRepository.update({ slug }, { approval: change });
        });
    }
    addHoliday(vendorId, date) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Convert the date string to a Date object
                const holidayDate = new Date(date);
                // Check if the date is already booked
                const availability = yield this._availabilityrepository.findOneByFilter({ vendorId });
                if (!availability) {
                    throw new Error('Vendor not found');
                }
                // Check if the date is already in bookedDates
                const isBooked = availability.bookedDates.some(bookedDate => bookedDate.date.toDateString() === holidayDate.toDateString());
                if (isBooked) {
                    throw new customError_1.ConflictError('Date is already booked, Cnnot add as Holiday!');
                }
                // Check if the date is already in holyDays
                const isHoliday = availability.holyDays.some(holiday => holiday.toDateString() === holidayDate.toDateString());
                if (isHoliday) {
                    throw new customError_1.ConflictError('Date is already a holiday!');
                }
                // Add the date to holyDays
                availability.holyDays.push(holidayDate);
                yield availability.save();
                return true;
            }
            catch (error) {
                if (error instanceof customError_1.CustomError) {
                    throw error;
                }
            }
        });
    }
    addNewEvent(formValue, vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(formValue, "form value");
                const { eventDate, startTime, endTime, customerName, eventName, place } = formValue;
                const newSlot = { startTime, endTime, isExternal: true,
                    externalBookingDetails: { customerName, eventName, place }
                };
                // Convert the eventDate to a Date object
                const eventDateObj = new Date(eventDate);
                // Find the vendor's availability document by vendorId
                let availability = yield this._availabilityrepository.findOneByFilter({ vendorId });
                if (!availability) {
                    throw new Error('Vendor availability not found');
                }
                // Check if the date already exists in bookedDates
                const dateIndex = availability.bookedDates.findIndex(bookedDate => bookedDate.date.toDateString() === eventDateObj.toDateString());
                if (dateIndex !== -1) {
                    // If date exists, add the new slot to the existing date's slots array
                    availability.bookedDates[dateIndex].slots.push(newSlot);
                }
                else {
                    // If date does not exist, create a new date entry with the new slot
                    availability.bookedDates.push({
                        date: eventDateObj,
                        slots: [newSlot]
                    });
                }
                // Save the updated availability document
                yield availability.save();
                return true;
            }
            catch (error) {
                console.error('Error adding new external event:', error);
                throw new Error('Failed to add new external event');
            }
        });
    }
    getDashboardData(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const eventPlanner = yield this.getEventPlanner({ vendorId });
            if (!eventPlanner)
                throw new customError_1.BadRequestError('Event Planner is not found');
            const totalReveneuePipeline = [
                { $match: { eventPlannerId: eventPlanner._id } },
                { $group: { _id: null, totalRevenue: { $sum: "$totalCost" } } }
            ];
            const totalBookingsPipeline = [
                { $match: { eventPlannerId: eventPlanner._id, status: { $in: [status_options_1.Status.Pending, status_options_1.Status.Confirmed, status_options_1.Status.Completed] } } },
                { $count: "totalBookings" }
            ];
            const bookingStatusPipeline = [
                { $match: { eventPlannerId: eventPlanner._id } },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        status: "$_id", // Project the status field from _id
                        count: 1 // Include the count field
                    }
                }
            ];
            const currentYear = new Date().getFullYear();
            const revenueOverTimePipeline = [
                {
                    $match: {
                        eventPlannerId: eventPlanner._id,
                        updatedAt: {
                            $gte: new Date(`${currentYear}-01-01`), // From the start of the current year
                            $lt: new Date(`${currentYear + 1}-01-01`) // Before the start of the next year
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$updatedAt" }, // Group by year
                            month: { $month: "$updatedAt" } // Group by month
                        },
                        monthlyRevenue: { $sum: "$totalCost" }
                    }
                },
                {
                    $sort: { "_id.year": 1, "_id.month": 1 } // Sort by year and month
                },
                {
                    $project: {
                        _id: 0,
                        month: "$_id.month",
                        year: "$_id.year",
                        revenue: "$monthlyRevenue"
                    }
                }
            ];
            const revenueOverTime = yield this._plannerBookingrepository.getAggregateData(revenueOverTimePipeline);
            const totalRevenue = yield this._plannerBookingrepository.getAggregateData(totalReveneuePipeline);
            const totalBookings = yield this._plannerBookingrepository.getAggregateData(totalBookingsPipeline);
            const AllBookings = yield this._plannerBookingrepository.getAggregateData(bookingStatusPipeline);
            return { totalRevenue, totalBookings, AllBookings, revenueOverTime };
        });
    }
}
exports.default = EventPlannerService;
