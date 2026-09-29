import React, { useState } from 'react';
import { Room, User } from '../types';
import { api } from '../services/api';
import { CheckInSearchResultsModal } from './CheckInSearchResultsModal';
import {
  Wifi,
  MapPin,
  Luggage,
  CircleParking,
  Star,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  Calendar,
  Users,
  Play,
  Check,
  DoorClosed,
  LogIn,
  Bed,
  Sparkles,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

interface HostellerLandingProps {
  rooms: Room[];
  onOpenPortal: () => void;
  onSelectRoomForBooking?: (room: Room) => void;
  isLoggedIn: boolean;
  userRole?: 'admin' | 'student';
  currentUser?: User | null;
  onRefreshData?: () => void;
}

const TESTIMONIALS = [
  {
    stars: 5,
    date: 'September 2026',
    title: 'Outstanding hostel facilities and super friendly community',
    text: 'Living here has been the best accommodation experience during my semesters. The rooms are spotless, fast fiber WiFi makes remote study effortless, and the warden desk handles any maintenance complaints within hours.',
    author: 'Kate Walker',
    role: 'Computer Science Resident',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80',
  },
  {
    stars: 5,
    date: 'August 2026',
    title: 'Quiet study atmosphere with comfortable 2-person rooms',
    text: 'The strict maximum of two students per room ensures peace of mind during exam weeks. Modern beds, private study lamps, and safe luggage storage. 10/10 recommended for student living.',
    author: 'Marcus Brody',
    role: 'Engineering Scholar',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80',
  },
  {
    stars: 5,
    date: 'July 2026',
    title: 'Warden administration is organized and very transparent',
    text: 'The online portal lets us track room details, roommates, and ticket statuses seamlessly. Clean bathrooms and top tier central campus location.',
    author: 'Elena Rostova',
    role: 'Architecture Student',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=700&q=80',
  },
];

export const HostellerLanding: React.FC<HostellerLandingProps> = ({
  rooms,
  onOpenPortal,
  onSelectRoomForBooking,
  isLoggedIn,
  userRole,
  currentUser,
  onRefreshData,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const defaultCheckOut = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  // Search Bar state
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [guests, setGuests] = useState('1 resident');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [availableRoomsResult, setAvailableRoomsResult] = useState<Room[]>([]);

  // Testimonial slider state
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  // Video modal toggle
  const [showVideoModal, setShowVideoModal] = useState(false);

  const nextTestimonial = () => {
    setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setTestimonialIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    try {
      const res = await api.searchAvailability({
        checkIn: checkIn || today,
        checkOut: checkOut || defaultCheckOut,
        guests,
      });
      setAvailableRoomsResult(res.rooms as any);
      setIsSearchModalOpen(true);
    } catch {
      // Client-side fallback filter
      const reqBeds = guests === '2 residents' ? 2 : 1;
      const filtered = rooms.filter((r) => 2 - (r.occupants?.length || 0) >= reqBeds);
      setAvailableRoomsResult(filtered);
      setIsSearchModalOpen(true);
    } finally {
      setSearching(false);
    }
  };

  const currentTestimonial = TESTIMONIALS[testimonialIndex];

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* ========================================================
          1. HERO SECTION (Screenshot 1)
          ======================================================== */}
      <section id="hero" className="relative pt-6 sm:pt-10 pb-16 lg:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Heading, description & Search box */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#e8f1f8] dark:bg-slate-800 text-[#1b4d79] dark:text-sky-300">
                <span className="w-2 h-2 rounded-full bg-[#1b4d79] dark:bg-sky-400 animate-pulse" />
                Hosteller Premier Student & Resident Living
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                Hosteller — amazing hostel for the free spirited traveler
              </h1>

              <div className="border-l-2 border-[#1b4d79] dark:border-sky-500 pl-4 py-1">
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  Enjoy modern, sunlit double-resident dorms with high-speed internet, central campus location, and direct digital room allocation with strict two-bed capacity limits.
                </p>
              </div>

              {/* Direct Portal CTA banner */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onOpenPortal}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold text-white bg-[#1b4d79] hover:bg-[#14395a] active:bg-[#0f2c46] shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4d79]"
                >
                  {isLoggedIn ? (
                    <>
                      {userRole === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      <span>Open {userRole === 'admin' ? 'Warden Management Console' : 'Student Portal'}</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Resident & Warden Portal Access</span>
                    </>
                  )}
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </button>

                <a
                  href="#hostel-rooms"
                  className="inline-flex items-center gap-1.5 px-4 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span>Explore Rooms ({rooms.length})</span>
                </a>
              </div>

              {/* Check-In & Check-Out Booking Bar (Exact Match with image.png) */}
              <div className="pt-4">
                <form
                  onSubmit={handleSearchSubmit}
                  className="bg-[#0b192c] border border-slate-800 rounded-2xl shadow-2xl p-2.5 sm:p-3.5 flex flex-col md:flex-row items-stretch gap-2 transition-all"
                >
                  {/* Check-in */}
                  <div className="flex-1 px-3 py-2 border-b md:border-b-0 md:border-r border-slate-800">
                    <span className="block text-[10px] font-bold text-sky-400 tracking-wider uppercase">
                      CHECK-IN
                    </span>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Calendar className="w-4 h-4 text-[#0ea5e9] shrink-0" />
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full text-xs font-medium text-white bg-transparent focus-visible:outline-none cursor-pointer [color-scheme:dark]"
                        placeholder="mm/dd/yyyy"
                      />
                    </div>
                  </div>

                  {/* Check-out */}
                  <div className="flex-1 px-3 py-2 border-b md:border-b-0 md:border-r border-slate-800">
                    <span className="block text-[10px] font-bold text-sky-400 tracking-wider uppercase">
                      CHECK-OUT
                    </span>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Calendar className="w-4 h-4 text-[#0ea5e9] shrink-0" />
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full text-xs font-medium text-white bg-transparent focus-visible:outline-none cursor-pointer [color-scheme:dark]"
                        placeholder="mm/dd/yyyy"
                      />
                    </div>
                  </div>

                  {/* Guests */}
                  <div className="flex-1 px-3 py-2">
                    <span className="block text-[10px] font-bold text-sky-400 tracking-wider uppercase">
                      GUESTS / BED
                    </span>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Users className="w-4 h-4 text-[#0ea5e9] shrink-0" />
                      <select
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className="w-full text-xs font-medium text-white bg-transparent focus-visible:outline-none cursor-pointer [&>option]:bg-slate-900 [&>option]:text-white"
                      >
                        <option value="1 resident">1 Resident Bed</option>
                        <option value="2 residents">2 Residents (Whole Room)</option>
                      </select>
                    </div>
                  </div>

                  {/* Search Button */}
                  <button
                    type="submit"
                    disabled={searching}
                    className="md:px-8 py-3 rounded-xl text-sm font-bold text-white bg-[#1a4e7a] hover:bg-[#133f64] active:bg-[#0e2f4c] transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                  >
                    <span>{searching ? 'Checking...' : 'Search'}</span>
                  </button>
                </form>

                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-sky-400" />
                  <span>Real-time availability check with strict 2-bed room limits & semester discounts</span>
                </p>
              </div>
            </div>

            {/* Right Column: Hero Image (Clean hostel interior with skylight) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 aspect-[4/3] lg:aspect-[5/6] bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"
                  alt="Hosteller Sunlit Room with Skylight"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

                {/* Floating badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-lg flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Standard Double Resident Room
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Strict 2-bed allocation limit · Ensuite bathroom
                    </span>
                  </div>
                  <span className="text-xs font-bold font-mono text-[#1b4d79] dark:text-sky-400 bg-[#e8f1f8] dark:bg-slate-800 px-2 py-1 rounded">
                    $24 / night
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. HOSTEL ROOMS SHOWCASE (Screenshot 2)
          ======================================================== */}
      <section id="hostel-rooms" className="py-16 bg-slate-50/60 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Hostel rooms
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Spacious student & traveler dorms with maximum 2 beds per room for optimal privacy.
              </p>
            </div>

            <button
              onClick={onOpenPortal}
              className="self-start sm:self-auto px-4 py-2 text-xs font-semibold text-[#1b4d79] dark:text-sky-300 bg-[#e8f1f8] dark:bg-slate-800 hover:bg-[#d6e7f4] dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              View all rooms ({rooms.length})
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Bunk Bed Shared Room */}
            <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col">
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"
                  alt="Bed in 6-Bed Room with Shared Bathroom"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-3 right-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold font-mono px-2.5 py-1 rounded shadow-md">
                  $18 <span className="font-normal text-[11px] text-slate-500">/ 1 night</span>
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Bed in 6-Bed Room with Shared Bathroom
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#1b4d79] dark:text-sky-400" />
                      2 Sleeps
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Bed className="w-3.5 h-3.5 text-[#1b4d79] dark:text-sky-400" />
                      1 bunk bed
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={onOpenPortal}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1b4d79] dark:text-sky-400 hover:underline"
                  >
                    <span>See availability</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Available for Allocation
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Double Room with Private Bathroom */}
            <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col">
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80"
                  alt="Double Room with Private Bathroom"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-3 right-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold font-mono px-2.5 py-1 rounded shadow-md">
                  $35 <span className="font-normal text-[11px] text-slate-500">/ 1 night</span>
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Double Room with Private Bathroom
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#1b4d79] dark:text-sky-400" />
                      2 Sleeps
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Bed className="w-3.5 h-3.5 text-[#1b4d79] dark:text-sky-400" />
                      2 twin beds
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={onOpenPortal}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1b4d79] dark:text-sky-400 hover:underline"
                  >
                    <span>See availability</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Strict 2-Bed Max
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Deep Blue Promo Box "Stay Longer, Save More" (Screenshot 2) */}
            <div className="bg-[#1b4d79] text-white rounded-xl p-6 sm:p-7 flex flex-col justify-between shadow-md">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-white mb-2">
                  Stay Longer,<br />Save More
                </h3>
                <p className="text-xs text-sky-100/90 leading-relaxed mb-6">
                  It's simple: the longer you stay, the more you save! Semester packages and resident discounts available.
                </p>

                <div className="space-y-4 border-l-2 border-sky-400/60 pl-3.5 text-xs text-sky-100">
                  <div>
                    <span className="font-bold text-white block">Save up to 30%</span>
                    on daily rate for stays longer than 14 nights
                  </div>
                  <div>
                    <span className="font-bold text-white block">Save up to 20%</span>
                    off the nightly rate on stays between 7-14 nights
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={onOpenPortal}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#e8f1f8] text-[#1b4d79] font-bold text-xs hover:bg-white transition-colors"
                >
                  Choose room
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. "WE HAVE EVERYTHING YOU NEED" (Screenshot 3)
          ======================================================== */}
      <section id="amenities" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Heading, description, 4 amenities & buttons */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                  We have everything you need
                </h2>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  From lightning-fast campus WiFi to secure luggage lockers and round-the-clock warden support, Hosteller provides complete facilities for focused study and relaxed community living.
                </p>
              </div>

              {/* 4 Feature Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* 1. WiFi */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#e8f1f8] dark:bg-slate-800 flex items-center justify-center shrink-0 text-[#1b4d79] dark:text-sky-400">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Free available high speed WiFi
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">High-speed fiber campus network</p>
                  </div>
                </div>

                {/* 2. Convenient Location */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#e8f1f8] dark:bg-slate-800 flex items-center justify-center shrink-0 text-[#1b4d79] dark:text-sky-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Convenient location in the center
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Walkable to lecture halls and transit</p>
                  </div>
                </div>

                {/* 3. Free Storage */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#e8f1f8] dark:bg-slate-800 flex items-center justify-center shrink-0 text-[#1b4d79] dark:text-sky-400">
                    <Luggage className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Free storage of luggage of any size
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Keycard access secure storage rooms</p>
                  </div>
                </div>

                {/* 4. Parking */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#e8f1f8] dark:bg-slate-800 flex items-center justify-center shrink-0 text-[#1b4d79] dark:text-sky-400">
                    <CircleParking className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Parking place allocated to you
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Reserved spots for bicycles & cars</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={onOpenPortal}
                  className="px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#1b4d79] hover:bg-[#14395a] shadow-sm transition-colors"
                >
                  Book now
                </button>

                <a
                  href="#contacts"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1b4d79] dark:text-sky-400 hover:underline"
                >
                  <span>More about</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Right Column: Students community image with Play button overlay */}
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[16/11] bg-slate-100 group">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80"
                  alt="Hostel students studying and smiling together"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/30 transition-colors" />

                {/* Play Button Overlay (Screenshot 3) */}
                <button
                  type="button"
                  onClick={() => setShowVideoModal(true)}
                  aria-label="Play virtual campus tour"
                  className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-white/90 hover:bg-white text-[#1b4d79] shadow-xl flex items-center justify-center transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
                >
                  <Play className="w-6 h-6 ml-0.5 fill-current" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal popup if clicked */}
      {showVideoModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowVideoModal(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-6 max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                🏠 Hosteller Campus & Dorm Tour
              </h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                aria-label="Close video"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Welcome to our virtual hostel showcase! Take a tour of our study halls, recreation lounges, 
              and double-occupant resident rooms with modern amenities.
            </p>
            
            {/* Video Player */}
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              {/* Option 1: YouTube Embed - Replace VIDEO_ID with your YouTube video ID */}
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Hostel Campus Tour"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              
              {/* Option 2: Local Video File - Uncomment to use
              <video 
                className="w-full h-full" 
                controls 
                autoPlay
                poster="/hostel-tour-thumbnail.jpg"
              >
                <source src="/videos/hostel-tour.mp4" type="video/mp4" />
                <source src="/videos/hostel-tour.webm" type="video/webm" />
                Your browser does not support the video tag.
              </video>
              */}
              
              {/* Option 3: Vimeo Embed - Uncomment to use Vimeo
              <iframe
                className="w-full h-full"
                src="https://player.vimeo.com/video/VIDEO_ID?autoplay=1"
                title="Hostel Campus Tour"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              ></iframe>
              */}
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                🎥 Virtual 360° Walkthrough Experience
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#1b4d79] hover:bg-[#14395a] rounded-lg transition-colors"
              >
                Close Tour
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          4. RATINGS & REVIEWS SECTION (Screenshot 4)
          ======================================================== */}
      <section id="reviews" className="py-16 bg-slate-50/70 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Rating Banners (Screenshot 4) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-14 border-b border-slate-200 dark:border-slate-800">
            {/* Booking.com */}
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                8.3<span className="text-sm font-normal text-slate-400">/10</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">1398 comments</div>
              <div className="mt-2 text-sm font-bold text-[#003580] tracking-tight">Booking.com</div>
            </div>

            {/* TripAdvisor */}
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                4.6<span className="text-sm font-normal text-slate-400">/5</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">460 notes</div>
              <div className="mt-2 text-sm font-bold text-[#00af87] tracking-tight">tripadvisor</div>
            </div>

            {/* Google */}
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                4.9<span className="text-sm font-normal text-slate-400">/5</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">2389 notes</div>
              <div className="mt-2 text-sm font-bold text-[#4285F4] tracking-tight">Google</div>
            </div>

            {/* hostelbookers */}
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                98%
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">2389 recommendations</div>
              <div className="mt-2 text-sm font-bold text-[#8db924] tracking-tight">hostelbookers</div>
            </div>
          </div>

          {/* Guest Reviews Card (Screenshot 4) */}
          <div className="pt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Photo */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-square bg-slate-100">
                <img
                  src={currentTestimonial.image}
                  alt={currentTestimonial.author}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right Card */}
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                What our guests say
              </h2>

              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative">
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-amber-400 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <div className="text-xs font-semibold text-slate-900 dark:text-white mb-2">
                  Date of stay: <span className="font-normal text-slate-500">{currentTestimonial.date}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {currentTestimonial.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  "{currentTestimonial.text}"
                </p>

                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {currentTestimonial.author}
                  <span className="block font-normal text-slate-400 text-[11px]">
                    {currentTestimonial.role}
                  </span>
                </div>
              </div>

              {/* Carousel Arrows */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={prevTestimonial}
                  aria-label="Previous review"
                  className="w-8 h-8 rounded-lg bg-[#e8f1f8] dark:bg-slate-800 text-[#1b4d79] dark:text-sky-300 hover:bg-[#d4e6f4] flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={nextTestimonial}
                  aria-label="Next review"
                  className="w-8 h-8 rounded-lg bg-[#e8f1f8] dark:bg-slate-800 text-[#1b4d79] dark:text-sky-300 hover:bg-[#d4e6f4] flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. CONTACTS SECTION (Screenshot 5)
          ======================================================== */}
      <section id="contacts" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Contacts
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
              Get in touch with the Warden Office for room allocation enquiries, maintenance emergencies, or semester booking reservations.
            </p>
          </div>

          {/* 4 Soft Blue Contact Cards (Screenshot 5) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Phone */}
            <div className="bg-[#eef5fa] dark:bg-slate-900 border border-[#d8e8f3] dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 text-[#1b4d79] dark:text-sky-400 flex items-center justify-center shadow-sm mb-4">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Phone</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                  (329) 580-7077<br />
                  (650) 382-5020
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="bg-[#eef5fa] dark:bg-slate-900 border border-[#d8e8f3] dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 text-[#1b4d79] dark:text-sky-400 flex items-center justify-center shadow-sm mb-4">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Email</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                  warden@hostel.edu<br />
                  contact@hosteller.org
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="bg-[#eef5fa] dark:bg-slate-900 border border-[#d8e8f3] dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 text-[#1b4d79] dark:text-sky-400 flex items-center justify-center shadow-sm mb-4">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Location</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  54826 Fadel Circles<br />
                  Darrylstad, AZ 90995
                </p>
              </div>
            </div>

            {/* Working Time */}
            <div className="bg-[#eef5fa] dark:bg-slate-900 border border-[#d8e8f3] dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 text-[#1b4d79] dark:text-sky-400 flex items-center justify-center shadow-sm mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Working Time</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Everyday<br />
                  <span className="font-mono">10 am — 20 pm</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Bottom-Right Quick Action Button (Screenshots 1-4) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={onOpenPortal}
          title="Resident & Warden Portal Quick Access"
          className="w-12 h-12 rounded-full bg-[#1b4d79] hover:bg-[#14395a] text-white shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1b4d79]/50"
        >
          <LogIn className="w-5 h-5" />
        </button>
      </div>

      {/* Check-In / Search Availability Results Modal */}
      <CheckInSearchResultsModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        checkInDate={checkIn}
        checkOutDate={checkOut}
        guestsCount={guests}
        availableRooms={availableRoomsResult}
        user={currentUser || null}
        onOpenAuthForBooking={(_roomId, _inDate, _outDate) => {
          setIsSearchModalOpen(false);
          onOpenPortal();
        }}
        onBookingSuccess={() => {
          if (onRefreshData) onRefreshData();
          onOpenPortal();
        }}
      />
    </div>
  );
};
