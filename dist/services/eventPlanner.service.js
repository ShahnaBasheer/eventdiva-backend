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
const razorpay_1 = __importDefault(require("razorpay"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const slugify_1 = __importDefault(require("slugify"));
const customError_1 = require("../errors/customError");
const helperFunctions_1 = require("../utils/helperFunctions");
const status_options_1 = require("../utils/status-options");
const socketIo_1 = require("../config/socketIo");
const cloudinary_config_1 = __importDefault(require("../config/cloudinary.config"));
const stream_1 = require("stream");
const sharp_1 = __importDefault(require("sharp"));
const eventsVariables_1 = require("../utils/eventsVariables");
const important_variables_1 = require("../utils/important-variables");
const razorpay_utils_1 = require("razorpay/dist/utils/razorpay-utils");
class EventPlannerService {
    constructor(_eventPlannerRepository, _addressRepository, _plannerBookingrepository, _availabilityrepository, _notificationrepository) {
        this._eventPlannerRepository = _eventPlannerRepository;
        this._addressRepository = _addressRepository;
        this._plannerBookingrepository = _plannerBookingrepository;
        this._availabilityrepository = _availabilityrepository;
        this._notificationrepository = _notificationrepository;
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
            // const coverPicPath = await this.fileStore(files?.coverPic, process.env.EP_COVERPIC,"EP_coverPic");
            // const docPath = await this.fileStore(files?.document, process.env.EP_DOCUMENTS,"EP_doc");
            // const portPath = await this.fileStore(files?.portfolios, process.env.EP_PORTFOLIOS,"EP_portfolio");
            console.log('createEventPlanner called');
            const coverPicPath = yield this.CloudinaryfileStore(files === null || files === void 0 ? void 0 : files.coverPic, "/Event_Planners/CoverPics", "EP_coverpic");
            const docPath = yield this.CloudinaryfileStore(files === null || files === void 0 ? void 0 : files.document, "/Event_Planners/DocumentS", "EP_doc");
            const portPath = yield this.CloudinaryfileStore(files === null || files === void 0 ? void 0 : files.portfolios, "/Event_Planners/Portfolios", "EP_portfolio");
            const address = yield this._addressRepository.create(Object.assign({}, userInfo.addressInfo));
            if (!address) {
                throw new customError_1.BadRequestError("Address creation failed. Please check the provided information!");
            }
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
                    //    const notification = { 
                    //        userId:  userInfo.user._id, 
                    //        role: 'Vendor',
                    //        message: `Your service has been successfully registered.`,
                    //        type: 'service_registered' 
                    //    }
                    const notification = yield (0, helperFunctions_1.handleNotification)({ type: eventsVariables_1.NotificationType.SERVICE_REGISTERED,
                        userId: userInfo.user._id,
                        role: important_variables_1.UserRole.Vendor,
                    });
                    // Emit the notification event to the relevant client using Socket.IO
                    io.emit('loaded-notification', { notification });
                }
                return userDoc;
            }
            return null;
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
    getEventPlanner(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._eventPlannerRepository.getPlannerDetail(Object.assign({}, filter));
        });
    }
    // async getAllEventPlanners(filter: Filter){
    //     return this._eventPlannerRepository.getAllWithPopuate({ ...filter })
    // }
    getAllEventPlanners() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 10, approval, allfilters, search) {
            var _a, _b;
            const skip = (page - 1) * limit;
            try {
                // Initialize the filter query
                let filterQuery = {};
                if (approval) {
                    filterQuery["approval"] = approval;
                }
                if (search) {
                    filterQuery["company"] = { $regex: search, $options: "i" }; // Case-insensitive search
                }
                // Count pipeline to get total count with filtering logic
                const countPipeline = [
                    {
                        $lookup: {
                            from: "addresses", // Ensure this matches your Address model's collection name
                            localField: "address",
                            foreignField: "_id",
                            as: "location",
                        },
                    },
                    {
                        $unwind: {
                            path: "$location",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    { $match: filterQuery },
                    { $unwind: {
                            path: "$services",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            locations: { $addToSet: "$location.city" },
                            services: { $addToSet: "$services" },
                        },
                    },
                ];
                // Fetch total venue count and aggregated data
                const countResult = (_a = (yield this._eventPlannerRepository.getAggregateData(countPipeline))) !== null && _a !== void 0 ? _a : [];
                // Build the filtering criteria based on the provided filters
                if (allfilters) {
                    // Location filter
                    if (allfilters.location) {
                        filterQuery["address.city"] = allfilters.location;
                    }
                    // Services filter
                    if (allfilters.services && allfilters.services.length > 0) {
                        filterQuery["services"] = { $in: allfilters.services };
                    }
                }
                const pipeline = [
                    {
                        $lookup: {
                            from: "addresses", // Ensure this matches your Address model's collection name
                            localField: "address", // The field in the venue documents that contains the address ID
                            foreignField: "_id", // The field in the addresses collection that matches the address ID
                            as: "address", // The name of the field where the populated address will be stored
                        },
                    },
                    { $match: filterQuery, },
                    { $sort: { createdAt: -1 }, },
                    {
                        $facet: {
                            metadata: [{ $count: "totalCount" }], // Count total matching documents
                            planners: [
                                { $sort: { createdAt: -1 } },
                                {
                                    $project: {
                                        slug: 1,
                                        company: 1,
                                        contact: 1,
                                        planningFee: 1,
                                        address: { $arrayElemAt: ["$address", 0] },
                                        services: 1,
                                        coverPic: 1,
                                        approval: 1,
                                        startYear: 1,
                                    },
                                },
                                { $skip: skip },
                                { $limit: limit },
                            ],
                        },
                    },
                    {
                        $project: {
                            planners: 1,
                            totalCount: { $arrayElemAt: ["$metadata.totalCount", 0] },
                        },
                    },
                ];
                // Fetch the filtered and paginated venue data
                const plannersData = (yield this._eventPlannerRepository.getAggregateData(pipeline)) || [];
                const totalPages = Math.ceil(((_b = plannersData[0]) === null || _b === void 0 ? void 0 : _b.totalCount) / limit);
                return {
                    eventPlanners: plannersData[0].planners,
                    totalCount: plannersData[0].totalCount,
                    totalPages, filterData: countResult[0]
                };
            }
            catch (error) {
                console.error("Error fetching venues:", error);
                throw new customError_1.BadRequestError("Something went wrong!");
            }
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
    // async getAllplannerBookings(filter: Filter): Promise<[] | null>{
    //     return await this._plannerBookingrepository.getAllBookings({ ...filter });
    // }
    getAllplannerBookings(filter_1) {
        return __awaiter(this, arguments, void 0, function* (filter, page = 1, limit = 10, status = '', allfilters) {
            var _a;
            console.log(page, limit, status, "page and limit");
            let planner = null;
            let filterQuery = {};
            let bookings = null;
            let completedBookingsCount = 0;
            const skip = (page - 1) * limit;
            try {
                // Retrieve venue if user is provided in filter
                if (filter.user) {
                    planner = (yield this._eventPlannerRepository.getPlanner({ vendorId: filter === null || filter === void 0 ? void 0 : filter.user._id }));
                    console.log(planner, "jnjnkk");
                    if (planner) {
                        filterQuery = { eventPlannerId: planner._id };
                    }
                }
                // Aggregate to get filter data
                const aggregate = [
                    { $match: filterQuery },
                    {
                        $addFields: {
                            year: { $year: "$eventDate.startDate" },
                            month: { $month: "$eventDate.startDate" }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            years: { $addToSet: "$year" },
                            months: { $addToSet: "$month" },
                            eventTypes: { $addToSet: "$eventType" },
                            totalCount: { $sum: 1 },
                            venueId: { $first: "$venueId" }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            years: 1,
                            months: { $sortArray: { input: "$months", sortBy: 1 } },
                            eventTypes: 1,
                            totalCount: 1,
                        }
                    }
                ];
                const allBookings = (yield this._plannerBookingrepository.getAggregateData(aggregate)) || [];
                const totalPages = Math.ceil(((_a = allBookings[0]) === null || _a === void 0 ? void 0 : _a.totalCount) / limit) || 0;
                // Initialize match stage for booking retrieval
                const matchStage = Object.assign({}, filterQuery);
                if (status) {
                    matchStage['status'] = status;
                }
                // Apply additional filters based on the provided criteria
                if (allfilters) {
                    // Filter by month
                    if (allfilters.selectedMonth !== null && (0, razorpay_utils_1.isNumber)(allfilters.selectedMonth)) {
                        console.log(allfilters.selectedMonth);
                        matchStage['eventDate.startDate'] = {
                            $gte: new Date(new Date().getFullYear(), allfilters.selectedMonth - 1, 1),
                            $lt: new Date(new Date().getFullYear(), allfilters.selectedMonth, 1)
                        };
                    }
                    // Filter by year
                    if (allfilters.selectedYear !== null && (0, razorpay_utils_1.isNumber)(allfilters.selectedYear)) {
                        matchStage['eventDate.startDate'] = Object.assign(Object.assign({}, matchStage['eventDate.startDate']), { $gte: new Date(allfilters.selectedYear, 0, 1), $lt: new Date(allfilters.selectedYear + 1, 0, 1) });
                    }
                    // Filter by event type
                    if (allfilters.selectedEventType && allfilters.selectedEventType !== "null") {
                        matchStage.eventType = allfilters.selectedEventType;
                    }
                    // Filter by days
                    if (allfilters.selectedDays) {
                        if (allfilters.selectedDays === 'single') {
                            matchStage.isMultipleDays = false;
                        }
                        else if (allfilters.selectedDays === 'multiple') {
                            matchStage.isMultipleDays = true;
                        }
                    }
                }
                // Fetch bookings based on constructed matchStage
                bookings = yield this._plannerBookingrepository.getAggregateData([
                    { $match: matchStage },
                    {
                        $lookup: {
                            from: 'eventplanners', // The name of the EventPlanner collection
                            localField: 'eventPlannerId', // The field in the Booking schema
                            foreignField: '_id', // The field in the EventPlanner schema
                            as: 'eventPlanner', // The name of the field to output in the result
                        },
                    },
                    {
                        $lookup: {
                            from: 'customers', // The name of the Customer collection
                            localField: 'customerId', // The field in the Booking schema
                            foreignField: '_id', // The field in the Customer schema
                            as: 'customer', // The name of the field to output in the result
                        },
                    },
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $project: {
                            // Populate only the 'company' field from the eventPlanner document
                            eventPlannerId: { $arrayElemAt: ['$eventPlanner.company', 0] }, // Extract the 'company' field from the first element of the eventPlanner array
                            // Populate only the 'firstName' and 'lastName' fields from the customer document
                            customerId: {
                                $concat: [
                                    { $arrayElemAt: ['$customer.firstName', 0] },
                                    ' ',
                                    { $arrayElemAt: ['$customer.lastName', 0] }
                                ]
                            },
                            bookingId: 1,
                            eventType: 1, // Include the 'eventType' field
                            eventName: 1, // Include the 'eventName' field
                            totalCost: 1, // Include the 'totalCost' field
                            eventDate: 1,
                            isMultipleDays: 1,
                            guests: 1,
                            address: 1,
                            contact: 1,
                            payments: 1,
                            charges: 1,
                            status: 1,
                            paymentStatus: 1,
                            isDeleted: 1,
                        }
                    }
                ]);
                if (bookings) {
                    completedBookingsCount = bookings.filter(booking => booking.status === 'completed').length;
                }
                console.log(matchStage, bookings, "jbbbbbb");
                return { bookings, completed: completedBookingsCount, totalPages, filterData: allBookings[0] };
            }
            catch (error) {
                console.error("Error fetching venue bookings:", error);
                throw new customError_1.BadRequestError("Something went wrong!");
            }
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
            var _a;
            const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = razorPayData;
            const CryptoJS = require('crypto-js');
            let bookedData;
            const generatedSignature = CryptoJS.HmacSHA256(`${razorpay_order_id}|${razorpay_payment_id}`, process.env.RAZOR_KEY_SECRET || '').toString();
            bookedData = yield this._plannerBookingrepository.getOne({ 'payments.paymentInfo.id': razorpay_order_id });
            if (!bookedData) {
                throw new customError_1.BadRequestError('Booking data not found. Payment verification failed.');
            }
            const index = ((_a = bookedData.payments) === null || _a === void 0 ? void 0 : _a.length) - 1;
            if (generatedSignature === razorpay_signature) {
                bookedData.payments[index].status = status_options_1.Status.Paid;
                if (index === 1) {
                    bookedData.paymentStatus = status_options_1.Status.Advance;
                }
                else if (index === 2) {
                    bookedData.paymentStatus = status_options_1.Status.Paid;
                }
            }
            else {
                bookedData.payments[index].status = status_options_1.Status.Failed;
                throw new customError_1.BadRequestError('Invalid payment signature. Potential fraud attempt.');
            }
            yield bookedData.save();
            // await this._notificationrepository.create({ 
            //     userId:  bookedData.customerId, 
            //     userType: 'Customer',
            //     message: `Your booking for ${bookedData.eventName} has been placed successfully`,
            //     notificationType: 'booking_placed',
            // }
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
                console.log(datesArray);
                const availabilityData = yield this._availabilityrepository.findOneByFilter({
                    vendorId,
                    holyDays: { $nin: datesArray } // Filter out documents where holyDays include any of the dates in datesArray
                });
                console.log(!!availabilityData, "hdydy");
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
                if (error instanceof customError_1.BadRequestError)
                    throw error;
                throw new customError_1.BadRequestError('Failed to check availability. Please try again later.');
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
    payAdvancepayment(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // Step 1: Fetch booking details    
            const bookingDetail = yield this._plannerBookingrepository.getOne({ bookingId });
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
                            totalCost: bookingDetail.totalCost + advance, // Update totalCost
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
                    updatedBooking = yield this._plannerBookingrepository.update({ bookingId }, updatedBookingInfo);
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
            const bookingDetail = yield this._plannerBookingrepository.getOne({ bookingId });
            if (!bookingDetail) {
                throw new customError_1.BadRequestError('No Booking Detail Found!');
            }
            const totalServiceCharges = ((_c = (_b = (_a = bookingDetail === null || bookingDetail === void 0 ? void 0 : bookingDetail.charges) === null || _a === void 0 ? void 0 : _a.fullPayment) === null || _b === void 0 ? void 0 : _b.servicesCharges) === null || _c === void 0 ? void 0 : _c.reduce((sum, charge) => sum + charge.cost, 0)) || 0;
            const fullpayment = (((_e = (_d = bookingDetail === null || bookingDetail === void 0 ? void 0 : bookingDetail.charges) === null || _d === void 0 ? void 0 : _d.fullPayment) === null || _e === void 0 ? void 0 : _e.planningFee) || 0) + totalServiceCharges;
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
                    updatedBooking = yield this._plannerBookingrepository.update({ bookingId }, updatedBookingInfo);
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
            const bookingDetail = yield this._plannerBookingrepository.getOne({ bookingId });
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
            const bookingData = yield this._plannerBookingrepository.update({ bookingId }, // Find booking by bookingId
            {
                'charges.fullPayment.planningFee': fullPaymentCharges.planningFee, // Update planningFee
                'charges.fullPayment.servicesCharges': serviceCharges, // Update servicesCharges with mapped values
                'totalCost': updatedTotalCost // Update totalCost by adding new charges to existing totalCost
            });
            return { bookingData, fullPayment: fullPaymentCharges.planningFee + totalServiceCharges };
        });
    }
}
exports.default = EventPlannerService;
