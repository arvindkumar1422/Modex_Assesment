import type { Request, Response } from 'express';
import prisma from '../prisma.ts';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const loginAdmin = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

export const sendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Generate 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

  try {
    // Upsert user with new OTP
    await prisma.user.upsert({
      where: { email },
      update: { otp, otpExpiry },
      create: { email, otp, otpExpiry }
    });

    // In a real app, send Email here. For demo, return OTP in response.
    console.log(`OTP for ${email}: ${otp}`);
    res.json({ message: 'OTP sent successfully', otp }); // Remove otp from response in production
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Clear OTP after successful verification
    await prisma.user.update({
      where: { id: user.id },
      data: { otp: null, otpExpiry: null }
    });

    const token = jwt.sign({ userId: user.id, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Verification failed' });
  }
};
