import type { Request, Response } from 'express';
import prisma from '../prisma.ts';

export const bookSeats = async (req: Request, res: Response) => {
  const { showId, seatIds, userId } = req.body; 

  if (!Array.isArray(seatIds) || seatIds.length === 0) {
    return res.status(400).json({ error: 'No seats selected' });
  }

  try {
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Create Booking
      const booking = await tx.booking.create({
        data: {
          userId,
          showId,
          status: 'CONFIRMED', 
        }
      });

      // 2. Update seats
      // Try to update each seat. If any seat is not AVAILABLE, this will throw (P2025)
      // and the entire transaction will roll back.
      const updatePromises = seatIds.map((seatId) => 
        tx.seat.update({
          where: { id: seatId, status: 'AVAILABLE' },
          data: { 
            status: 'BOOKED', 
            bookingId: booking.id 
          }
        })
      );

      await Promise.all(updatePromises);

      return booking;
    });

    res.json(result);
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2025') {
        res.status(409).json({ error: 'One or more seats are already booked' });
    } else {
        res.status(500).json({ error: 'Booking failed' });
    }
  }
};

export const getUserBookings = async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: Number(userId) },
      include: {
        show: true,
        seats: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};
