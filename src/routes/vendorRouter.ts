
import express, { Router } from 'express';
import { authMiddleware, isUser } from '../middlewares/authMiddleware';
import { validateLogin, validateVendorSignup } from '../middlewares/validateForm';
import { loginVendor, logout, resendOtp, 
       signupVendor, verifyOtp, 
       getNotifications, changeReadStatus, 
       deleteNotification,
       getVendorProfile, updateVendorProfile,
       updateEmailProfile, verifyEmailProfile,
       passWordChangeProfile
     } from '../controllers/vendors/vendor.controller';
import resendOtpLimiter from '../middlewares/rateLimit';
import { getJoinCall, getOrCreateChatRoom, getAllChatRooms,
    getUnreadAllMessages
 } from '../controllers/common/socket.controller';



const router: Router = express.Router();


router.post('/login', validateLogin, loginVendor);
router.post('/signup', validateVendorSignup, signupVendor);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtpLimiter, resendOtp);
router.get('/logout', authMiddleware, isUser, logout);
router.post('/video-call/join-call', authMiddleware, isUser, getJoinCall);
router.get('/chat-room/', authMiddleware, isUser, getAllChatRooms);
router.post('/chat-room/join-room', authMiddleware, isUser, getOrCreateChatRoom)
router.get('/notifications', authMiddleware, isUser, getNotifications);
router.get('/unread-messages', authMiddleware, isUser, getUnreadAllMessages);
router.patch('/notifications/read', authMiddleware, isUser, changeReadStatus);
router.delete('/notifications/delete/:id', authMiddleware, isUser, deleteNotification);
router.get('/profile', authMiddleware, isUser, getVendorProfile);
router.patch('/profile/update', authMiddleware, isUser, updateVendorProfile);
router.patch('/profile/email/', authMiddleware, isUser, updateEmailProfile);
router.patch('/profile/email-update', authMiddleware, isUser, verifyEmailProfile);
router.patch('/profile/password-change', authMiddleware, isUser, passWordChangeProfile);

export default router

