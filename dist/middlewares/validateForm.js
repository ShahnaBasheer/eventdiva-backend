"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateCheckAvailability = exports.ValidatePlannerBooking = exports.ValidateVenueBooking = exports.ValidateVenue = exports.ValidateEventPlanner = exports.validateVendorSignup = exports.validateAdmin = exports.validateLogin = exports.validateSignup = void 0;
const express_validator_1 = require("express-validator");
const customError_1 = require("../errors/customError");
const venueVariables_1 = require("../utils/venueVariables");
const validateSignup = [
    // Validation rules for each field in the request body
    (0, express_validator_1.body)('firstName').notEmpty().withMessage('First Name is required'),
    (0, express_validator_1.body)('lastName').notEmpty().withMessage('Last Name is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must contain atlease 6 characters'),
];
exports.validateSignup = validateSignup;
const validateLogin = [
    // Validation rules for each field in the request body
    (0, express_validator_1.body)('email').isEmail().withMessage('Email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must contain atlease 6 characters'),
];
exports.validateLogin = validateLogin;
const validateAdmin = [
    // Validation rules for each field in the request body
    (0, express_validator_1.body)('fullName').notEmpty().withMessage('First Name is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must contain atlease 6 characters'),
];
exports.validateAdmin = validateAdmin;
const validateVendorSignup = [
    // Validation rules for each field in the request body
    (0, express_validator_1.body)('firstName').notEmpty().withMessage('First Name is required'),
    (0, express_validator_1.body)('lastName').notEmpty().withMessage('Last Name is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must contain atlease 6 characters'),
    (0, express_validator_1.body)('vendorType').notEmpty().withMessage('vendorType is required')
        .isIn(['event-planner', 'venue-vendor', 'photographer', 'food-vendor']),
];
exports.validateVendorSignup = validateVendorSignup;
const ValidateEventPlanner = [
    // Middleware to parse JSON data and specific fields
    (req, res, next) => {
        try {
            req.body.companyInfo = JSON.parse(req.body.companyInfo);
            req.body.addressInfo = JSON.parse(req.body.addressInfo);
            req.body.services = JSON.parse(req.body.services);
            req.body.plannedCities = JSON.parse(req.body.plannedCities);
            next();
        }
        catch (error) {
            console.log(error.message, "Error happens in valid format");
            throw new customError_1.BadRequestError('Invalid JSON format in request body');
        }
    },
    // Company Info Validations
    (0, express_validator_1.body)('companyInfo.company')
        .notEmpty().withMessage('Company name is required')
        .trim()
        .isLength({ min: 3 }).withMessage('Company name must be at least 3 characters long')
        .escape(),
    (0, express_validator_1.body)('companyInfo.website')
        .optional({ nullable: true }).isURL().withMessage('Invalid URL format'),
    (0, express_validator_1.body)('companyInfo.email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    (0, express_validator_1.body)('companyInfo.mobile')
        .notEmpty().withMessage('Mobile number is required')
        .matches(/^[0-9]{10}$/).withMessage('Mobile number must be 10 digits'),
    (0, express_validator_1.body)('companyInfo.startYear')
        .notEmpty().withMessage('Start year is required')
        .isNumeric().withMessage('Start year must be a number')
        .custom((value) => value >= 1980 && value <= new Date().getFullYear())
        .withMessage('Advance payment must be at least 1000'),
    (0, express_validator_1.body)('companyInfo.maxEvents')
        .notEmpty().withMessage('MaxEvents is required')
        .isNumeric().withMessage('MaxEvents must be a number')
        .custom((value) => value >= 1).withMessage('MaxEvents must be greater than 0'),
    (0, express_validator_1.body)('companyInfo.minPrice')
        .notEmpty().withMessage('Minimum planning fee is required')
        .isNumeric().withMessage('Minimum planning fee must be a number')
        .custom((value) => value >= 0).withMessage('Minimum planning fee must be greater than 0'),
    (0, express_validator_1.body)('companyInfo.maxPrice')
        .notEmpty().withMessage('Maximum planning fee is required')
        .isNumeric().withMessage('Maximum planning fee must be a number')
        .custom((value, { req }) => value >= parseInt(req.body.companyInfo.minPrice))
        .withMessage('Maximum planning fee must be greater than or equal to minimum planning fee'),
    (0, express_validator_1.body)('description')
        .notEmpty()
        .isLength({ min: 100 }).withMessage('Description must be between 100.')
        .trim()
        .escape(),
    // Address Info Validations
    (0, express_validator_1.body)('addressInfo.building')
        .notEmpty().withMessage('Building name is required')
        .isLength({ min: 3 }).withMessage('Building name must be atleast 4 characters long'),
    (0, express_validator_1.body)('addressInfo.street')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 3 }).withMessage('Street name must be atleast 3 characters long'),
    (0, express_validator_1.body)('addressInfo.city')
        .notEmpty().withMessage('City name is required')
        .isLength({ min: 3 }).withMessage('City name must be atleast 3 characters long'),
    (0, express_validator_1.body)('addressInfo.town')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 3 }).withMessage('Town name must be atleast 3 characters long'),
    (0, express_validator_1.body)('addressInfo.district')
        .notEmpty().withMessage('District name is required')
        .isLength({ min: 3 }).withMessage('District name must be atleast 3 characters long'),
    (0, express_validator_1.body)('addressInfo.state')
        .notEmpty().withMessage('State name is required')
        .isLength({ min: 3 }).withMessage('State name must be atleast 3 characters long'),
    (0, express_validator_1.body)('addressInfo.landmark')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 4 }).withMessage('Landmark must be atleast 4 characters long'),
    (0, express_validator_1.body)('addressInfo.pincode')
        .notEmpty().withMessage('Pincode is required')
        .isNumeric().withMessage('Pincode must be a number')
        .isLength({ min: 6 }).withMessage('Pincode must be 6 digits'),
    (0, express_validator_1.body)('services')
        .notEmpty().withMessage('Service information is required')
        .isArray({ min: 1 }).withMessage('Planned cities must be an array with atleast 1 service'),
    (0, express_validator_1.body)('plannedCities')
        .notEmpty().withMessage('Planned cities are required')
        .isArray({ min: 1 }).withMessage('Planned cities must be an array with atleast 1 city'),
];
exports.ValidateEventPlanner = ValidateEventPlanner;
const ValidateVenue = [
    // Middleware to parse JSON data and specific fields
    (req, res, next) => {
        try {
            req.body.venueInfo = JSON.parse(req.body.venueInfo);
            req.body.addressInfo = JSON.parse(req.body.addressInfo);
            req.body.priceInfo = JSON.parse(req.body.priceInfo);
            req.body.services = JSON.parse(req.body.services);
            req.body.amenities = JSON.parse(req.body.amenities);
            req.body.areas = JSON.parse(req.body.areas);
            next();
        }
        catch (error) {
            console.log(error.message);
            throw new customError_1.BadRequestError('Invalid JSON format in request body');
        }
    },
    // Company Info Validations
    (0, express_validator_1.body)('venueInfo.venueName')
        .notEmpty().withMessage('Venue name is required')
        .trim()
        .isLength({ min: 3 }).withMessage('Venue name must be at least 3 characters long')
        .escape(),
    (0, express_validator_1.body)('venueInfo.venueType')
        .notEmpty().withMessage('Venue Type is required')
        .isIn(venueVariables_1.venueTypeValues).withMessage('Invalid Venue Type'),
    (0, express_validator_1.body)('venueInfo.email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    (0, express_validator_1.body)('venueInfo.mobile')
        .notEmpty().withMessage('Mobile number is required')
        .matches(/^[0-9]{10}$/).withMessage('Mobile number must be 10 digits'),
    (0, express_validator_1.body)('venueInfo.startYear')
        .notEmpty().withMessage('Start year is required')
        .isNumeric().withMessage('Start year must be a number')
        .custom((value) => value >= 1980 && value <= new Date().getFullYear())
        .withMessage('Advance payment must be at least 1000'),
    (0, express_validator_1.body)('venueInfo.maxEvents')
        .notEmpty().withMessage('MaxEvents is required')
        .isNumeric().withMessage('MaxEvents must be a number')
        .custom((value) => value >= 1).withMessage('MaxEvents must be greater than 0'),
    (0, express_validator_1.body)('description')
        .notEmpty()
        .isLength({ min: 100 }).withMessage('Description must be between 100.')
        .trim()
        .escape(),
    // Address Info Validations
    (0, express_validator_1.body)('addressInfo.building')
        .notEmpty().withMessage('Building name is required')
        .isLength({ min: 3 }).withMessage('Building name must be atleast 4 characters long'),
    (0, express_validator_1.body)('addressInfo.street')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 3 }).withMessage('Street name must be atleast 3 characters long'),
    (0, express_validator_1.body)('addressInfo.city')
        .notEmpty().withMessage('City name is required')
        .isLength({ min: 3 }).withMessage('City name must be atleast 3 characters long'),
    (0, express_validator_1.body)('addressInfo.town')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 3 }).withMessage('Town name must be atleast 3 characters long'),
    (0, express_validator_1.body)('addressInfo.district')
        .notEmpty().withMessage('District name is required')
        .isLength({ min: 3 }).withMessage('District name must be atleast 3 characters long'),
    (0, express_validator_1.body)('addressInfo.state')
        .notEmpty().withMessage('State name is required')
        .isLength({ min: 3 }).withMessage('State name must be atleast 3 characters long'),
    (0, express_validator_1.body)('addressInfo.landmark')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 4 }).withMessage('Landmark must be atleast 4 characters long'),
    (0, express_validator_1.body)('addressInfo.pincode')
        .notEmpty().withMessage('Pincode is required')
        .isNumeric().withMessage('Pincode must be a number')
        .isLength({ min: 6 }).withMessage('Pincode must be 6 digits'),
    (0, express_validator_1.body)('priceInfo.rent')
        .notEmpty().withMessage('Rent is required')
        .isNumeric().withMessage('Rent must be a number')
        .custom((value) => value > 0).withMessage('Rent must be greater than 0'),
    (0, express_validator_1.body)('priceInfo.platePrice.vegPerPlate')
        .optional({ nullable: true, checkFalsy: true })
        .notEmpty().withMessage('Veg Per Plate is required')
        .isNumeric().withMessage('Veg Per Plate a number')
        .custom((value) => value > 0).withMessage('Veg Per Plate must be greater than 0'),
    (0, express_validator_1.body)('priceInfo.platePrice.nonVegPerPlate')
        .optional({ nullable: true, checkFalsy: true })
        .notEmpty().withMessage('Rent is required')
        .isNumeric().withMessage('Rent must be a number')
        .custom((value) => value > 0).withMessage('Rent must be greater than 0'),
    (0, express_validator_1.body)('priceInfo.rooms.count')
        .optional({ nullable: true, checkFalsy: true })
        .notEmpty().withMessage('Rent is required')
        .isNumeric().withMessage('Rent must be a number')
        .custom((value) => value > 0).withMessage('Rent must be greater than 0'),
    (0, express_validator_1.body)('priceInfo.rooms.startingPrice')
        .optional({ nullable: true, checkFalsy: true })
        .notEmpty().withMessage('Starting Price is required')
        .isNumeric().withMessage('Starting Price must be a number')
        .custom((value) => value >= 10).withMessage('Starting Price must be greater than 0'),
    (0, express_validator_1.body)('priceInfo.decorStartingPrice')
        .optional({ nullable: true, checkFalsy: true })
        .notEmpty().withMessage('Decor Starting Price is required')
        .isNumeric().withMessage('Decor Starting Price must be a number')
        .custom((value) => value >= 10).withMessage('Decor Starting Price must be greater than 10'),
    (0, express_validator_1.body)('services')
        .notEmpty().withMessage('Services are required')
        .isArray({ min: 1 }).withMessage('Services must be an array with atleast 1 service'),
    (0, express_validator_1.body)('amenities')
        .notEmpty().withMessage('Amenities are required')
        .isArray({ min: 1 }).withMessage('Amenities must be an array with atleast 1 amenity'),
    (0, express_validator_1.body)('areas')
        .notEmpty().withMessage('Areas are required')
        .isArray({ min: 1 }).withMessage('Areas must be an array with atleast 1 amenity'),
];
exports.ValidateVenue = ValidateVenue;
const ValidateVenueBooking = [
    // Middleware to parse JSON data and specific fields
    (req, res, next) => {
        try {
            req.body.eventInfo = JSON.parse(req.body.eventInfo);
            req.body.addressInfo = JSON.parse(req.body.addressInfo);
            req.body.servicesInfo = JSON.parse(req.body.servicesInfo);
            req.body.servicesRequested = JSON.parse(req.body.servicesRequested);
            next();
        }
        catch (error) {
            console.log(error.message);
            throw new customError_1.BadRequestError('Invalid JSON format in request body');
        }
    },
    // Company Info Validations
    (0, express_validator_1.body)('eventInfo.eventName')
        .notEmpty().withMessage('Venue name is required')
        .trim()
        .isLength({ min: 3 }).withMessage('Venue name must be at least 3 characters long')
        .escape(),
    (0, express_validator_1.body)('eventInfo.eventType')
        .notEmpty().withMessage('Event Type is required'),
    (0, express_validator_1.body)('eventInfo.email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    (0, express_validator_1.body)('eventInfo.mobile')
        .notEmpty().withMessage('Mobile number is required')
        .matches(/^[0-9]{10}$/).withMessage('Mobile number must be 10 digits'),
    // Address Info Validations
    (0, express_validator_1.body)('addressInfo.building')
        .notEmpty().withMessage('Building name is required')
        .isLength({ min: 3 }).withMessage('Building name must be atleast 4 characters long'),
    (0, express_validator_1.body)('addressInfo.street')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 3 }).withMessage('Street name must be atleast 3 characters long'),
    (0, express_validator_1.body)('addressInfo.city')
        .notEmpty().withMessage('City name is required')
        .isLength({ min: 3 }).withMessage('City name must be atleast 3 characters long'),
    (0, express_validator_1.body)('addressInfo.town')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 3 }).withMessage('Town name must be atleast 3 characters long'),
    (0, express_validator_1.body)('addressInfo.district')
        .notEmpty().withMessage('District name is required')
        .isLength({ min: 3 }).withMessage('District name must be atleast 3 characters long'),
    (0, express_validator_1.body)('addressInfo.state')
        .notEmpty().withMessage('State name is required')
        .isLength({ min: 3 }).withMessage('State name must be atleast 3 characters long'),
    (0, express_validator_1.body)('addressInfo.landmark')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 4 }).withMessage('Landmark must be atleast 4 characters long'),
    (0, express_validator_1.body)('addressInfo.pincode')
        .notEmpty().withMessage('Pincode is required')
        .isNumeric().withMessage('Pincode must be a number')
        .isLength({ min: 6 }).withMessage('Pincode must be 6 digits'),
    (0, express_validator_1.body)('servicesRequested')
        .notEmpty().withMessage('Services requested are required')
        .optional({ nullable: true, checkFalsy: true })
        .isArray({ min: 1 }).withMessage('Services requested must be an array with atleast 1 service'),
];
exports.ValidateVenueBooking = ValidateVenueBooking;
const ValidatePlannerBooking = [
    // Company Info Validations
    (0, express_validator_1.body)('eventInfo.eventName')
        .notEmpty().withMessage('Event name is required')
        .trim()
        .isLength({ min: 3 }).withMessage('Event name must be at least 3 characters long')
        .escape(),
    (0, express_validator_1.body)('eventInfo.eventType')
        .notEmpty().withMessage('Event Type is required'),
    (0, express_validator_1.body)('eventInfo.email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    (0, express_validator_1.body)('eventInfo.mobile')
        .notEmpty().withMessage('Mobile number is required')
        .matches(/^[0-9]{10}$/).withMessage('Mobile number must be 10 digits'),
    // Address Info Validations
    (0, express_validator_1.body)('addressInfo.building')
        .notEmpty().withMessage('Building name is required')
        .isLength({ min: 3 }).withMessage('Building name must be atleast 4 characters long'),
    (0, express_validator_1.body)('addressInfo.street')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 3 }).withMessage('Street name must be atleast 3 characters long'),
    (0, express_validator_1.body)('addressInfo.city')
        .notEmpty().withMessage('City name is required')
        .isLength({ min: 3 }).withMessage('City name must be atleast 3 characters long'),
    (0, express_validator_1.body)('addressInfo.town')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 3 }).withMessage('Town name must be atleast 3 characters long'),
    (0, express_validator_1.body)('addressInfo.district')
        .notEmpty().withMessage('District name is required')
        .isLength({ min: 3 }).withMessage('District name must be atleast 3 characters long'),
    (0, express_validator_1.body)('addressInfo.state')
        .notEmpty().withMessage('State name is required')
        .isLength({ min: 3 }).withMessage('State name must be atleast 3 characters long'),
    (0, express_validator_1.body)('addressInfo.landmark')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 4 }).withMessage('Landmark must be atleast 4 characters long'),
    (0, express_validator_1.body)('addressInfo.pincode')
        .notEmpty().withMessage('Pincode is required')
        .isNumeric().withMessage('Pincode must be a number')
        .isLength({ min: 6 }).withMessage('Pincode must be 6 digits'),
];
exports.ValidatePlannerBooking = ValidatePlannerBooking;
const ValidateCheckAvailability = [
    (0, express_validator_1.body)('eventType')
        .notEmpty().withMessage('Event Type is required')
        .isLength({ min: 3 }).withMessage('Event Type must be at least 3 characters long'),
    (0, express_validator_1.body)('isMultipleDays')
        .notEmpty().withMessage('isMultipleDays is required')
        .isBoolean().withMessage('isMultipleDays must be a boolean'),
    (0, express_validator_1.body)('startDate')
        .notEmpty().withMessage('Start date is required')
        .isISO8601().withMessage('Start date must be a valid date'),
    (0, express_validator_1.body)('endDate')
        .notEmpty().withMessage('End date is required')
        .isISO8601().withMessage('End date must be a valid date')
        .custom((value, { req }) => {
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(value);
        if (req.body.endDate && endDate < startDate) {
            throw new Error('End date must be greater than or equal to start date');
        }
        return true;
    }),
];
exports.ValidateCheckAvailability = ValidateCheckAvailability;
// body('guests')
// .notEmpty().withMessage('Number of guests is required')
// .isInt({ min: 20 }).withMessage('Guests must be at least 20'),
