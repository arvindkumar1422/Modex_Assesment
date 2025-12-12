import { Router } from 'express';
import { createShow, getShows, getShow } from './controllers/showController.ts';
import { bookSeats, getUserBookings } from './controllers/bookingController.ts';
import { loginAdmin, sendOtp, verifyOtp } from './controllers/authController.ts';

const router = Router();

router.post('/auth/otp/send', sendOtp);
router.post('/auth/otp/verify', verifyOtp);
router.post('/admin/login', loginAdmin);

router.post('/admin/shows', createShow);
router.get('/shows', getShows);
router.get('/shows/:id', getShow);
router.post('/bookings', bookSeats);
router.get('/bookings/user/:userId', getUserBookings);

export default router;
