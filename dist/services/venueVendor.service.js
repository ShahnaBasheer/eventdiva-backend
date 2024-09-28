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
const addressModel_1 = __importDefault(require("../models/addressModel"));
const address_repository_1 = __importDefault(require("../repositories/address.repository"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const slugify_1 = __importDefault(require("slugify"));
const customError_1 = require("../errors/customError");
const venueVendor_repository_1 = __importDefault(require("../repositories/venueVendor.repository"));
const razorpay_1 = __importDefault(require("razorpay"));
const venueBooking_repository_1 = __importDefault(require("../repositories/venueBooking.repository"));
const helperFunctions_1 = require("../utils/helperFunctions");
const status_options_1 = require("../utils/status-options");
const availability_repository_1 = __importDefault(require("../repositories/availability.repository"));
const notification_repository_1 = __importDefault(require("../repositories/notification.repository"));
const cloudinary_config_1 = __importDefault(require("../config/cloudinary.config"));
const sharp_1 = __importDefault(require("sharp"));
const stream_1 = require("stream");
class VenueVendorService {
    constructor() {
        this._venueVendorRepository = new venueVendor_repository_1.default();
        this._addressRepository = new address_repository_1.default();
        this._venueBookingrepository = new venueBooking_repository_1.default();
        this._availabilityrepository = new availability_repository_1.default();
        this._notificationrepository = new notification_repository_1.default();
    }
    createVenue(userInfo, files) {
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
            // const coverPicPath = await this.fileStore(files?.coverPic, process.env.VV_COVERPIC,"VV_coverPic");
            // const docPath = await this.fileStore(files?.document, process.env.VV_DOCUMENTS,"VV_doc");
            // const portPath = await this.fileStore(files?.portfolios, process.env.VV_PORTFOLIOS,"VV_portfolio");
            console.log('createEventPlanner called');
            const coverPicPath = yield this.CloudinaryfileStore(files === null || files === void 0 ? void 0 : files.coverPic, "/Venues/CoverPics", "VV_coverpic");
            const docPath = yield this.CloudinaryfileStore(files === null || files === void 0 ? void 0 : files.document, "/Venues/DocumentS", "VV_doc");
            const portPath = yield this.CloudinaryfileStore(files === null || files === void 0 ? void 0 : files.portfolios, "/venues/Portfolios", "VV_portfolio");
            const address = yield this._addressRepository.create(Object.assign({}, userInfo.addressInfo));
            if (!address) {
                throw new customError_1.BadRequestError("Address creation failed. Please check the provided information!");
            }
            // Check if the company name is unique
            const existingVenue = yield this._venueVendorRepository.getOneByFilter({ company: userInfo.company });
            if (existingVenue) {
                throw new customError_1.ConflictError('Company name already exists. Please choose a different name.');
            }
            // Check if the email address is unique
            const existingEmail = yield this._venueVendorRepository.getOneByFilter({ 'contact.email': userInfo.email });
            if (existingEmail) {
                throw new customError_1.ConflictError('Email address already in use. Please choose a different email.');
            }
            // Generate a slug from company name
            const uniqueId = Math.floor(1000 + Math.random() * (90000 - 1000 + 1));
            const slug = (0, slugify_1.default)(userInfo.venueName, { lower: true, strict: true });
            // Prepare data for event planner
            const userData = Object.assign(Object.assign(Object.assign(Object.assign({ vendorId: userInfo.user._id, address: address === null || address === void 0 ? void 0 : address._id, contact: {
                    email: userInfo.email,
                    mobile: userInfo.mobile,
                }, venueName: userInfo.venueName, venueType: userInfo.venueType, slug: `${slug}-${uniqueId}`, startYear: userInfo.startYear, services: userInfo.service, capacity: userInfo.areas, amenities: userInfo.amenities, description: userInfo.description, rent: userInfo.rent }, ((userInfo === null || userInfo === void 0 ? void 0 : userInfo.includeRooms) && { rooms: {
                    count: userInfo.rooms.count,
                    roomStartingPrice: userInfo.rooms.startingPrice
                } })), ((userInfo === null || userInfo === void 0 ? void 0 : userInfo.includeDecor) && { decorStartingPrice: userInfo.decorStartingPrice })), ((userInfo === null || userInfo === void 0 ? void 0 : userInfo.includePricePerPlate) && { platePrice: {
                    vegPerPlate: userInfo.platePrice.vegPerPlate,
                    nonVegPerPlate: userInfo.platePrice.nonVegPerPlate
                } })), { coverPic: coverPicPath[0], portfolios: portPath, document: docPath[0] });
            // // Create event planner document
            const userDoc = yield this._venueVendorRepository.create(Object.assign({}, userData));
            if (userDoc) {
                const availabilityData = {
                    vendorId: userDoc.vendorId,
                    maxEvents: userInfo.maxEvents,
                    bookingType: 'VenueBooking',
                    bookedDates: [],
                    holyDays: []
                };
                yield this._availabilityrepository.create(availabilityData);
                yield this._notificationrepository.create({
                    userId: userInfo.user._id,
                    userType: 'Vendor',
                    message: `Your service has been successfully registered.`,
                    notificationType: 'service_registered'
                });
            }
            return userDoc;
        });
    }
    CloudinaryfileStore(files, folderName, fName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!files || !folderName || !fName) {
                throw new Error('Invalid input');
            }
            const processedImages = [];
            console.log(files.length, folderName);
            const uploadPromises = files.map((file) => {
                return new Promise((resolve, reject) => {
                    (0, sharp_1.default)(file.buffer, { failOnError: false })
                        .resize({ width: 800 })
                        .toBuffer()
                        .then((buffer) => {
                        const uploadStream = cloudinary_config_1.default.uploader.upload_stream({
                            folder: folderName,
                            public_id: `${fName}_${Date.now()}`,
                            resource_type: 'auto',
                        }, (error, result) => {
                            if (error) {
                                reject(error);
                            }
                            else {
                                resolve(result === null || result === void 0 ? void 0 : result.secure_url);
                            }
                        });
                        // Convert the optimized buffer into a stream and upload it
                        const bufferStream = stream_1.Readable.from(buffer);
                        bufferStream.pipe(uploadStream).on('error', (streamError) => {
                            reject(streamError);
                        });
                    })
                        .catch((err) => {
                        console.log(err);
                        console.error(`Sharp processing error: ${err.message}`);
                        // Skip the problematic file and resolve with null or a placeholder
                        resolve(null);
                    });
                });
            });
            // Filter out any null values (from skipped files)
            const results = yield Promise.all(uploadPromises);
            return results.filter(url => url !== null); // Only return successful uploads
        });
    }
    // Function to get all URLs from a specific folder
    getAllUrlsInFolder(folderName) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const fullPath = `${folderName}`;
                const { resources } = yield cloudinary_config_1.default.api.resources({
                    type: 'upload',
                    prefix: fullPath,
                    max_results: 500,
                    resource_type: 'auto',
                });
                return resources.map((resource) => resource.secure_url);
            }
            catch (error) {
                if (error.error.http_code === 404) {
                    console.log(`Folder not found: ${folderName}`);
                    return [];
                }
                else {
                    console.error("Error fetching resources from Cloudinary:", error);
                    const message = ((_a = error === null || error === void 0 ? void 0 : error.error) === null || _a === void 0 ? void 0 : _a.message) || "Unknown error";
                    throw new Error(`Failed to retrieve URLs from folder: ${message}`);
                }
            }
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
    getVenue(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._venueVendorRepository.getVenueDetail(Object.assign({}, filter));
        });
    }
    getAllVenues(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._venueVendorRepository.getAllWithPopuate(Object.assign({}, filter));
        });
    }
    getAllBookings(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const venue = yield this._venueVendorRepository.getVenue(Object.assign({}, filter));
            let bookings = null;
            if (venue) {
                bookings = yield this._venueBookingrepository.getAllBookings({ venueId: venue.id });
            }
            return bookings;
        });
    }
    getAllvenueBookings(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._venueBookingrepository.getAllBookings(Object.assign({}, filter));
        });
    }
    venueBooking(userInfo, slug) {
        return __awaiter(this, void 0, void 0, function* () {
            let booking;
            const venue = yield this.getVenue({ slug, approval: status_options_1.Status.Approved });
            if (!venue) {
                throw new Error(" Veneu does not Exist!");
            }
            const addressDocument = new addressModel_1.default(Object.assign({}, userInfo.addressInfo));
            const address = yield this._addressRepository.create(addressDocument);
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
                    bookingId: (0, helperFunctions_1.generateOrderId)('VV'),
                    venueId: venue.id,
                    customerId: userInfo.user.id,
                    address: address.id,
                    eventType: userInfo.eventType,
                    eventName: userInfo.eventName,
                    isMultipleDays: userInfo.isMultipleDays,
                    rooms: userInfo.rooms,
                    servicesRequested: userInfo.services,
                    guests: userInfo.guests,
                    contact: {
                        email: userInfo.email,
                        mobile: userInfo.mobile,
                    },
                    additionalNeeds: userInfo.additionalNeeds,
                    charges: {
                        platformCharge: 50
                    },
                    totalCost: 50,
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
                booking = (yield this._venueBookingrepository.registerBooking(bookingInfo));
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
            bookedData = yield this._venueBookingrepository.getOne({ 'payments.paymentInfo.id': razorpay_order_id });
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
                notificationType: 'booking_placed'
            });
            return bookedData;
        });
    }
    getOneBooking(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._venueBookingrepository.getOneBooking({ bookingId });
        });
    }
    changeBookingStatus(bookingId, status, vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const venueData = yield this._venueBookingrepository.update({ bookingId }, { status: status.toLowerCase() });
            if (!venueData) {
                throw new customError_1.BadRequestError('Booking not found!');
            }
            try {
                if (venueData && venueData.status === status_options_1.Status.Confirmed) {
                    const availabilityModel = yield this._availabilityrepository.findOneByFilter({ vendorId });
                    if (!availabilityModel) {
                        throw new customError_1.BadRequestError('Availability schema not found!');
                    }
                    // Convert startDate and endDate to Date objects
                    const startDate = new Date(venueData.eventDate.startDate);
                    const endDate = new Date(venueData.eventDate.endDate);
                    while (startDate <= endDate) {
                        // Check if the specific date exists in bookedDates
                        const existingDate = availabilityModel.bookedDates.find((dateObj) => dateObj.date.getTime() === startDate.getTime());
                        const newSlot = {
                            startTime: venueData === null || venueData === void 0 ? void 0 : venueData.eventDate.startTime,
                            endTime: venueData === null || venueData === void 0 ? void 0 : venueData.eventDate.endTime,
                            isExternal: false,
                            bookingId: venueData._id,
                        };
                        if (existingDate) {
                            // Check if adding the new slot would exceed the maximum allowed slots
                            if (existingDate.slots.length >= availabilityModel.maxEvents) {
                                throw new customError_1.BadRequestError(`Cannot add more slots for ${startDate.toDateString()}, maximum limit reached.`);
                            }
                            // Check if the new slot overlaps with any existing slots
                            const isOverlapping = existingDate.slots.some(slot => (newSlot.startTime < slot.endTime && newSlot.endTime > slot.startTime));
                            if (isOverlapping) {
                                throw new customError_1.BadRequestError(`Slot is already booked for ${startDate.toDateString()}.`);
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
                        message: `Booking for ${venueData.bookingId} has been Confirmed`,
                        notificationType: 'booking_confirmation'
                    });
                }
            }
            catch (error) {
                console.error('Error in changeBookingStatus:', error.message);
                yield this._venueBookingrepository.update({ bookingId }, { status: status_options_1.Status.Pending });
                if (error instanceof customError_1.BadRequestError)
                    throw error;
                throw new Error(`Failed to change booking status`);
            }
            return venueData;
        });
    }
    generateAdvancePayment(bookingId, advancePayment) {
        return __awaiter(this, void 0, void 0, function* () {
            const bookingData = yield this._venueBookingrepository.update({ bookingId }, { 'charges.advancePayments': advancePayment });
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
                            // Check for overlapping slots
                            return bookedDate.slots.some(slot => {
                                return ((formData.startTime < slot.endTime && formData.endTime > slot.startTime) // Fixed overlapping check
                                );
                            });
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
                throw new customError_1.BadRequestError('Failed to check availability. Please try again later.');
            }
        });
    }
    getAvailabilityInfo(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._availabilityrepository.findOneByFilter({ vendorId });
        });
    }
    venueStatusChange(slug, status) {
        return __awaiter(this, void 0, void 0, function* () {
            let change = status_options_1.Status.Pending;
            if (status === 'approved') {
                change = status_options_1.Status.Approved;
            }
            else if (status === 'rejected') {
                change = status_options_1.Status.Rejected;
            }
            return yield this._venueVendorRepository.update({ slug }, { approval: status });
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
    getDashboardData(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const venuevendor = yield this.getVenue({ vendorId });
            if (!venuevendor)
                throw new customError_1.BadRequestError('Venue Vendor is not found');
            const totalReveneuePipeline = [
                { $match: { venueId: venuevendor._id } },
                { $group: { _id: null, totalRevenue: { $sum: "$totalCost" } } }
            ];
            const totalBookingsPipeline = [
                { $match: { venueId: venuevendor._id, status: { $in: [status_options_1.Status.Pending, status_options_1.Status.Confirmed, status_options_1.Status.Completed] } } },
                { $count: "totalBookings" }
            ];
            const bookingStatusPipeline = [
                { $match: { venueId: venuevendor._id } },
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
                        venueId: venuevendor._id,
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
            const revenueOverTime = yield this._venueBookingrepository.getAggregateData(revenueOverTimePipeline);
            const totalRevenue = yield this._venueBookingrepository.getAggregateData(totalReveneuePipeline);
            const totalBookings = yield this._venueBookingrepository.getAggregateData(totalBookingsPipeline);
            const AllBookings = yield this._venueBookingrepository.getAggregateData(bookingStatusPipeline);
            return { totalRevenue, totalBookings, AllBookings, revenueOverTime };
        });
    }
    payAdvancepayment(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // Step 1: Fetch booking details
            const bookingDetail = yield this._venueBookingrepository.getOne({ bookingId });
            if (!bookingDetail) {
                throw new customError_1.BadRequestError('No Booking Detail Found!');
            }
            const advance = ((_a = bookingDetail.charges) === null || _a === void 0 ? void 0 : _a.advancePayments) || 0;
            // Step 2: If advance payment exists, proceed with Razorpay order creation
            let razorpayOrderData;
            if (advance) {
                const options = {
                    amount: advance * 100, // Razorpay expects amount in paise (1 INR = 100 paise)
                    currency: 'INR',
                };
                const razorpayInstance = new razorpay_1.default({
                    key_id: process.env.RAZOR_KEY_ID || '',
                    key_secret: process.env.RAZOR_KEY_SECRET || '',
                });
                // Create Razorpay order
                razorpayOrderData = yield razorpayInstance.orders.create(options);
                razorpayOrderData.amount_paid = advance;
                // Step 3: If Razorpay order was created, update booking details
                let updatedBooking;
                if (razorpayOrderData) {
                    // Update the booking information
                    const updatedBookingInfo = {
                        $set: {
                            totalCost: (bookingDetail === null || bookingDetail === void 0 ? void 0 : bookingDetail.totalCost) + advance, // Update totalCost
                        },
                        $push: {
                            payments: {
                                type: 'Advance Payment',
                                amount: advance, // Payment amount (advance)
                                mode: 'Razorpay', // Payment mode
                                paymentInfo: razorpayOrderData, // Razorpay order data
                                status: status_options_1.Status.Pending,
                            },
                        },
                    }, 
                    // Step 4: Save the updated booking
                    updatedBooking = yield this._venueBookingrepository.update({ bookingId }, updatedBookingInfo);
                    return { razorpayOrderData, booking: updatedBooking };
                }
                console.log(updatedBooking, "jjjj");
            }
            return null;
        });
    }
    payFullpayment(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            // Step 1: Fetch booking details
            const bookingDetail = yield this._venueBookingrepository.getOne({ bookingId });
            if (!bookingDetail) {
                throw new customError_1.BadRequestError('No Booking Detail Found!');
            }
            const totalServiceCharges = ((_c = (_b = (_a = bookingDetail === null || bookingDetail === void 0 ? void 0 : bookingDetail.charges) === null || _a === void 0 ? void 0 : _a.fullPayment) === null || _b === void 0 ? void 0 : _b.servicesCharges) === null || _c === void 0 ? void 0 : _c.reduce((sum, charge) => sum + charge.cost, 0)) || 0;
            const fullpayment = (((_e = (_d = bookingDetail === null || bookingDetail === void 0 ? void 0 : bookingDetail.charges) === null || _d === void 0 ? void 0 : _d.fullPayment) === null || _e === void 0 ? void 0 : _e.venueRental) || 0) + totalServiceCharges;
            // Step 2: If advance payment exists, proceed with Razorpay order creation
            let razorpayOrderData;
            if (fullpayment) {
                const options = {
                    amount: fullpayment * 100, // Razorpay expects amount in paise (1 INR = 100 paise)
                    currency: 'INR',
                };
                const razorpayInstance = new razorpay_1.default({
                    key_id: process.env.RAZOR_KEY_ID || '',
                    key_secret: process.env.RAZOR_KEY_SECRET || '',
                });
                // Create Razorpay order
                razorpayOrderData = yield razorpayInstance.orders.create(options);
                razorpayOrderData.amount_paid = fullpayment;
                // Step 3: If Razorpay order was created, update booking details
                let updatedBooking;
                if (razorpayOrderData) {
                    // Update the booking information
                    const updatedBookingInfo = {
                        $push: {
                            payments: {
                                type: 'Full Payment',
                                amount: fullpayment, // Payment amount (advance)
                                mode: 'Razorpay', // Payment mode
                                paymentInfo: razorpayOrderData, // Razorpay order data
                                status: status_options_1.Status.Pending,
                            },
                        },
                    }, 
                    // Step 4: Save the updated booking
                    updatedBooking = yield this._venueBookingrepository.update({ bookingId }, updatedBookingInfo);
                    return { razorpayOrderData, booking: updatedBooking };
                }
                console.log(updatedBooking, "jjjj");
            }
            return null;
        });
    }
    generateFullPayment(bookingId, fullPaymentCharges) {
        return __awaiter(this, void 0, void 0, function* () {
            // Fetch the current booking details to get the existing totalCost
            const bookingDetail = yield this._venueBookingrepository.getOne({ bookingId });
            if (!bookingDetail) {
                throw new Error('Booking not found');
            }
            // Create serviceCharges array by mapping charges
            const serviceCharges = fullPaymentCharges.charges.map(charge => ({
                service: charge.chargeName,
                cost: charge.amount,
            }));
            // Calculate the total sum of amounts
            const totalServiceCharges = fullPaymentCharges.charges.reduce((sum, charge) => sum + charge.amount, 0);
            // Add the new calculated charges to the existing totalCost
            const updatedTotalCost = bookingDetail.totalCost + fullPaymentCharges.planningFee + totalServiceCharges;
            // Perform the update operation
            const bookingData = yield this._venueBookingrepository.update({ bookingId }, // Find booking by bookingId
            {
                'charges.fullPayment.veneuRental': fullPaymentCharges.planningFee, // Update planningFee
                'charges.fullPayment.servicesCharges': serviceCharges, // Update servicesCharges with mapped values
                'totalCost': updatedTotalCost // Update totalCost by adding new charges to existing totalCost
            });
            return { bookingData, fullPayment: fullPaymentCharges.planningFee + totalServiceCharges };
        });
    }
}
exports.default = VenueVendorService;
