import type { Request, Response } from 'express';
import prisma from '../prisma.ts';

export const createShow = async (req: Request, res: Response) => {
  try {
    const { title, description, poster, banner, startTime, price } = req.body;
    
    // Generate seats: 8 Rows (A-H), 10 Seats per row
    // Rows A-F: Standard, G-H: Premium
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seatsData = [];

    for (const row of rows) {
      const isPremium = row === 'G' || row === 'H';
      const seatPrice = isPremium ? Number(price) * 1.5 : Number(price);
      const type = isPremium ? 'PREMIUM' : 'STANDARD';

      for (let i = 1; i <= 10; i++) {
        seatsData.push({
          row,
          number: i,
          type,
          price: seatPrice,
          status: 'AVAILABLE' as const
        });
      }
    }

    const show = await prisma.show.create({
      data: {
        title,
        description,
        poster,
        banner,
        startTime: new Date(startTime),
        price: Number(price),
        seats: {
          create: seatsData
        }
      },
      include: {
        seats: true
      }
    });

    res.status(201).json(show);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create show' });
  }
};

export const getShows = async (req: Request, res: Response) => {
  try {
    const shows = await prisma.show.findMany({
      orderBy: { startTime: 'asc' }
    });
    res.json(shows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shows' });
  }
};

export const getShow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const show = await prisma.show.findUnique({
      where: { id: Number(id) },
      include: {
        seats: {
          orderBy: [{ row: 'asc' }, { number: 'asc' }]
        }
      }
    });
    
    if (!show) {
      return res.status(404).json({ error: 'Show not found' });
    }
    
    res.json(show);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch show' });
  }
};
