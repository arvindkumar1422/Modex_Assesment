import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface Show {
  id: number;
  title: string;
  description: string;
  poster: string;
  banner: string;
  startTime: string;
  price: number;
}

export default function Home() {
  const [shows, setShows] = useState<Show[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/shows')
      .then((res) => setShows(res.data))
      .catch((err) => {
        console.error(err);
        setError('Failed to load movies. Please ensure the backend server is running.');
      });

    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      api.get(`/bookings/user/${user.id}`)
        .then(res => {
          const now = new Date();
          const upcoming = res.data.filter((b: any) => new Date(b.show.startTime) > now);
          setUpcomingBookings(upcoming);
        })
        .catch(console.error);
    }
  }, []);

  useEffect(() => {
    if (shows.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.min(shows.length, 5));
    }, 5000);
    return () => clearInterval(interval);
  }, [shows]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % Math.min(shows.length, 5));
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + Math.min(shows.length, 5)) % Math.min(shows.length, 5));

  const featuredShows = shows.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      
      {/* Hero Carousel */}
      {error ? (
        <div className="h-[500px] w-full flex items-center justify-center bg-gray-900">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-500 mb-2">Connection Error</h2>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      ) : featuredShows.length > 0 && (
        <div className="relative h-[500px] w-full overflow-hidden group">
          {featuredShows.map((show, index) => (
            <div 
              key={show.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent z-10" />
              <img 
                src={show.banner || show.poster} 
                alt={show.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 z-20 p-8 md:p-16 max-w-4xl">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 transform transition-all duration-700 translate-y-0 opacity-100">{show.title}</h1>
                <p className="text-gray-300 text-lg mb-6 line-clamp-2 max-w-2xl">{show.description}</p>
                <Link 
                  to={`/booking/${show.id}`}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded font-semibold text-lg transition-colors inline-block"
                >
                  Book Tickets
                </Link>
              </div>
            </div>
          ))}
          
          {/* Carousel Controls */}
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={32} />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={32} />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-8 right-8 z-30 flex gap-2">
            {featuredShows.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentSlide ? 'bg-red-600 w-8' : 'bg-gray-400 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Shows Section */}
      {upcomingBookings.length > 0 && (
        <div className="max-w-7xl mx-auto px-8 py-8">
          <h2 className="text-2xl font-bold mb-6 border-l-4 border-red-600 pl-4">Your Upcoming Shows</h2>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {upcomingBookings.map((booking) => (
              <Link 
                key={booking.id} 
                to={`/my-bookings?id=${booking.id}`}
                className="flex-shrink-0 w-80 bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-red-500 transition-all group"
              >
                <div className="relative h-40">
                  <img 
                    src={booking.show.banner || booking.show.poster} 
                    alt={booking.show.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-lg font-bold text-white group-hover:text-red-500 transition-colors">{booking.show.title}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{new Date(booking.show.startTime).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{new Date(booking.show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Movies Grid */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <h2 className="text-2xl font-bold mb-8 border-l-4 border-red-600 pl-4">Recommended Movies</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {shows.map((show) => (
            <Link key={show.id} to={`/booking/${show.id}`} className="group">
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-4">
                <img 
                  src={show.poster} 
                  alt={show.title} 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450?text=No+Image';
                  }}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center text-center p-4">
                  <p className="text-sm mb-2">{show.description}</p>
                  <span className="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold">Book Now</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-1 group-hover:text-red-500 transition-colors">{show.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(show.startTime).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
