import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import Navbar from '../components/Navbar';
import { cn } from '../lib/utils';
import { CreditCard, Loader2, CheckCircle, X } from 'lucide-react';

interface Seat {
  id: number;
  row: string;
  number: number;
  type: 'STANDARD' | 'PREMIUM';
  price: number;
  status: 'AVAILABLE' | 'BOOKED' | 'LOCKED';
}

interface Show {
  id: number;
  title: string;
  startTime: string;
  seats: Seat[];
}

export default function Booking() {
  const { id } = useParams();
  const [show, setShow] = useState<Show | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const fetchShow = useCallback(() => {
    api.get(`/shows/${id}`).then((res) => setShow(res.data));
  }, [id]);

  useEffect(() => {
    fetchShow();
    const interval = setInterval(fetchShow, 5000);
    return () => clearInterval(interval);
  }, [fetchShow]);

  const toggleSeat = (seatId: number) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      if (selectedSeats.length >= 6) {
        toast.error("You can only select up to 6 seats");
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast.error('Please login to book tickets');
      return;
    }
    const user = JSON.parse(userStr);

    setIsProcessing(true);
    
    // Simulate payment gateway delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      await api.post('/bookings', {
        showId: Number(id),
        seatIds: selectedSeats,
        userId: user.id
      });
      
      setIsProcessing(false);
      setPaymentSuccess(true);
      toast.success('Booking confirmed!');
      
      setTimeout(() => {
        setShowPayment(false);
        setPaymentSuccess(false);
        setSelectedSeats([]);
        fetchShow();
      }, 2000);
    } catch (error) {
      setIsProcessing(false);
      const err = error as AxiosError<{ error: string }>;
      toast.error(err.response?.data?.error || 'Booking failed');
      fetchShow();
    }
  };

  if (!show) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Loading...</div>;

  // Group seats by row
  const seatsByRow = show.seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  const totalPrice = selectedSeats.reduce((sum, id) => {
    const seat = show.seats.find(s => s.id === id);
    return sum + (seat?.price || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-950 text-white relative">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left: Seat Layout */}
        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{show.title}</h1>
            <p className="text-gray-400">{new Date(show.startTime).toLocaleString()}</p>
          </div>

          {/* Screen */}
          <div className="mb-12 flex flex-col items-center">
            <div className="w-3/4 h-2 bg-gray-700 rounded-t-full mb-4 shadow-[0_10px_30px_rgba(255,255,255,0.1)]" />
            <p className="text-gray-500 text-sm">SCREEN THIS WAY</p>
          </div>

          {/* Seats */}
          <div className="flex flex-col gap-4 items-center overflow-x-auto pb-8">
            {Object.entries(seatsByRow).map(([row, seats]) => (
              <div key={row} className="flex items-center gap-4">
                <span className="w-6 text-gray-500 font-mono">{row}</span>
                <div className="flex gap-2">
                  {seats.map((seat) => {
                    const isSelected = selectedSeats.includes(seat.id);
                    const isAvailable = seat.status === 'AVAILABLE';
                    const isPremium = seat.type === 'PREMIUM';
                    
                    return (
                      <button
                        key={seat.id}
                        disabled={!isAvailable}
                        onClick={() => toggleSeat(seat.id)}
                        className={cn(
                          "w-8 h-8 rounded-t-lg text-xs font-medium transition-all duration-200",
                          !isAvailable && "bg-gray-700 text-gray-500 cursor-not-allowed",
                          isAvailable && !isSelected && isPremium && "bg-purple-900/50 border border-purple-500 hover:bg-purple-800",
                          isAvailable && !isSelected && !isPremium && "bg-white/10 border border-white/20 hover:bg-white/20",
                          isSelected && "bg-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.5)] transform scale-110"
                        )}
                      >
                        {seat.number}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white/10 border border-white/20 rounded" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-700 rounded" />
              <span>Sold</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-900/50 border border-purple-500 rounded" />
              <span>Premium</span>
            </div>
          </div>
        </div>

        {/* Right: Booking Summary */}
        <div className="lg:w-96">
          <div className="bg-gray-900 rounded-lg p-6 sticky top-24 border border-gray-800">
            <h3 className="text-xl font-bold mb-6 text-red-500">Booking Summary</h3>
            
            {selectedSeats.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between text-gray-300">
                  <span>Seats ({selectedSeats.length})</span>
                  <span className="text-white font-mono">
                    {selectedSeats.map(id => {
                      const s = show.seats.find(x => x.id === id);
                      return `${s?.row}${s?.number}`;
                    }).join(', ')}
                  </span>
                </div>
                
                <div className="border-t border-gray-800 pt-4 flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold text-green-400">₹{totalPrice}</span>
                </div>

                <button 
                  onClick={() => setShowPayment(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold mt-4 transition-colors"
                >
                  Proceed to Pay
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Select seats to proceed
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
            <button 
              onClick={() => !isProcessing && !paymentSuccess && setShowPayment(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              disabled={isProcessing || paymentSuccess}
            >
              <X className="w-6 h-6" />
            </button>

            {paymentSuccess ? (
              <div className="flex flex-col items-center py-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
                <p className="text-gray-400">Your tickets have been booked.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-red-500/10 rounded-lg">
                    <CreditCard className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Payment Gateway</h2>
                    <p className="text-sm text-gray-400">Complete your purchase</p>
                  </div>
                </div>

                <div className="bg-gray-950 rounded-lg p-4 mb-6 border border-gray-800">
                  <div className="flex justify-between mb-2 text-sm text-gray-400">
                    <span>Total Amount</span>
                    <span>INR</span>
                  </div>
                  <div className="text-3xl font-bold">₹{totalPrice}</div>
                </div>

                <form onSubmit={handlePayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Card Number</label>
                    <input 
                      type="text" 
                      placeholder="0000 0000 0000 0000"
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 focus:ring-2 focus:ring-red-500 outline-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Expiry</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY"
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 focus:ring-2 focus:ring-red-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">CVV</label>
                      <input 
                        type="text" 
                        placeholder="123"
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 focus:ring-2 focus:ring-red-500 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg font-bold mt-6 transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Pay ₹${totalPrice}`
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
