
import express, { Router } from 'express';
import { authMiddleware, requireRole, setRole} from '../middlewares/authMiddleware';
import { validateLogin, validateVendorSignup } from '../middlewares/validateForm';
import vendorController from '../controllers/vendor.controller';
import resendOtpLimiter from '../middlewares/rateLimit';
import socketController from '../controllers/socket.controller';
import { UserRole } from '../utils/important-variables';
import authController from '../controllers/auth.controller';
import commonController from '../controllers/common.controller';


const router: Router = express.Router();


router.post('/login', setRole(UserRole.Vendor), validateLogin, authController.login);
router.post('/signup', setRole(UserRole.Vendor), validateVendorSignup, authController.signup);
router.post('/verify-otp', setRole(UserRole.Vendor), authController.verifyOtp);
router.post('/resend-otp', setRole(UserRole.Vendor), resendOtpLimiter, authController.resendOtp);

router.use(authMiddleware, requireRole(UserRole.Vendor));

router.get('/logout', authController.logout);
router.post('/video-call/join-call', socketController.getJoinCall);
router.get('/chat-room/', socketController.getAllChatRooms);
router.post('/chat-room/join-room', socketController.getOrCreateChatRoom)
router.get('/notifications', commonController.getNotifications);
router.get('/unread-messages', socketController.getUnreadAllMessages);
router.patch('/message/read', commonController.markMessageRead);
router.patch('/notifications/read', commonController.notificationReadStatus);
router.delete('/notifications/delete/:id', commonController.deleteNotification);
router.get('/profile', vendorController.getVendorProfile);
router.patch('/profile/update', vendorController.updateVendorProfile);
router.patch('/profile/email/', vendorController.updateEmailProfile);
router.patch('/profile/email-update', vendorController.verifyEmailProfile);
router.patch('/profile/password-change', vendorController.passwordChangeProfile);

export default router

