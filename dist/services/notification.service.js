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
Object.defineProperty(exports, "__esModule", { value: true });
const customError_1 = require("../errors/customError");
const eventsVariables_1 = require("../utils/eventsVariables");
class NotificationService {
    constructor(_notificationrepository, _vendorRepository, _adminRepository, _customerRepository) {
        this._notificationrepository = _notificationrepository;
        this._vendorRepository = _vendorRepository;
        this._adminRepository = _adminRepository;
        this._customerRepository = _customerRepository;
    }
    Capitalize(val) {
        return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
    }
    addNotification(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userIdString = data.userId.toString();
                const role = this.Capitalize(data.userType);
                let user = null;
                if (role === 'Vendor') {
                    user = yield this._vendorRepository.getById(userIdString);
                }
                else if (role === 'Customer') {
                    user = yield this._customerRepository.getById(userIdString);
                }
                else if (role === 'Admin') {
                    user = yield this._adminRepository.getById(userIdString);
                }
                if (user && eventsVariables_1.notificationTypes.includes(data.notificationType)) {
                    // Create a new notification
                    const notification = {
                        userId: user.id, // Assuming senderId is the user who will receive the notification
                        userType: role,
                        message: data.message,
                        link: data.link,
                        isRead: false,
                        notificationType: data.notificationType,
                    };
                    return yield this._notificationrepository.create(notification, [{
                            path: 'userId', // Populate userId
                            model: role, //
                        }]);
                }
                return null;
            }
            catch (error) {
                console.log(error.message, "notification add new message");
                throw new customError_1.BadRequestError('Unable to save notifications');
            }
        });
    }
    getNotifications(userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const notifications = yield this._notificationrepository.getAllNotifications({ userId, userType: this.Capitalize(role) });
            return notifications;
        });
    }
    updateReadStatus(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const notification = yield this._notificationrepository.update({ _id: id }, { isRead: true });
            return notification;
        });
    }
    deleteNotification(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id)
                throw new customError_1.BadRequestError('Id is missing or Invalid!');
            return yield this._notificationrepository.delete(id);
        });
    }
}
exports.default = NotificationService;
