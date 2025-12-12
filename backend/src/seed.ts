import prisma from './prisma.ts';

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.booking.deleteMany({});
  await prisma.seat.deleteMany({});
  await prisma.show.deleteMany({});

  const movies = [
    {
      title: 'Inception',
      description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
      poster: 'https://image.tmdb.org/t/p/original/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg',
      banner: 'https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
      price: 180,
      startTime: new Date(new Date().setHours(18, 0, 0, 0)) // Today 6 PM
    },
    {
      title: 'Interstellar',
      description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
      poster: 'https://image.tmdb.org/t/p/original/gEU2QniL6E77AAyNsEtZqvCd57P.jpg',
      banner: 'https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg',
      price: 200,
      startTime: new Date(new Date().setHours(21, 0, 0, 0)) // Today 9 PM
    },
    {
      title: 'The Dark Knight',
      description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
      poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      banner: 'https://image.tmdb.org/t/p/original/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg',
      price: 150,
      startTime: new Date(new Date().setDate(new Date().getDate() + 1)) // Tomorrow
    },
    {
      title: 'Avengers: Endgame',
      description: 'After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos\' actions and restore balance to the universe.',
      poster: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
      banner: 'https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
      price: 250,
      startTime: new Date(new Date().setDate(new Date().getDate() + 2)) // Day after tomorrow
    }
  ];

  for (const movie of movies) {
    // Generate seats
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seatsData = [];

    for (const row of rows) {
      const isPremium = row === 'G' || row === 'H';
      const seatPrice = isPremium ? movie.price * 1.5 : movie.price;
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

    await prisma.show.create({
      data: {
        title: movie.title,
        description: movie.description,
        poster: movie.poster,
        banner: movie.banner,
        startTime: movie.startTime,
        price: movie.price,
        seats: {
          create: seatsData
        }
      }
    });
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
