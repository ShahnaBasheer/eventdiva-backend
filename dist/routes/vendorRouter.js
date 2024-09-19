"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validateForm_1 = require("../middlewares/validateForm");
const vendor_controller_1 = require("../controllers/vendors/vendor.controller");
const rateLimit_1 = __importDefault(require("../middlewares/rateLimit"));
const socket_controller_1 = require("../controllers/common/socket.controller");
const router = express_1.default.Router();
router.post('/login', validateForm_1.validateLogin, vendor_controller_1.loginVendor);
router.post('/signup', validateForm_1.validateVendorSignup, vendor_controller_1.signupVendor);
router.post('/verify-otp', vendor_controller_1.verifyOtp);
router.post('/resend-otp', rateLimit_1.default, vendor_controller_1.resendOtp);
router.get('/logout', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, vendor_controller_1.logout);
router.post('/video-call/join-call', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, socket_controller_1.getJoinCall);
router.get('/chat-room/', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, socket_controller_1.getAllChatRooms);
router.post('/chat-room/join-room', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, socket_controller_1.getOrCreateChatRoom);
router.get('/notifications', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, vendor_controller_1.getNotifications);
router.get('/unread-messages', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, socket_controller_1.getUnreadAllMessages);
router.patch('/notifications/read', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, vendor_controller_1.changeReadStatus);
router.delete('/notifications/delete/:id', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, vendor_controller_1.deleteNotification);
router.get('/profile', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, vendor_controller_1.getVendorProfile);
router.patch('/profile/update', authMiddleware_1.authMiddleware, authMiddleware_1.isUser, vendor_controller_1.updateVendorProfile);
exports.default = router;