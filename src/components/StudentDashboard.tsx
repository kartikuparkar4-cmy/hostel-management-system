import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StudentRoomDetails, Complaint, StayRecord, Room } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  DoorClosed,
  Users,
  AlertCircle,
  CheckCircle2,
  Send,
  Clock,
  Bed,
  HelpCircle,
  MessageSquare,
  Calendar,
  LogOut,
  Sparkles,
  ArrowRight,
  History,
  Check,
} from 'lucide-react';

interface StudentDashboardProps {
  refreshTrigger?: number;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ refreshTrigger }) => {
  const { user } = useAuth();

  const [roomData, setRoomData] = useState<StudentRoomDetails['room']>(null);
  const [stayData, setStayData] = useState<StayRecord | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stayHistory, setStayHistory] = useState<StayRecord[]>([]);
  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Self Check-In Form State (for unassigned students)
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [checkInDate, setCheckInDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState(() =>
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [guestsCount, setGuestsCount] = useState(1);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInError, setCheckInError] = useState<string | null>(null);
  const [checkInSuccess, setCheckInSuccess] = useState<string | null>(null);

  // Check-out state
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkOutSuccess, setCheckOutSuccess] = useState<string | null>(null);
  const [checkOutError, setCheckOutError] = useState<string | null>(null);
  const [showCheckOutConfirm, setShowCheckOutConfirm] = useState(false);

  // Complaint submission form state
  const [complaintText, setComplaintText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Calculate nights
  const startMs = new Date(checkInDate).getTime();
  const endMs = new Date(checkOutDate).getTime();
  const calculatedNights = Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) || 14);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const [roomRes, complaintsRes, staysRes, roomsRes] = await Promise.all([
        api.getMyRoom(),
        api.getMyComplaints(),
        api.getMyStays().catch(() => ({ stays: [] })),
        api.getPublicRooms().catch(() => ({ rooms: [] })),
      ]);

      setRoomData(roomRes?.room || null);
      setStayData((roomRes as any)?.stay || null);
      setComplaints(complaintsRes?.complaints || []);
      setStayHistory(staysRes?.stays || []);
      setPublicRooms(roomsRes?.rooms || []);
    } catch (err: any) {
      setLoadError(err.message || 'Unable to retrieve student room allocation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [refreshTrigger]);

  // Handle Self Check-In
  const handleSelfCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckInError(null);
    setCheckInSuccess(null);

    if (!selectedRoomId) {
      setCheckInError('Please select a room to check into.');
      return;
    }

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      setCheckInError('Check-out date must be after check-in date.');
      return;
    }

    setCheckingIn(true);
    try {
      const res = await api.studentCheckIn({
        roomId: selectedRoomId,
        checkInDate,
        checkOutDate,
        guestsCount,
      });

      setCheckInSuccess(res.message || 'Check-in successful! Welcome to your room.');
      setSelectedRoomId('');
      await fetchStudentData();
    } catch (err: any) {
      setCheckInError(err.message || 'Failed to complete check-in');
    } finally {
      setCheckingIn(false);
    }
  };

  // Quick preset helper for check-out date
  const setCheckOutPreset = (days: number) => {
    const start = checkInDate ? new Date(checkInDate) : new Date();
    const newEnd = new Date(start.getTime() + days * 86400000);
    setCheckOutDate(newEnd.toISOString().split('T')[0]);
  };

  // Handle Check-Out
  const handleCheckOut = async () => {
    setCheckingOut(true);
    setCheckOutError(null);
    setCheckOutSuccess(null);
    try {
      const res = await api.studentCheckOut();
      setCheckOutSuccess(res.message || 'Successfully checked out! Your bed has been vacated.');
      setShowCheckOutConfirm(false);
      setRoomData(null);
      setStayData(null);
      await fetchStudentData();
    } catch (err: any) {
      setCheckOutError(err.message || 'Failed to complete check-out');
    } finally {
      setCheckingOut(false);
    }
  };

  // Handle Complaint Submission
  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    const trimmed = complaintText.trim();
    if (!trimmed) {
      setSubmitError('Complaint text cannot be empty.');
      return;
    }

    if (!roomData) {
      setSubmitError('Cannot file a complaint without an assigned room.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.submitComplaint(trimmed);
      setSubmitSuccess('Your complaint has been submitted to the warden office.');
      setComplaintText('');
      setComplaints((prev) => [res.complaint, ...prev]);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasRoom = !!roomData;
  const roommates = roomData?.roommates || [];
  const availableRoomsForCheckIn = publicRooms.filter((r) => (r.occupantCount || 0) < 2);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Resident Portal
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Welcome, <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name}</span>. Manage your hostel room allocation, check-in, check-out, and maintenance tickets.
          </p>
        </div>

        {hasRoom ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Checked In: Room {roomData.number}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Not Checked In
            </span>
          </div>
        )}
      </div>

      {loadError && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button
            onClick={fetchStudentData}
            className="px-3 py-1 bg-amber-200/60 hover:bg-amber-200 dark:bg-amber-900 dark:hover:bg-amber-800 rounded font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {checkOutSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{checkOutSuccess}</span>
        </div>
      )}

      {checkOutError && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{checkOutError}</span>
        </div>
      )}

      {checkInSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{checkInSuccess}</span>
        </div>
      )}

      {/* ========================================================
          1. ACTIVE ROOM & STAY CARD (When Checked In)
          ======================================================== */}
      {hasRoom && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <DoorClosed className="w-5 h-5 text-[#1b4d79] dark:text-sky-400" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Assigned Room & Stay Details
              </h2>
            </div>
            <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/50">
              Active Resident
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Room Number Card */}
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                Assigned Room Number
              </span>
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
                Room {roomData.number}
              </span>
              <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                <span>Capacity: 2 students max (1 bed per student)</span>
              </div>
            </div>

            {/* Roommates Card */}
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                Roommate Details
              </span>
              {roommates.length === 0 ? (
                <div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    No roommate assigned yet
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    The second bed in Room {roomData.number} is currently vacant.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {roommates.map((rm) => (
                    <div key={rm._id} className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#1b4d79] dark:text-sky-400" />
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {rm.name}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">({rm.email})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active Check-In & Check-Out Stay Control Bar */}
          <div className="bg-[#0b192c] text-white p-5 rounded-xl border border-slate-800 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                      Stay & Occupancy Status
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      {stayData?.status || 'Checked In'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1.5">
                    <span>
                      Check-In: <strong className="text-white font-mono">{stayData?.checkInDate || 'Active'}</strong>
                    </span>
                    <span className="text-slate-500">·</span>
                    <span>
                      Check-Out: <strong className="text-white font-mono">{stayData?.checkOutDate || 'Semester End'}</strong>
                    </span>
                    {stayData?.nights && (
                      <>
                        <span className="text-slate-500">·</span>
                        <span className="text-sky-300 font-mono font-semibold">({stayData.nights} nights)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Check-Out / Vacate Action Button */}
              <div className="self-end sm:self-center">
                {!showCheckOutConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowCheckOutConfirm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 rounded-lg transition-colors shadow-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Check Out / Vacate Bed</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-700">
                    <span className="text-xs text-slate-200">Confirm Check-Out?</span>
                    <button
                      type="button"
                      onClick={handleCheckOut}
                      disabled={checkingOut}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors disabled:opacity-50"
                    >
                      {checkingOut ? 'Checking out...' : 'Yes, Vacate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCheckOutConfirm(false)}
                      className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bed Slots Visualizer */}
          <div className="pt-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-2">
              Room Bed Slots (Max 2):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <Bed className="w-5 h-5 text-[#1b4d79] dark:text-sky-400" />
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Bed 1 (Your Bed)</span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    {user?.name} (You)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <Bed className="w-5 h-5 text-[#1b4d79] dark:text-sky-400" />
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Bed 2</span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    {roommates[0]?.name || 'Vacant / Available for allocation'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          2. SELF CHECK-IN & ROOM SELECTION (When NOT Checked In)
          ======================================================== */}
      {!hasRoom && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#1b4d79] dark:text-sky-400" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Hostel Check-In & Room Selection
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              You are currently not checked in to any room. Choose an available room, specify your stay dates, and complete check-in.
            </p>
          </div>

          {checkInError && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span>{checkInError}</span>
            </div>
          )}

          <form onSubmit={handleSelfCheckIn} className="space-y-6">
            {/* Room Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                Select an Available Hostel Room <span className="text-rose-500">*</span>
              </label>

              {availableRoomsForCheckIn.length === 0 ? (
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
                  No rooms are currently available. All rooms have reached maximum capacity (2 residents). Please contact the warden.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {availableRoomsForCheckIn.map((r) => {
                    const occ = r.occupantCount || (r.occupants || []).length;
                    const freeBeds = Math.max(0, 2 - occ);
                    const isSelected = selectedRoomId === r._id;

                    return (
                      <button
                        key={r._id}
                        type="button"
                        onClick={() => setSelectedRoomId(r._id)}
                        className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#1b4d79] bg-sky-50/70 dark:bg-sky-950/40 ring-2 ring-[#1b4d79] dark:ring-sky-500'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                              Room {r.number}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                freeBeds === 2
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}
                            >
                              {freeBeds === 2 ? '2 Beds Open' : '1 Bed Open'}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 mt-1 block">
                            {freeBeds === 2 ? 'Empty room (Choice of beds)' : '1 roommate currently present'}
                          </span>
                        </div>

                        {isSelected && (
                          <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-[#1b4d79] dark:text-sky-400">
                            <Check className="w-3.5 h-3.5" />
                            <span>Selected</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Stay Dates: Check-In & Check-Out */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Check-In Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1b4d79]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Check-Out Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1b4d79]"
                  />
                </div>
              </div>
            </div>

            {/* Quick Stay Presets & Duration Summary */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">Quick presets:</span>
                <button
                  type="button"
                  onClick={() => setCheckOutPreset(7)}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  1 Week
                </button>
                <button
                  type="button"
                  onClick={() => setCheckOutPreset(14)}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  2 Weeks
                </button>
                <button
                  type="button"
                  onClick={() => setCheckOutPreset(30)}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  1 Month
                </button>
                <button
                  type="button"
                  onClick={() => setCheckOutPreset(90)}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  Semester (90d)
                </button>
              </div>

              <div className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                Duration: <strong className="text-[#1b4d79] dark:text-sky-400">{calculatedNights} nights</strong>
              </div>
            </div>

            {/* Submit Check-In Button */}
            <button
              type="submit"
              disabled={checkingIn || !selectedRoomId || availableRoomsForCheckIn.length === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-xs font-bold text-white bg-[#1b4d79] hover:bg-[#14395a] active:bg-[#0f2c46] shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#1b4d79] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{checkingIn ? 'Completing Check-In...' : 'Complete Check-In & Get Bed'}</span>
            </button>
          </form>
        </div>
      )}

      {/* ========================================================
          3. MY STAY HISTORY (Check-In & Check-Out Records)
          ======================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-[#1b4d79] dark:text-sky-400" />
              My Stay Records (Check-In / Check-Out Log)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Complete history of your room stays and departure timestamps.
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
            {stayHistory.length} {stayHistory.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {stayHistory.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
            No previous stay records found. Once you check into a room, your stay record will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 px-4 font-medium">Room</th>
                  <th className="py-2.5 px-4 font-medium">Check-In Date</th>
                  <th className="py-2.5 px-4 font-medium">Check-Out Date</th>
                  <th className="py-2.5 px-4 font-medium">Nights</th>
                  <th className="py-2.5 px-4 font-medium">Status</th>
                  <th className="py-2.5 px-4 text-right font-medium">Action / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {stayHistory.map((s) => {
                  const isCurrent = s.status === 'Checked In';
                  return (
                    <tr key={s._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        Room {s.roomNumber}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {s.checkInDate}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {s.checkOutDate}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {s.nights} nights
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-medium rounded-md ${
                            isCurrent
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCurrent ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isCurrent ? (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            Current Stay
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Completed & Vacated
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================
          4. MAINTENANCE COMPLAINTS FORM & LIST
          ======================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-5 h-5 text-[#1b4d79] dark:text-sky-400" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Report Maintenance Issue
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
          Submit maintenance complaints regarding electrical fixtures, plumbing, furniture, or cleaning in your assigned room.
        </p>

        {submitError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <span>{submitError}</span>
          </div>
        )}

        {submitSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <span>{submitSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSubmitComplaint} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Complaint description
            </label>
            <textarea
              rows={3}
              required
              disabled={!hasRoom || submitting}
              placeholder={
                hasRoom
                  ? 'Describe the issue (e.g. Bathroom faucet leaking, study table light switch damaged)...'
                  : 'Complaint submission is disabled because you have not checked into a room yet.'
              }
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1b4d79] disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-900/40"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {hasRoom
                ? `Reporting for Room ${roomData.number}`
                : 'Check into a room to lodge maintenance tickets'}
            </span>
            <button
              type="submit"
              disabled={!hasRoom || submitting || !complaintText.trim()}
              className="inline-flex items-center justify-center gap-1.5 py-2 px-4 text-xs font-semibold text-white bg-[#1b4d79] hover:bg-[#14395a] active:bg-[#0f2c46] rounded-lg shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4d79] disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Submit complaint'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* My Complaints List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#1b4d79] dark:text-sky-400" />
              My Complaints History
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Status tracking for all tickets submitted by you.
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
            {complaints.length} filed
          </span>
        </div>

        {complaints.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
            <CheckCircle2 className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              No complaints filed yet.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Use the form above if your room requires any maintenance repairs.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map((c) => {
              const isResolved = c.status === 'Resolved';
              const dateStr = c.createdAt
                ? new Date(c.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'N/A';

              return (
                <div
                  key={c._id}
                  className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-slate-900 dark:text-white font-mono">
                        Room {c.room?.number || (roomData ? roomData.number : '—')}
                      </span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="text-slate-500 font-mono text-[11px] tabular-nums">{dateStr}</span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-medium rounded-md ${
                        isResolved
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isResolved ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      {c.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {c.text}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
