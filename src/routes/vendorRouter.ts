
import express, { Router } from 'express';
import { authMiddleware, isUser } from '../middlewares/authMiddleware';
import { validateLogin, validateVendorSignup } from '../middlewares/validateForm';
import { loginVendor, logout, resendOtp, 
       signupVendor, verifyOtp, 
       getNotifications, changeReadStatus, 
       deleteNotification
     } from '../controllers/customers/vendor.controller';
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


export default router

