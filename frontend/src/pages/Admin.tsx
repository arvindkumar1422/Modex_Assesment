import { useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { Calendar, DollarSign, Image, Type, FileText, Layout, Lock } from 'lucide-react';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    poster: '',
    banner: '',
    startTime: '',
    price: 150
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
      toast.success('Welcome back, Admin!');
    } else {
      toast.error('Invalid credentials');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/shows', {
        ...formData,
        price: Number(formData.price)
      });
      toast.success('Show created successfully');
      setFormData({
        title: '',
        description: '',
        poster: '',
        banner: '',
        startTime: '',
        price: 150
      });
    } catch {
      toast.error('Failed to create show');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 w-full max-w-md shadow-2xl">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold">Admin Login</h1>
              <p className="text-gray-400 text-sm mt-2">Enter your credentials to access the dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  placeholder="admin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all mt-4"
              >
                Login
              </button>
            </form>
            
            <div className="mt-6 text-center text-xs text-gray-500">
              Sample Credentials: admin / admin123
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8 border-b border-gray-800 pb-6">
            <Layout className="w-8 h-8 text-red-500" />
            <h1 className="text-2xl font-bold">Create New Show</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
                  <Type className="w-4 h-4" /> Show Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. Inception"
                  required
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
                  <DollarSign className="w-4 h-4" /> Base Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
                <FileText className="w-4 h-4" /> Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                placeholder="Movie synopsis..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Poster URL */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
                  <Image className="w-4 h-4" /> Poster URL
                </label>
                <input
                  type="url"
                  name="poster"
                  value={formData.poster}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                  placeholder="https://..."
                  required
                />
              </div>

              {/* Banner URL */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
                  <Image className="w-4 h-4" /> Banner URL
                </label>
                <input
                  type="url"
                  name="banner"
                  value={formData.banner}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                  placeholder="https://..."
                  required
                />
              </div>
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
                <Calendar className="w-4 h-4" /> Start Time
              </label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-8"
            >
              Create Show
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
