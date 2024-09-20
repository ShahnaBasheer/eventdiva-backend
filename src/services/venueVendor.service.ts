import Address from "../models/addressModel";
import AddressRepository from "../repositories/address.repository";
import fs from 'fs';
import path from 'path';
import slugify from 'slugify';
import { BadRequestError, ConflictError, CustomError } from "../errors/customError";
import { Filter } from "../interfaces/utilities.interface";
import VenueVendorRepository from "../repositories/venueVendor.repository";
import Venue from "../models/venueModel";
import Razorpay from 'razorpay';
import VenueBookingRepository from "../repositories/venueBooking.repository";
import { IVenueBooking  } from "../interfaces/venueBooking.interface";
import { generateOrderId } from "../utils/helperFunctions";
import { IVenue, IVenueDocument } from "../interfaces/venue.interface";
import { Status } from "../utils/status-options";
import AvailabilityRepository from "../repositories/availability.repository";
import { IAvailability } from "../interfaces/availability.interface";
import NotificationRepository from "../repositories/notification.repository";



class VenueVendorService {
    private _venueVendorRepository: VenueVendorRepository;
    private _addressRepository: AddressRepository;
    private _venueBookingrepository: VenueBookingRepository;
    private _availabilityrepository : AvailabilityRepository;
    private _notificationrepository: NotificationRepository;

    constructor() {
        this._venueVendorRepository = new VenueVendorRepository();
        this._addressRepository = new AddressRepository();
        this._venueBookingrepository = new VenueBookingRepository();
        this._availabilityrepository = new AvailabilityRepository();
        this._notificationrepository = new NotificationRepository();
    }

    async createVenue(userInfo: Filter, files: any){
        if(!files?.coverPic) throw new ConflictError('Cover Picture is required');
        if(!files?.document) throw new ConflictError('Document is required');
        if(!files?.portfolios) throw new ConflictError('Portfolio files are required');
       
        if(!userInfo.addressInfo.street) delete userInfo.addressInfo.street;
        if(!userInfo.addressInfo.town) delete userInfo.addressInfo.town;
        if(!userInfo.addressInfo.landmark) delete userInfo.addressInfo.landmark;
        
        const address = await this._addressRepository.create({ ...userInfo.addressInfo });

        if(!address){
           throw new BadRequestError("Address creation failed. Please check the provided information!")
        }
        
        const coverPicPath = await this.fileStore(files?.coverPic, process.env.VV_COVERPIC,"VV_coverPic");
        const docPath = await this.fileStore(files?.document, process.env.VV_DOCUMENTS,"VV_doc");
        const portPath = await this.fileStore(files?.portfolios, process.env.VV_PORTFOLIOS,"VV_portfolio");
           
        // Check if the company name is unique
        const existingVenue = await this._venueVendorRepository.getOneByFilter({ company: userInfo.company });
        if (existingVenue) {
            throw new ConflictError('Company name already exists. Please choose a different name.');
        }

        // Check if the email address is unique
        const existingEmail = await this._venueVendorRepository.getOneByFilter({ 'contact.email': userInfo.email });
        if (existingEmail) {
            throw new ConflictError('Email address already in use. Please choose a different email.');
        }
        
        // Generate a slug from company name
        const uniqueId = Math.floor(1000 + Math.random() * (90000 - 1000 + 1));
        const slug = slugify(userInfo.venueName, { lower: true, strict: true });

        // Prepare data for event planner
        const userData = {
            vendorId: userInfo.user._id,
            address: address?._id,
            contact: {
                email: userInfo.email,
                mobile: userInfo.mobile,
            },
            venueName: userInfo.venueName,
            venueType: userInfo.venueType,
            slug: `${slug}-${ uniqueId }`,
            startYear: userInfo.startYear,
            services: userInfo.service,
            capacity: userInfo.areas,
            amenities: userInfo.amenities,
            description: userInfo.description,
            rent: userInfo.rent,
            ...(userInfo?.includeRooms && { rooms: {
                count: userInfo.rooms.count,
                roomStartingPrice: userInfo.rooms.startingPrice
            } }),
            ...(userInfo?.includeDecor && { decorStartingPrice: userInfo.decorStartingPrice }),
            ...(userInfo?.includePricePerPlate && { platePrice: {
                vegPerPlate: userInfo.platePrice.vegPerPlate,
                nonVegPerPlate: userInfo.platePrice.nonVegPerPlate
            } }),
            coverPic: coverPicPath[0],
            portfolios: portPath,
            document: docPath[0],
        };
        
        // // Create event planner document
        const userDoc = await this._venueVendorRepository.create({ ...userData });

        if(userDoc){
            const availabilityData = {
                vendorId: userDoc.vendorId, 
                maxEvents: userInfo.maxEvents,
                bookingType: 'VenueBooking',
                bookedDates: [],
                holyDays: []
            };

            await this._availabilityrepository.create(availabilityData);

            await this._notificationrepository.create({ 
                userId:  userInfo.user._id, 
                userType: 'Vendor',
                message: `Your service has been successfully registered.`,
                notificationType: 'service_registered' 
            }
        )  
        }
        return userDoc;  
    }


    async fileStore(files: any, directory: string | undefined, fName: string | undefined){
        const processedImages = [];
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
    

    async getVenue(filter: Filter): Promise<IVenue | IVenueDocument | null>{
        return await this._venueVendorRepository.getVenueDetail({ ...filter });
    }

    async getAllVenues(filter: Filter): Promise<IVenue[] | IVenueDocument[] | null>{
        return await this._venueVendorRepository.getAllWithPopuate({ ...filter })
    }

    async getAllBookings(filter: Filter): Promise<IVenueBooking[] | null>{
        const venue = await this._venueVendorRepository.getVenue({ ...filter }) as IVenueDocument;
        let bookings: IVenueBooking[] | null = null;

        if(venue){
           bookings = await this._venueBookingrepository.getAllBookings({ venueId: venue.id })
        }
        return bookings;
    }

    async getAllvenueBookings(filter: Filter): Promise<IVenueBooking[] | null>{
       return await this._venueBookingrepository.getAllBookings({ ...filter });
    }


    async venueBooking(userInfo: Filter, slug: string){
        let booking;
        const venue = await this.getVenue({ slug, approval: Status.Approved }) as IVenueDocument | null;

        if(!venue){
            throw new Error(" Veneu does not Exist!");
        }

        const addressDocument = new Address({ ...userInfo.addressInfo });
        const address = await this._addressRepository.create(addressDocument);

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
            let bookingInfo: IVenueBooking = {
                bookingId: generateOrderId('VV'),
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
                        paymentInfo: razorpayOrderData  , 
                    },
                ]
            }

            booking = await this._venueBookingrepository.registerBooking(bookingInfo) as IVenueDocument | null;
        }
        return { razorpayOrderData, booking: booking?.id };
    }

    async razorPayment(razorPayData: any): Promise<IVenueBooking | null> {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = razorPayData;
        const CryptoJS = require('crypto-js');
        let bookedData;

        const generatedSignature = CryptoJS.HmacSHA256(`${razorpay_order_id}|${razorpay_payment_id}`, 
          process.env.RAZOR_KEY_SECRET || '').toString();


        bookedData = await this._venueBookingrepository.getOne({ 'payments.paymentInfo.id': razorpay_order_id }); 

        if (!bookedData) {
            throw new BadRequestError('Booking data not found. Payment verification failed.');
        }
    
        if (generatedSignature === razorpay_signature) {
            bookedData.payments[0].status = Status.Paid;
        } else {
            bookedData.payments[0].status = Status.Failed;
            throw new BadRequestError('Invalid payment signature. Potential fraud attempt.');
        }            
        await bookedData.save();

        await this._notificationrepository.create({ 
            userId:  bookedData.customerId, 
            userType: 'Customer',
            message: `Your booking for ${bookedData.eventName} has been placed successfully`,
            notificationType: 'booking_placed' 
        })

        return bookedData;
    }


    async getOneBooking(bookingId: string): Promise<IVenueBooking | null>{
        return await this._venueBookingrepository.getOneBooking({ bookingId })
    }

    async changeBookingStatus(bookingId: string, status: string, vendorId: string): Promise<IVenueBooking | null>{
        const venueData = await this._venueBookingrepository.update({ bookingId }, { status: status.toLowerCase() });
        
        if(!venueData){
            throw new BadRequestError('Booking not found!');
        }
        try {
            if(venueData && venueData.status === Status.Confirmed){  
               const availabilityModel = await this._availabilityrepository.findOneByFilter({vendorId});
            
                if (!availabilityModel) {
                    throw new BadRequestError('Availability schema not found!');
                }
                // Convert startDate and endDate to Date objects
                const startDate = new Date(venueData.eventDate.startDate);
                const endDate = new Date(venueData.eventDate.endDate);
                
                while (startDate <= endDate) {
                    // Check if the specific date exists in bookedDates
                    const existingDate = availabilityModel.bookedDates.find(
                        (dateObj) => dateObj.date.getTime() === startDate.getTime()
                    );
    
        
                    const newSlot = {
                        startTime: venueData?.eventDate.startTime,
                        endTime: venueData?.eventDate.endTime,
                        isExternal: false,
                        bookingId: venueData._id,
                    };

                    if(existingDate){
                        // Check if adding the new slot would exceed the maximum allowed slots
                        if (existingDate.slots.length >= availabilityModel.maxEvents) {
                            throw new BadRequestError(`Cannot add more slots for ${startDate.toDateString()}, maximum limit reached.`);
                        }

                        // Check if the new slot overlaps with any existing slots
                        const isOverlapping = existingDate.slots.some(slot => 
                            (newSlot.startTime < slot.endTime && newSlot.endTime > slot.startTime)
                        );
    
                        if (isOverlapping) {
                            throw new BadRequestError(`Slot is already booked for ${startDate.toDateString()}.`);
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
                    message: `Booking for ${venueData.bookingId} has been Confirmed`,
                    notificationType: 'booking_confirmation'
                })
            }
        } catch (error: any) {
            console.error('Error in changeBookingStatus:', error.message);
            await this._venueBookingrepository.update({ bookingId }, { status: Status.Pending });

            if(error instanceof BadRequestError) throw error;
            throw new Error(`Failed to change booking status`);
        }                
        return venueData;
    }

    async generateAdvancePayment(bookingId: string, advancePayment: number): Promise<IVenueBooking | null>{
        const bookingData = await this._venueBookingrepository.update({ bookingId }, { 'charges.advancePayments': advancePayment  });
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
    
            let datesArray: Date[] = [];
            for (let date = new Date(startDate); date.getTime() <= endDate.getTime(); date.setDate(date.getDate() + 1)) {
                datesArray.push(new Date(date));
            }
    
            const availabilityData = await this._availabilityrepository.findOneByFilter({
                vendorId,
                holyDays: { $nin: datesArray } // Filter out documents where holyDays include any of the dates in datesArray
            });
    
            if (availabilityData) {
                // Check if any date in the range is booked
                const isBooked = datesArray.some(date =>
                    availabilityData.bookedDates.some(bookedDate => {
                        if (date.getTime() === bookedDate.date.getTime()) {
                            // Check for overlapping slots
                            return bookedDate.slots.some(slot => {
                                return (
                                    (formData.startTime < slot.endTime && formData.endTime > slot.startTime) // Fixed overlapping check
                                );
                            });
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
            throw new BadRequestError('Failed to check availability. Please try again later.')
        }
    }

    async getAvailabilityInfo(vendorId: string): Promise<IAvailability | null>{
        return await this._availabilityrepository.findOneByFilter( {vendorId} );
    }

    async venueStatusChange(slug: string, status: string): Promise<IVenue | null>{
        let change: Status.Approved | Status.Rejected | Status.Pending = Status.Pending;
        if(status === 'approved'){
          change = Status.Approved;
        } else if(status === 'rejected'){
          change = Status.Rejected;
        }
        return await this._venueVendorRepository.update({ slug },  { approval: status})
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

    async getDashboardData(vendorId: string){
        const venuevendor = await this.getVenue({ vendorId }) as IVenueDocument;

        if(!venuevendor) throw new BadRequestError('Venue Vendor is not found');
        const totalReveneuePipeline = [
            { $match: { venueId: venuevendor._id } },
            { $group: { _id: null, totalRevenue: { $sum: "$totalCost" } } }
        ]

        const totalBookingsPipeline = [
            { $match: { venueId: venuevendor._id, status: { $in: [Status.Pending, Status.Confirmed, Status.Completed] } } },
            { $count: "totalBookings" }
        ]

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
                  status: "$_id",        // Project the status field from _id
                  count: 1               // Include the count field
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
        
        const revenueOverTime = await this._venueBookingrepository.getAggregateData(revenueOverTimePipeline);
        const totalRevenue = await this._venueBookingrepository.getAggregateData(totalReveneuePipeline);
        const totalBookings = await this._venueBookingrepository.getAggregateData(totalBookingsPipeline);
        const AllBookings = await this._venueBookingrepository.getAggregateData(bookingStatusPipeline);

        return  { totalRevenue, totalBookings,  AllBookings, revenueOverTime}
    }
    
}

export default VenueVendorService;
