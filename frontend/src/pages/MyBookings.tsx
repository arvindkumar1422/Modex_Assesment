import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import { Calendar, Ticket, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface Seat {
  id: number;
  row: string;
  number: number;
  type: 'STANDARD' | 'PREMIUM';
}

interface Show {
  id: number;
  title: string;
  startTime: string;
  poster: string;
  banner: string;
}

interface Booking {
  id: number;
  show: Show;
  seats: Seat[];
  createdAt: string;
}

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id');

  useEffect(() => {
    if (highlightId && bookings.length > 0) {
      const element = document.getElementById(`booking-${highlightId}`);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [bookings, highlightId]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setTimeout(() => setLoading(false), 0);
      return;
    }
    const user = JSON.parse(userStr);

    api.get(`/bookings/user/${user.id}`)
      .then(res => setBookings(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Ticket className="w-8 h-8 text-red-500" />
          My Bookings
        </h1>

        {bookings.length === 0 ? (
          <div className="text-center py-20 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-lg">No bookings found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div 
                key={booking.id} 
                id={`booking-${booking.id}`}
                className={`bg-gray-900 rounded-xl border overflow-hidden flex flex-col md:flex-row transition-all duration-500 ${
                  Number(highlightId) === booking.id 
                    ? 'border-red-500 ring-2 ring-red-500/20 shadow-[0_0_30px_rgba(220,38,38,0.3)]' 
                    : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                {/* Poster */}
                <div className="w-full md:w-48 h-64 md:h-auto relative">
                  <img 
                    src={booking.show.poster} 
                    alt={booking.show.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450?text=No+Image';
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{booking.show.title}</h2>
                      <div className="flex items-center gap-2 text-gray-400 mb-4">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(booking.show.startTime).toLocaleString()}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {booking.seats.map(seat => (
                          <span key={seat.id} className="px-3 py-1 bg-gray-800 rounded text-sm font-mono border border-gray-700">
                            {seat.row}{seat.number}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* QR Code */}
                    <div className="bg-white p-2 rounded-lg hidden sm:block">
                      <QRCodeSVG 
                        value={JSON.stringify({
                          bookingId: booking.id,
                          show: booking.show.title,
                          seats: booking.seats.map(s => `${s.row}${s.number}`).join(', ')
                        })}
                        size={80}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-end border-t border-gray-800 pt-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Booking ID</p>
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-red-500" />
                        <p className="font-mono text-lg text-white tracking-wider">#{booking.id.toString().padStart(6, '0')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Seats</p>
                      <p className="text-xl font-bold text-white">{booking.seats.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
