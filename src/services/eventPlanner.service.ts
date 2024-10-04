import Address from "../models/addressModel";
import AddressRepository from "../repositories/address.repository";
import EventPlannerRepository from "../repositories/eventPlanner.repository";
import Razorpay from 'razorpay';
import fs from 'fs';
import path from 'path';
import slugify from 'slugify';
import { BadRequestError, ConflictError, CustomError, UnauthorizedError } from "../errors/customError";
import { Filter } from "../interfaces/utilities.interface";
import PlannerBookingRepository from "../repositories/plannerBooking.repository";
import { IEventPlannerBooking } from "../interfaces/eventPlannerBooking.interface";
import { IEventPlanner, IEventPlannerDocument } from "../interfaces/eventPlanner.interface";
import { generateOrderId, handleNotification } from "../utils/helperFunctions";
import { Status } from "../utils/status-options";
import AvailabilityRepository from "../repositories/availability.repository";
import NotificationRepository from "../repositories/notification.repository";
import { getIO } from "../config/socketIo";
import { IAddressDocument } from "../interfaces/address.interface";
import { IAvailability } from "../interfaces/availability.interface";
import cloudinary from '../config/cloudinary.config';
import { Readable } from "stream";
import sharp from 'sharp';
import { NotificationType } from "../utils/eventsVariables";
import { UserRole } from "../utils/important-variables";
import { IVendorDocument } from "interfaces/vendor.interface";
import { isNumber } from "razorpay/dist/utils/razorpay-utils";


class EventPlannerService {
    private _eventPlannerRepository: EventPlannerRepository;
    private _addressRepository: AddressRepository;
    private _plannerBookingrepository: PlannerBookingRepository;
    private _availabilityrepository : AvailabilityRepository;
    private _notificationrepository: NotificationRepository;


    constructor() {
        this._eventPlannerRepository = new EventPlannerRepository();
        this._addressRepository = new AddressRepository();
        this._plannerBookingrepository = new PlannerBookingRepository();
        this._availabilityrepository = new AvailabilityRepository();
        this._notificationrepository = new NotificationRepository();
    }

    async createEventPlanner(userInfo: Filter, files: any): Promise< IEventPlanner | null >{
       
        if(!files?.coverPic) throw new ConflictError('Cover Picture is required');
        if(!files?.document) throw new ConflictError('Document is required');
        if(!files?.portfolios) throw new ConflictError('Portfolio files are required');
       
        if(!userInfo.addressInfo.street) delete userInfo.addressInfo.street;
        if(!userInfo.addressInfo.town) delete userInfo.addressInfo.town;
        if(!userInfo.addressInfo.landmark) delete userInfo.addressInfo.landmark;

        // const coverPicPath = await this.fileStore(files?.coverPic, process.env.EP_COVERPIC,"EP_coverPic");
        // const docPath = await this.fileStore(files?.document, process.env.EP_DOCUMENTS,"EP_doc");
        // const portPath = await this.fileStore(files?.portfolios, process.env.EP_PORTFOLIOS,"EP_portfolio");
        console.log('createEventPlanner called');
        const coverPicPath = await this.CloudinaryfileStore(files?.coverPic, "/Event_Planners/CoverPics","EP_coverpic");
        const docPath = await this.CloudinaryfileStore(files?.document, "/Event_Planners/DocumentS","EP_doc");
        const portPath = await this.CloudinaryfileStore(files?.portfolios, "/Event_Planners/Portfolios","EP_portfolio");
                
        const address = await this._addressRepository.create({ ...userInfo.addressInfo }) as IAddressDocument;

        if(!address){
            throw new BadRequestError("Address creation failed. Please check the provided information!")
        }

        // Check if the company name is unique
        const existingEventPlanner = await this._eventPlannerRepository.getOneByFilter({ company: userInfo.company });
        if (existingEventPlanner) {
            throw new ConflictError('Company name already exists. Please choose a different name.');
        }

        // Check if the email address is unique
        const existingEmail = await this._eventPlannerRepository.getOneByFilter({ 'contact.email': userInfo.email });
        if (existingEmail) {
            throw new ConflictError('Email address already in use. Please choose a different email.');
        }
        
        // Generate a slug from company name
        const uniqueId = Math.floor(1000 + Math.random() * (90000 - 1000 + 1));
        const slug = slugify(userInfo.company, { lower: true, strict: true });
       
        if(address){
           // Prepare data for event planner
           const userData: IEventPlanner = {
               vendorId: userInfo.user._id,
               address: address.id,
               contact: {
                   email: userInfo.email,
                   mobile: userInfo.mobile,
               },
               company: userInfo.company,
               slug: `${slug}-${ uniqueId }`,
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
            const userDoc = await this._eventPlannerRepository.create(userData);
   
            if(userDoc){
               const availabilityData = {
                   vendorId: userDoc.vendorId, 
                   maxEvents: userInfo.maxEvents,
                   bookingType: 'EventPlannerBooking',
                   bookedDates: [],
                   holyDays: []
               };
               await this._availabilityrepository.create(availabilityData);

               
               // Emit notification via socket.io
               const io = getIO();
   
              
   
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
            const notification = await handleNotification(
                { type: NotificationType.SERVICE_REGISTERED,
                  userId: userInfo.user._id,
                  role: UserRole.Vendor, 
                } 
            );
               // Emit the notification event to the relevant client using Socket.IO
               io.emit('loaded-notification', { notification });         
            }
            return userDoc; 
        }
        return null;
    }

   
    async CloudinaryfileStore(files: any, folderName: string, fName: string): Promise<string[]> {
        if (!files || !folderName || !fName) {
            throw new Error('Invalid input');
        }
    
        const processedImages: string[] = [];
        console.log(files.length, folderName);
    
        const uploadPromises = files.map((file: any) => {
            return new Promise((resolve, reject) => {
                sharp(file.buffer, { failOnError: false })
                    .resize({ width: 800 })
                    .toBuffer()
                    .then((buffer) => {
                        const uploadStream = cloudinary.uploader.upload_stream({
                            folder: folderName,
                            public_id: `${fName}_${Date.now()}`,
                            resource_type: 'auto',
                        }, (error, result) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result?.secure_url);
                            }
                        });
    
                        // Convert the optimized buffer into a stream and upload it
                        const bufferStream = Readable.from(buffer);
                        bufferStream.pipe(uploadStream).on('error', (streamError) => {
                            reject(streamError);
                        });
                    })
                    .catch((err) => {
                        console.log(err)
                        console.error(`Sharp processing error: ${err.message}`);
                        // Skip the problematic file and resolve with null or a placeholder
                        resolve(null);
                    });
            });
        });
    
        // Filter out any null values (from skipped files)
        const results = await Promise.all(uploadPromises);
        return results.filter(url => url !== null); // Only return successful uploads
    }


    // Function to get all URLs from a specific folder
    async getAllUrlsInFolder(folderName: string): Promise<string[]> {
        try {
          const fullPath = `${folderName}`;
          const { resources } = await cloudinary.api.resources({
            type: 'upload',
            prefix: fullPath,
            max_results: 500,
            resource_type: 'auto',
          });
          return resources.map((resource: any) => resource.secure_url);
        } catch (error: any) {
          if (error.error.http_code === 404) {
            console.log(`Folder not found: ${folderName}`);
            return [];
          } else {
            console.error("Error fetching resources from Cloudinary:", error);
            const message = error?.error?.message || "Unknown error";
            throw new Error(`Failed to retrieve URLs from folder: ${message}`);
          }
        }
    }
        

    async fileStore(files: any, directory: string | undefined, fName: string | undefined){
        const processedImages: any[] = [];
        if(files){
            for (const key in files) {
                const file = files[key];   

                if(directory && fName){         
                    const originalExtension = path.extname(file.originalname);
                    const fileName = `${fName}_${Date.now()}${originalExtension}`;

                    if (!fs.existsSync(directory)) {
                        fs.mkdirSync(directory, { recursive: true });
                    }
                    const filePath = `${directory}/${fileName}`;
                    processedImages.push(fileName)
                    try {
                        await fs.promises.writeFile(filePath, file.buffer); 
                    } catch (error: any) {
                        console.log("error", error?.message)
                        throw new BadRequestError('');
                    }
                }
            }
        }
        return processedImages;
    }


   
    
    async getEventPlanner(filter: Filter){
        return this._eventPlannerRepository.getPlannerDetail({ ...filter })
    }

    // async getAllEventPlanners(filter: Filter){
    //     return this._eventPlannerRepository.getAllWithPopuate({ ...filter })
    // }

    async getAllEventPlanners(
        page: number = 1,
        limit: number = 10,
        approval?: string,
        allfilters?: {
          location: string | null;
          services?: string[];
        },
        search?: string
      ): Promise<{
        eventPlanners: IEventPlannerDocument[]; // Only fetch venue names
        totalPages: number;
        totalCount: number,
        filterData: { location: string[] };
      } | null> {
        const skip = (page - 1) * limit;
    
        try {
            // Initialize the filter query
            let filterQuery: Record<string, any> = {  };

            if(approval){
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
            const countResult = (await this._eventPlannerRepository.getAggregateData(countPipeline)) ?? [];
            
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
            const plannersData: { planners: IEventPlannerDocument[], totalCount: number }[] = 
                  (await this._eventPlannerRepository.getAggregateData(pipeline)) || [];
            const totalPages = Math.ceil(plannersData[0]?.totalCount/ limit);
            console.log(countResult, plannersData);
      
            return { 
               eventPlanners: plannersData[0].planners,
               totalCount:  plannersData[0].totalCount,
               totalPages, filterData: countResult[0] 
            };
        } catch (error) {
            console.error("Error fetching venues:", error);
            throw new BadRequestError("Something went wrong!");
        }
    }
    

    async getAllBookings(filter: Filter): Promise<IEventPlannerBooking[] | null>{
        const planner = await this._eventPlannerRepository.getPlanner(filter) as IEventPlannerDocument;
        let bookings: IEventPlannerBooking[] | null = null;
        if(planner){
           bookings = await this._plannerBookingrepository.getAllBookings({ eventPlannerId: planner.id })
        }
        return bookings;
    }
    

    // async getAllplannerBookings(filter: Filter): Promise<[] | null>{
    //     return await this._plannerBookingrepository.getAllBookings({ ...filter });
    // }

    async getAllplannerBookings(
        filter: { user?: IVendorDocument }, 
        page: number = 1, 
        limit: number = 10,
        status: string = '',
        allfilters?: {
            selectedMonth: number | null,
            selectedYear: number | null,
            selectedEventType: string | null,
            selectedDays: string,
        }
    ): Promise<{ 
        bookings: IEventPlannerBooking[] | null, 
        completed: number,
        totalPages: number,
        filterData: { years: number[], eventTypes: string[], totalCount: number, months: number[] }
    } | null> {
        console.log(page, limit, status, "page and limit");
    
        let planner: IEventPlannerDocument | null = null;
        let filterQuery: Record<string, any> = {};
        let bookings: IEventPlannerBooking[] | null = null;
        let completedBookingsCount = 0;
        const skip = (page - 1) * limit;
    
        try {
            // Retrieve venue if user is provided in filter
            if (filter.user) {
                planner = await this._eventPlannerRepository.getPlanner({vendorId: filter?.user._id}) as IEventPlannerDocument;
                console.log(planner,"jnjnkk")
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
    
            const allBookings = await this._plannerBookingrepository.getAggregateData(aggregate) || [];
            const totalPages = Math.ceil(allBookings[0]?.totalCount / limit) || 0;
    
            // Initialize match stage for booking retrieval
            const matchStage: Record<string, any> = { ...filterQuery };

            if(status){
                matchStage['status'] = status;
            }
    
            // Apply additional filters based on the provided criteria
            if (allfilters) {
                // Filter by month
                if (allfilters.selectedMonth !== null && isNumber(allfilters.selectedMonth)) {
                    console.log(allfilters.selectedMonth);
                    matchStage['eventDate.startDate'] = {
                        $gte: new Date(new Date().getFullYear(), allfilters.selectedMonth - 1, 1),
                        $lt: new Date(new Date().getFullYear(), allfilters.selectedMonth, 1)
                    };
                }
    
                // Filter by year
                if (allfilters.selectedYear !== null && isNumber(allfilters.selectedYear)) {
                    matchStage['eventDate.startDate'] = {
                        ...matchStage['eventDate.startDate'],
                        $gte: new Date(allfilters.selectedYear, 0, 1),
                        $lt: new Date(allfilters.selectedYear + 1, 0, 1)
                    };
                }
    
                // Filter by event type
                if (allfilters.selectedEventType && allfilters.selectedEventType !== "null") {
                    matchStage.eventType = allfilters.selectedEventType;
                }
    
                // Filter by days
                if (allfilters.selectedDays) {
                    if (allfilters.selectedDays === 'single') {
                        matchStage.isMultipleDays = false;
                    } else if (allfilters.selectedDays === 'multiple') {
                        matchStage.isMultipleDays = true;
                    }
                }
            }
            
    
            // Fetch bookings based on constructed matchStage
            bookings = await this._plannerBookingrepository.getAggregateData([
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
                      eventType: 1,      // Include the 'eventType' field
                      eventName: 1,      // Include the 'eventName' field
                      totalCost: 1,      // Include the 'totalCost' field
                      eventDate: 1,
                      isMultipleDays: 1,
                      guests: 1,
                      address: 1,
                      contact: 1,
                      payments:1,
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
        } catch (error) {
            console.error("Error fetching venue bookings:", error);
            throw new BadRequestError("Something went wrong!");
        }
    }
    

    async plannerBooking(userInfo: Filter, slug: string){
        let booking;
        const planner = await this.getEventPlanner({ slug , approval: Status.Approved }) as IEventPlannerDocument | null;

        if(!planner){
            throw new Error(" Event Planner does not Exist!");
        }

        const address = await this._addressRepository.create(userInfo.addressInfo);

        if(!address){
           throw new BadRequestError("Address creation failed. Please check the provided information!")
        }

        let razorpayOrderData;
        if(userInfo.paymentMode === 'Razorpay'){
            const options = {
                amount: 50 * 100,
                currency: 'INR',
            };
    
            const razorpayInstance = new Razorpay({
                key_id: process.env.RAZOR_KEY_ID || '',
                key_secret: process.env.RAZOR_KEY_SECRET  || '',
            });

            razorpayOrderData = await razorpayInstance.orders.create(options);
            razorpayOrderData.amount_paid = 50;
        }

        if(razorpayOrderData){
            let bookingInfo: IEventPlannerBooking = {
                bookingId: generateOrderId('EP'),
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
                        paymentInfo: razorpayOrderData  , 
                    },
                ]
            }

            booking = await this._plannerBookingrepository.registerBooking(bookingInfo) as IEventPlannerDocument | null;
        }
        return { razorpayOrderData, booking: booking?.id };
    }

    async razorPayment(razorPayData: any): Promise<IEventPlannerBooking | null> {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = razorPayData;
        const CryptoJS = require('crypto-js');
        let bookedData;

        const generatedSignature = CryptoJS.HmacSHA256(`${razorpay_order_id}|${razorpay_payment_id}`, 
          process.env.RAZOR_KEY_SECRET || '').toString();


        bookedData = await this._plannerBookingrepository.getOne({ 'payments.paymentInfo.id': razorpay_order_id }); 

        if (!bookedData) {
            throw new BadRequestError('Booking data not found. Payment verification failed.');
        }
        
        const index = bookedData.payments?.length-1;
        if (generatedSignature === razorpay_signature) {
            
            bookedData.payments[index].status = Status.Paid;

            if(index === 1){
                bookedData.paymentStatus = Status.Advance;
            } else if(index === 2){
                bookedData.paymentStatus = Status.Paid;
            }
        } else {
            bookedData.payments[index].status = Status.Failed;
            throw new BadRequestError('Invalid payment signature. Potential fraud attempt.');
        }            
        await bookedData.save();

        // await this._notificationrepository.create({ 
        //     userId:  bookedData.customerId, 
        //     userType: 'Customer',
        //     message: `Your booking for ${bookedData.eventName} has been placed successfully`,
        //     notificationType: 'booking_placed',
        // }
     
        return bookedData;
    }


    async getOneBooking(bookingId: string): Promise<IEventPlannerBooking | null>{
        return await this._plannerBookingrepository.getOneBooking({ bookingId })
    }

    async changeBookingStatus(bookingId: string, status: string, vendorId: string): Promise<IEventPlannerBooking | null>{
        const plannerData = await this._plannerBookingrepository.update({ bookingId }, { status: status.toLowerCase() });
        
        if(!plannerData){
            throw new BadRequestError('Booking not found!');
        }
        try {
            if(plannerData && plannerData.status === Status.Confirmed){  
               const availabilityModel = await this._availabilityrepository.findOneByFilter({vendorId});
            
                if (!availabilityModel) {
                    throw new BadRequestError('Availability schema not found!');
                }
                // Convert startDate and endDate to Date objects
                const startDate = new Date(plannerData.eventDate.startDate);
                const endDate = new Date(plannerData.eventDate.endDate);
                
                while (startDate <= endDate) {

                    // Check if the specific date exists in bookedDates
                    const existingDate = availabilityModel.bookedDates.find(
                        (dateObj) => dateObj.date.getTime() === startDate.getTime()
                    );
    
        
                    const newSlot = {
                        startTime: plannerData?.eventDate.startTime,
                        endTime: plannerData?.eventDate.endTime,
                        isExternal: false,
                        bookingId: plannerData._id,
                    };

                    if(existingDate){
                        // Check if adding the new slot would exceed the maximum allowed slots
                        if (existingDate.slots.length >= availabilityModel.maxEvents) {
                            throw new BadRequestError(`Cannot add more slots for ${startDate.toDateString()}, maximum limit reached.`);
                        }


                        // If the date exists, push the new slot into the existing date's slots array
                        await this._availabilityrepository.update(
                            { vendorId, 'bookedDates.date': startDate },
                            { $push: { 'bookedDates.$.slots': newSlot } }
                        );
                    } else {
                        await this._availabilityrepository.update(
                            { vendorId },
                            { $push: { bookedDates: { 
                                date: new Date(startDate),
                                slots: [newSlot] ,
                            }}}
                        )
                    }
                    // Move to the next day
                    startDate.setDate(startDate.getDate() + 1);
                }

                await this._notificationrepository.create({ 
                    userId:  vendorId,
                    userType: 'Vendor',
                    message: `Booking for ${plannerData.bookingId} has been Confirmed`,
                    notificationType: 'booking_confirmation'
                })

                await this._notificationrepository.create({ 
                    userId:  plannerData.customerId,
                    userType: 'Customer',
                    message: `Your Booking for ${plannerData.bookingId} has been Confirmed`,
                    notificationType: 'booking_confirmation'
                })
            }
        } catch (error: any) {
            console.error('Error in changeBookingStatus:', error.message);
            await this._plannerBookingrepository.update({ bookingId }, { status: Status.Pending });

            if(error instanceof BadRequestError) throw error;
            throw new Error(`Failed to change booking status`);
        }                
        return plannerData;
    }

    async generateAdvancePayment(bookingId: string, advancePayment: number): Promise<IEventPlannerBooking | null>{
        const bookingData = await this._plannerBookingrepository.update({ bookingId }, { 'charges.advancePayments': advancePayment  });
        console.log(bookingData)
        if(bookingData){
            await this._notificationrepository.create({ 
                userId:  bookingData.customerId,
                userType: 'Customer',
                message: `Advance Payment for ${bookingData.bookingId} has been generated`,
                notificationType: 'advance_payment'
            }) 
        }
        return bookingData;
    }

    async checkAvailability(formData: any, vendorId: string): Promise<boolean> {
        try {
            const startDate = new Date(formData.startDate);
            const endDate = formData?.endDate ? new Date(formData.endDate) : startDate;
    
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new BadRequestError('Invalid date format. Please try again later.')
            }

            // Get today's date and add 5 days to it
            const today = new Date();
            const minDate = new Date(today);
            minDate.setDate(today.getDate() + 5);  // Set the minimum date to 5 days after today
    
            // Check if the selected start date is at least 5 days after today
            if (startDate.getTime() < minDate.getTime()) {
                throw new BadRequestError('The selected date must be at least 5 days after today.');
            }
    
            let datesArray: Date[] = [];
            for (let date = new Date(startDate); date.getTime() <= endDate.getTime(); date.setDate(date.getDate() + 1)) {
                datesArray.push(new Date(date));
            }
            console.log(datesArray)
            const availabilityData = await this._availabilityrepository.findOneByFilter({
                vendorId,
                holyDays: { $nin: datesArray } // Filter out documents where holyDays include any of the dates in datesArray
            });
            console.log(!!availabilityData, "hdydy")
            if (availabilityData) {
                // Check if any date in the range is booked
                const isBooked = datesArray.some(date => 
                    availabilityData.bookedDates.some(bookedDate => {
                        if (date.getTime() === bookedDate.date.getTime()) {
                            return bookedDate.slots.length >= availabilityData.maxEvents;
                        }
                        return false;
                    })
                   
                );
    
                if (isBooked) {
                    console.log('Some dates or slots are not available.');
                    return false; // Slot is not available
                }
    
                console.log('All dates and slots are available.');
                return true; // Slot is available
            } else {
                console.log('No availability data found for vendor.');
                return false; // No availability data found
            }
        } catch (error) {
            console.error('Error checking availability:', error);
            if(error instanceof BadRequestError) throw error;
            throw new BadRequestError('Failed to check availability. Please try again later.')
        }
    }

    async getAvailabilityInfo(vendorId: string): Promise<IAvailability | null>{
        return await this._availabilityrepository.findOneByFilter( {vendorId} );
    }

    async plannerStatusChange(slug: string, status: string): Promise<IEventPlanner | null>{
        console.log(slug, status);
        let change: Status.Approved | Status.Rejected | Status.Pending = Status.Pending;
        if(status === 'approved'){
          change = Status.Approved;
        } else if(status === 'rejected'){
          change = Status.Rejected;
        }
        return await this._eventPlannerRepository.update({ slug },  { approval: change})
    }

    async addHoliday(vendorId: string, date: string) {
        try {
            // Convert the date string to a Date object
            const holidayDate = new Date(date);
            
            // Check if the date is already booked
            const availability = await this._availabilityrepository.findOneByFilter({ vendorId });
            
            if (!availability) {
                throw new Error('Vendor not found');
            }
    
            // Check if the date is already in bookedDates
            const isBooked = availability.bookedDates.some(bookedDate => 
                bookedDate.date.toDateString() === holidayDate.toDateString()
            );
    
            if (isBooked) {
                throw new ConflictError('Date is already booked, Cnnot add as Holiday!');
            }
    
            // Check if the date is already in holyDays
            const isHoliday = availability.holyDays.some(holiday => 
                holiday.toDateString() === holidayDate.toDateString()
            );
    
            if (isHoliday) {
                throw new ConflictError('Date is already a holiday!');
            }
    
            // Add the date to holyDays
            availability.holyDays.push(holidayDate);
            await availability.save();
    
            return true;
        } catch (error) {
            if(error instanceof CustomError) {
                throw error;
            }
        }
    }

    async addNewEvent(formValue: any, vendorId: string) {
        try {
            console.log(formValue,"form value")
            const { eventDate, startTime, endTime, customerName, eventName, place } = formValue;
            const newSlot = { startTime, endTime, isExternal: true,
                externalBookingDetails: { customerName, eventName, place}
            };
    
            // Convert the eventDate to a Date object
            const eventDateObj = new Date(eventDate);
    
            // Find the vendor's availability document by vendorId
            let availability = await this._availabilityrepository.findOneByFilter({ vendorId });
            if (!availability) {
                throw new Error('Vendor availability not found');
            }
    
            // Check if the date already exists in bookedDates
            const dateIndex = availability.bookedDates.findIndex(bookedDate =>
                bookedDate.date.toDateString() === eventDateObj.toDateString()
            );
    
            if (dateIndex !== -1) {
                // If date exists, add the new slot to the existing date's slots array
                availability.bookedDates[dateIndex].slots.push(newSlot);
            } else {
                // If date does not exist, create a new date entry with the new slot
                availability.bookedDates.push({
                    date: eventDateObj,
                    slots: [newSlot]
                });
            }
    
            // Save the updated availability document
            await availability.save();
    
            return true;
        } catch (error) {
            console.error('Error adding new external event:', error);
            throw new Error('Failed to add new external event');
        }
    }

    async getDashboardData(vendorId: string){
        const eventPlanner = await this.getEventPlanner({ vendorId }) as IEventPlannerDocument;

        if(!eventPlanner) throw new BadRequestError('Event Planner is not found');
        const totalReveneuePipeline = [
            { $match: { eventPlannerId: eventPlanner._id } },
            { $group: { _id: null, totalRevenue: { $sum: "$totalCost" } } }
        ]

        const totalBookingsPipeline = [
            { $match: { eventPlannerId: eventPlanner._id, status: { $in: [Status.Pending, Status.Confirmed, Status.Completed] } } },
            { $count: "totalBookings" }
        ]

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
                  status: "$_id",        // Project the status field from _id
                  count: 1               // Include the count field
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
                        year: { $year: "$updatedAt" },   // Group by year
                        month: { $month: "$updatedAt" }  // Group by month
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
        
        const revenueOverTime = await this._plannerBookingrepository.getAggregateData(revenueOverTimePipeline);
        const totalRevenue = await this._plannerBookingrepository.getAggregateData(totalReveneuePipeline);
        const totalBookings = await this._plannerBookingrepository.getAggregateData(totalBookingsPipeline);
        const AllBookings = await this._plannerBookingrepository.getAggregateData(bookingStatusPipeline);

        return  { totalRevenue, totalBookings,  AllBookings, revenueOverTime}
    }
   
    async payAdvancepayment(bookingId: string) {
        // Step 1: Fetch booking details
        const bookingDetail = await this._plannerBookingrepository.getOne({ bookingId });
    
        if (!bookingDetail) {
            throw new BadRequestError('No Booking Detail Found!');
        }
    
        const advance = bookingDetail.charges?.advancePayments || 0;
        
        // Step 2: If advance payment exists, proceed with Razorpay order creation
        let razorpayOrderData: any;
        if (advance) {
            const options = {
                amount: advance * 100, // Razorpay expects amount in paise (1 INR = 100 paise)
                currency: 'INR',
            };
    
            const razorpayInstance = new Razorpay({
                key_id: process.env.RAZOR_KEY_ID || '',
                key_secret: process.env.RAZOR_KEY_SECRET || '',
            });
    
            // Create Razorpay order
            razorpayOrderData = await razorpayInstance.orders.create(options);
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
                                status: Status.Pending,
                            },
                        },
                    },
                
        
                // Step 4: Save the updated booking
                updatedBooking = await this._plannerBookingrepository.update({ bookingId }, updatedBookingInfo) as IEventPlannerDocument | null;
                
                return { razorpayOrderData, booking: updatedBooking };
            }
            console.log(updatedBooking, "jjjj")
           
        }
    
        return null;    
    }
   

    async payFullpayment(bookingId: string) {
        // Step 1: Fetch booking details
        const bookingDetail = await this._plannerBookingrepository.getOne({ bookingId });
    
        if (!bookingDetail) {
            throw new BadRequestError('No Booking Detail Found!');
        }
        
        const totalServiceCharges = bookingDetail?.charges?.fullPayment?.servicesCharges?.reduce((sum, charge) => sum + charge.cost, 0) || 0;

        const fullpayment = (bookingDetail?.charges?.fullPayment?.planningFee || 0) + totalServiceCharges;
        
        
        // Step 2: If advance payment exists, proceed with Razorpay order creation
        let razorpayOrderData: any;
        if (fullpayment) {
            const options = {
                amount: fullpayment * 100, // Razorpay expects amount in paise (1 INR = 100 paise)
                currency: 'INR',
            };
    
            const razorpayInstance = new Razorpay({
                key_id: process.env.RAZOR_KEY_ID || '',
                key_secret: process.env.RAZOR_KEY_SECRET || '',
            });
    
            // Create Razorpay order
            razorpayOrderData = await razorpayInstance.orders.create(options);
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
                                status: Status.Pending,
                            },
                        },
                    },
                
        
                // Step 4: Save the updated booking
                updatedBooking = await this._plannerBookingrepository.update({ bookingId }, updatedBookingInfo) as IEventPlannerDocument | null;
                
                return { razorpayOrderData, booking: updatedBooking };
            }
            console.log(updatedBooking, "jjjj")
           
        }
    
        return null;    
    }

    async generateFullPayment(
        bookingId: string,
        fullPaymentCharges: { planningFee: number; charges: { chargeName: string; amount: number }[] }
      ): Promise<{bookingData: IEventPlannerBooking | null, fullPayment: number}| null> {
        
        // Fetch the current booking details to get the existing totalCost
        const bookingDetail = await this._plannerBookingrepository.getOne({ bookingId });
      
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
        const bookingData = await this._plannerBookingrepository.update(
          { bookingId }, // Find booking by bookingId
          { 
            'charges.fullPayment.planningFee': fullPaymentCharges.planningFee, // Update planningFee
            'charges.fullPayment.servicesCharges': serviceCharges,             // Update servicesCharges with mapped values
            'totalCost': updatedTotalCost                                      // Update totalCost by adding new charges to existing totalCost
          }
        );
      
        return { bookingData, fullPayment: fullPaymentCharges.planningFee + totalServiceCharges };
      }
      
    
}

export default EventPlannerService;
