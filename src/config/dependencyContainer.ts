

// src/config/dependencyContainer.ts
import UserService from '../services/user.service';
import CustomerService from '../services/customer.service';
import VendorService from '../services/vendor.service';
import AdminService from '../services/admin.service';
import NotificationService from '../services/notification.service';
import EventPlannerService from '../services/eventPlanner.service';
import VenueVendorService from '../services/venueVendor.service';
import VideoCallService from '../services/videoCall.service';
import ChatRoomService from '../services/chatRoom.service';
import SharedService from '../services/shared.service';
import AddressRepository from '../repositories/address.repository';
import AdminRepository from '../repositories/admin.repository';
import AvailabilityRepository from '../repositories/availability.repository';
import ChatRoomRepository from '../repositories/chatRoom.repository';
import CustomerRepository from '../repositories/customer.repository';
import EventPlannerRepository from '../repositories/eventPlanner.repository';
import NotificationRepository from '../repositories/notification.repository';
import PlannerBookingRepository from '../repositories/plannerBooking.repository';
import VendorRepository from '../repositories/vendor.repository';
import VenueBookingRepository from '../repositories/venueBooking.repository';
import VenueVendorRepository from '../repositories/venueVendor.repository';
import VideoCallRepository from '../repositories/videoCall.repository';



// Instantiate Repositories

const addressRepository = new AddressRepository();
const adminRepository = new AdminRepository();
const vendorRepository = new VendorRepository();
const customerRepository = new CustomerRepository();
const availabilityRepository = new AvailabilityRepository();
const chatRoomRepository = new ChatRoomRepository();
const eventPlannerRepository = new EventPlannerRepository();
const notificationRepository = new NotificationRepository();
const plannerBookingRepository = new PlannerBookingRepository();
const venueBookingRepository = new VenueBookingRepository();
const venueVendorRepository = new VenueVendorRepository();
const videoCallRepository = new VideoCallRepository();



// Instantiate Services with Repositories
const userService = new UserService(
    vendorRepository, adminRepository, customerRepository, notificationRepository
);
const customerService = new CustomerService(
    customerRepository, venueBookingRepository, plannerBookingRepository
);
const adminService = new AdminService(
    adminRepository, customerRepository, vendorRepository, plannerBookingRepository, venueBookingRepository
);
const vendorService = new VendorService(vendorRepository);
const eventPlannerService = new EventPlannerService(
    eventPlannerRepository, addressRepository, plannerBookingRepository, availabilityRepository, notificationRepository
);
const notificationService = new NotificationService(
    notificationRepository, vendorRepository, adminRepository, customerRepository
);
const venueVendorService = new VenueVendorService(
    venueVendorRepository, addressRepository, venueBookingRepository, availabilityRepository, notificationRepository
);
const videocallservice = new VideoCallService(videoCallRepository);
const chatroomservice = new ChatRoomService(
    chatRoomRepository, customerRepository, vendorRepository
);
const sharedService = new SharedService(
    vendorRepository, customerRepository
);



export {
    userService,
    customerService,
    adminService,
    vendorService,
    eventPlannerService,
    notificationService,
    venueVendorService,
    videocallservice,
    chatroomservice,
    sharedService
}