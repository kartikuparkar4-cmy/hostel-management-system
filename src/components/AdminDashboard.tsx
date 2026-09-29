import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Room, StudentWithRoom, Complaint, StayRecord } from '../types';
import { RoomOccupancyChart } from './RoomOccupancyChart';
import {
  DoorClosed,
  UserPlus,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  RotateCcw,
  Bed,
  Plus,
  Sparkles,
  Calendar,
  LogOut,
  ArrowRight,
  Search,
} from 'lucide-react';

interface AdminDashboardProps {
  refreshTrigger?: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ refreshTrigger }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<StudentWithRoom[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stays, setStays] = useState<StayRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Room form state
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [roomActionLoading, setRoomActionLoading] = useState(false);
  const [roomSuccessMsg, setRoomSuccessMsg] = useState<string | null>(null);
  const [roomErrorMsg, setRoomErrorMsg] = useState<string | null>(null);

  // Allocate & Check-In Student form state
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [allocCheckInDate, setAllocCheckInDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [allocCheckOutDate, setAllocCheckOutDate] = useState(() => new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [allocActionLoading, setAllocActionLoading] = useState(false);
  const [allocSuccessMsg, setAllocSuccessMsg] = useState<string | null>(null);
  const [allocErrorMsg, setAllocErrorMsg] = useState<string | null>(null);

  // Check-Out loading & feedback states
  const [checkingOutStudentId, setCheckingOutStudentId] = useState<string | null>(null);
  const [stayActionMsg, setStayActionMsg] = useState<{ id: string; message: string; isError?: boolean } | null>(null);

  // Roster filtering and search
  const [rosterFilter, setRosterFilter] = useState<'all' | 'Checked In' | 'Checked Out'>('all');
  const [rosterSearch, setRosterSearch] = useState('');

  const handleQuickCheckIn = (studentId?: string, roomId?: string) => {
    if (studentId) setSelectedStudentId(studentId);
    if (roomId) setSelectedRoomId(roomId);
    const elem = document.getElementById('allocation-checkin-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Complaint toggle loading states
  const [togglingComplaintId, setTogglingComplaintId] = useState<string | null>(null);
  const [complaintFeedback, setComplaintFeedback] = useState<{ id: string; message: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomsRes, studentsRes, complaintsRes, staysRes] = await Promise.all([
        api.getRooms(),
        api.getStudents(),
        api.getAllComplaints(),
        api.getAllStays(),
      ]);
      setRooms(roomsRes.rooms);
      setStudents(studentsRes.students);
      setComplaints(complaintsRes.complaints);
      setStays(staysRes?.stays || []);
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  // Handle Add Room
  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoomErrorMsg(null);
    setRoomSuccessMsg(null);

    const trimmed = newRoomNumber.trim();
    if (!trimmed) {
      setRoomErrorMsg('Please provide a room number.');
      return;
    }

    setRoomActionLoading(true);
    try {
      const res = await api.addRoom(trimmed);
      setRoomSuccessMsg(`Room ${res.room.number} created successfully.`);
      setNewRoomNumber('');
      await fetchData();
    } catch (err: any) {
      setRoomErrorMsg(err.message || 'Failed to create room.');
    } finally {
      setRoomActionLoading(false);
    }
  };

  // Handle Allocate & Check-In Student
  const handleAllocateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAllocErrorMsg(null);
    setAllocSuccessMsg(null);

    if (!selectedStudentId || !selectedRoomId) {
      setAllocErrorMsg('Please select both a student and a room with space.');
      return;
    }

    setAllocActionLoading(true);
    try {
      const res = await api.adminCheckIn({
        roomId: selectedRoomId,
        studentId: selectedStudentId,
        checkInDate: allocCheckInDate,
        checkOutDate: allocCheckOutDate,
      });
      setAllocSuccessMsg(res.message || 'Student checked in and allocated successfully.');
      setSelectedStudentId('');
      setSelectedRoomId('');
      await fetchData();
    } catch (err: any) {
      setAllocErrorMsg(err.message || 'Failed to allocate student to room.');
    } finally {
      setAllocActionLoading(false);
    }
  };

  // Handle Admin Check-Out
  const handleAdminCheckOut = async (studentId: string, studentName: string) => {
    setCheckingOutStudentId(studentId);
    setStayActionMsg(null);
    try {
      const res = await api.adminCheckOut(studentId);
      setStayActionMsg({
        id: studentId,
        message: res.message || `Checked out ${studentName} successfully. Bed vacated.`,
      });
      await fetchData();
    } catch (err: any) {
      setStayActionMsg({
        id: studentId,
        message: err.message || 'Failed to check out resident.',
        isError: true,
      });
    } finally {
      setCheckingOutStudentId(null);
    }
  };

  // Handle Toggle Complaint Resolution
  const handleToggleComplaint = async (complaintId: string) => {
    setTogglingComplaintId(complaintId);
    setComplaintFeedback(null);
    try {
      const res = await api.toggleComplaintStatus(complaintId);
      setComplaintFeedback({
        id: complaintId,
        message: `Status updated to ${res.complaint.status}`,
      });
      // Update local complaints state
      setComplaints((prev) =>
        prev.map((c) => (c._id === complaintId ? { ...c, status: res.complaint.status } : c))
      );
    } catch (err: any) {
      setComplaintFeedback({
        id: complaintId,
        message: err.message || 'Failed to update complaint status',
      });
    } finally {
      setTogglingComplaintId(null);
    }
  };

  // Filter students without a room for the allocation dropdown
  const unassignedStudents = students.filter((s) => !s.room);

  // Filter rooms that still have space (occupants length < 2)
  const availableRooms = rooms.filter((r) => (r.occupants?.length || 0) < 2);

  // Quick stats
  const totalBeds = rooms.length * 2;
  const occupiedBeds = rooms.reduce((acc, r) => acc + (r.occupants?.length || 0), 0);
  const pendingComplaintsCount = complaints.filter((c) => c.status === 'Pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Warden Management Console
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Control room inventories, allocate residents with strict 2-bed capacity enforcement, and resolve maintenance tickets.
          </p>
        </div>

        {/* Metric summary text */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-900 dark:text-white tabular-nums font-mono">{rooms.length}</span>
            <span>Rooms</span>
          </div>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-900 dark:text-white tabular-nums font-mono">{occupiedBeds} / {totalBeds}</span>
            <span>Beds Occupied</span>
          </div>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-amber-600 dark:text-amber-400 tabular-nums font-mono">{pendingComplaintsCount}</span>
            <span>Pending Tickets</span>
          </div>
        </div>
      </div>

      {/* Data Visualization Section: Empty vs Occupied Room Ratio */}
      <RoomOccupancyChart rooms={rooms} />

      {/* Forms Grid: Add Room & Allocate Student */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Add Room Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <DoorClosed className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Add Hostel Room
            </h2>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
            Create a unique hostel room. Every room has a standard maximum capacity of two resident beds.
          </p>

          {roomErrorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span>{roomErrorMsg}</span>
            </div>
          )}

          {roomSuccessMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <span>{roomSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleAddRoom} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Room number
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 104, 201-B"
                value={newRoomNumber}
                onChange={(e) => setNewRoomNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={roomActionLoading}
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{roomActionLoading ? 'Creating room...' : 'Create room'}</span>
            </button>
          </form>
        </div>

        {/* 2. Allocate Student Card */}
        <div id="allocation-checkin-section" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Allocate & Check In Resident
            </h2>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
            Assign an unallocated student to an available room bed. Simultaneous updates are protected with atomic locks.
          </p>

          {allocErrorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span>{allocErrorMsg}</span>
            </div>
          )}

          {allocSuccessMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <span>{allocSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleAllocateStudent} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Select student without room
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <option value="">-- Choose student ({unassignedStudents.length} available) --</option>
                {unassignedStudents.map((st) => (
                  <option key={st._id} value={st._id}>
                    {st.name} ({st.email})
                  </option>
                ))}
              </select>
              {unassignedStudents.length === 0 && (
                <p className="mt-1 text-[11px] text-slate-400">All registered students currently have assigned rooms.</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Select room with space
              </label>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <option value="">-- Choose room ({availableRooms.length} available) --</option>
                {availableRooms.map((rm) => (
                  <option key={rm._id} value={rm._id}>
                    Room {rm.number} ({(rm.occupants || []).length}/2)
                  </option>
                ))}
              </select>
              {availableRooms.length === 0 && (
                <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
                  No rooms have available beds. Please create a new room above.
                </p>
              )}
            </div>

            {/* Check-In and Check-Out Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={allocCheckInDate}
                  onChange={(e) => setAllocCheckInDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4d79]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Expected Check-out
                </label>
                <input
                  type="date"
                  value={allocCheckOutDate}
                  onChange={(e) => setAllocCheckOutDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4d79]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={allocActionLoading || unassignedStudents.length === 0 || availableRooms.length === 0}
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{allocActionLoading ? 'Checking in student...' : 'Confirm Allocation & Check-In'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* 3. Rooms Overview Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <DoorClosed className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Rooms Overview
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Current inventory showing occupancy (x/2) and both designated bed slots.
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
            {rooms.length} total {rooms.length === 1 ? 'room' : 'rooms'}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading hostel rooms...</div>
        ) : rooms.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
            <DoorClosed className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No rooms yet.</p>
            <p className="text-xs text-slate-500 mt-1">Add the first room using the form above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => {
              const occupants = room.occupants || [];
              const occCount = occupants.length;
              const isFull = occCount >= 2;
              const bed1 = occupants[0];
              const bed2 = occupants[1];

              return (
                <div
                  key={room._id}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                >
                  {/* Room Header */}
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      Room {room.number}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          isFull
                            ? 'bg-rose-500'
                            : occCount === 1
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                      <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300 font-medium">
                        {occCount}/2
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        {isFull ? 'Full' : occCount === 1 ? '1 Space' : 'Vacant'}
                      </span>
                    </div>
                  </div>

                  {/* Two Bed Slots */}
                  <div className="space-y-2 text-xs">
                    {/* Bed Slot 1 */}
                    <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                      <div className="flex items-center gap-2 truncate">
                        <Bed className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-400 text-[11px]">Bed 1:</span>
                        <span
                          className={`font-medium truncate ${
                            bed1 ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 italic'
                          }`}
                        >
                          {bed1 ? bed1.name : 'Empty bed'}
                        </span>
                      </div>
                      {bed1 ? (
                        <button
                          type="button"
                          title={`Check out ${bed1.name}`}
                          onClick={() => handleAdminCheckOut(bed1._id, bed1.name)}
                          disabled={checkingOutStudentId === bed1._id}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded border border-rose-200 dark:border-rose-900 transition-colors shrink-0 disabled:opacity-50"
                        >
                          <LogOut className="w-2.5 h-2.5" />
                          <span>{checkingOutStudentId === bed1._id ? '...' : 'Check out'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleQuickCheckIn(undefined, room._id)}
                          className="text-[10px] font-semibold text-[#1b4d79] dark:text-sky-400 hover:underline shrink-0"
                        >
                          + Check in
                        </button>
                      )}
                    </div>

                    {/* Bed Slot 2 */}
                    <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                      <div className="flex items-center gap-2 truncate">
                        <Bed className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-400 text-[11px]">Bed 2:</span>
                        <span
                          className={`font-medium truncate ${
                            bed2 ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 italic'
                          }`}
                        >
                          {bed2 ? bed2.name : 'Empty bed'}
                        </span>
                      </div>
                      {bed2 ? (
                        <button
                          type="button"
                          title={`Check out ${bed2.name}`}
                          onClick={() => handleAdminCheckOut(bed2._id, bed2.name)}
                          disabled={checkingOutStudentId === bed2._id}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded border border-rose-200 dark:border-rose-900 transition-colors shrink-0 disabled:opacity-50"
                        >
                          <LogOut className="w-2.5 h-2.5" />
                          <span>{checkingOutStudentId === bed2._id ? '...' : 'Check out'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleQuickCheckIn(undefined, room._id)}
                          className="text-[10px] font-semibold text-[#1b4d79] dark:text-sky-400 hover:underline shrink-0"
                        >
                          + Check in
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Complaints List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Maintenance Complaints
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Student room issue reports. Mark as resolved or toggle back to pending.
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
            {complaints.length} total tickets
          </span>
        </div>

        {complaintFeedback && (
          <div className="mb-4 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 text-xs text-indigo-800 dark:text-indigo-300">
            {complaintFeedback.message}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
            <CheckCircle2 className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No complaints reported.</p>
            <p className="text-xs text-slate-500 mt-1">All rooms and facilities are currently operating normally.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4 font-medium">Resident</th>
                  <th className="py-3 px-4 font-medium">Room</th>
                  <th className="py-3 px-4 font-medium">Issue Description</th>
                  <th className="py-3 px-4 font-medium">Reported Date</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {complaints.map((item) => {
                  const isResolved = item.status === 'Resolved';
                  const dateStr = item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'N/A';

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                        <div>{item.student?.name || 'Resident'}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{item.student?.email}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        Room {item.room?.number || '—'}
                      </td>
                      <td className="py-3 px-4 max-w-xs text-slate-700 dark:text-slate-300 break-words leading-relaxed">
                        {item.text}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px] tabular-nums">
                        {dateStr}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded-md ${
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
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleComplaint(item._id)}
                          disabled={togglingComplaintId === item._id}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 ${
                            isResolved
                              ? 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:ring-slate-500'
                              : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500'
                          }`}
                        >
                          {isResolved ? (
                            <>
                              <RotateCcw className="w-3 h-3" />
                              <span>Reopen</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Mark resolved</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Check-In & Check-Out Management Roster */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#1b4d79] dark:text-sky-400" />
              Resident Check-In & Check-Out Roster
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live tracking of resident arrival and departure dates. Warden can check out residents to vacate their beds.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
              {stays.filter((s) => s.status === 'Checked In').length} Checked In
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
              {stays.filter((s) => s.status === 'Checked Out').length} Checked Out
            </span>
          </div>
        </div>

        {stayActionMsg && (
          <div className={`mb-4 p-3 rounded-lg text-xs flex items-center gap-2 ${
            stayActionMsg.isError
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
          }`}>
            {stayActionMsg.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{stayActionMsg.message}</span>
          </div>
        )}

        {/* Filter Tabs and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setRosterFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                rosterFilter === 'all'
                  ? 'bg-[#1b4d79] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All Records ({stays.length})
            </button>
            <button
              type="button"
              onClick={() => setRosterFilter('Checked In')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                rosterFilter === 'Checked In'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Currently Checked In ({stays.filter((s) => s.status === 'Checked In').length})
            </button>
            <button
              type="button"
              onClick={() => setRosterFilter('Checked Out')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                rosterFilter === 'Checked Out'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Vacated ({stays.filter((s) => s.status === 'Checked Out').length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search resident or room..."
              value={rosterSearch}
              onChange={(e) => setRosterSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1b4d79]"
            />
          </div>
        </div>

        {(() => {
          const filteredStays = stays.filter((stay) => {
            const matchesFilter =
              rosterFilter === 'all'
                ? true
                : rosterFilter === 'Checked In'
                ? stay.status === 'Checked In'
                : stay.status === 'Checked Out';

            if (!matchesFilter) return false;

            if (!rosterSearch.trim()) return true;
            const q = rosterSearch.toLowerCase();
            return (
              (stay.studentName || '').toLowerCase().includes(q) ||
              (stay.studentEmail || '').toLowerCase().includes(q) ||
              (stay.roomNumber || '').toLowerCase().includes(q)
            );
          });

          if (stays.length === 0) {
            return <div className="py-6 text-center text-xs text-slate-400">No check-in stay records found.</div>;
          }

          if (filteredStays.length === 0) {
            return (
              <div className="py-6 text-center text-xs text-slate-400">
                No stay records matching current filter or search query.
              </div>
            );
          }

          return (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 px-4 font-medium">Resident</th>
                    <th className="py-2.5 px-4 font-medium">Room</th>
                    <th className="py-2.5 px-4 font-medium">Check-In</th>
                    <th className="py-2.5 px-4 font-medium">Check-Out</th>
                    <th className="py-2.5 px-4 font-medium">Duration</th>
                    <th className="py-2.5 px-4 font-medium">Status</th>
                    <th className="py-2.5 px-4 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredStays.map((stay) => {
                    const isCheckedIn = stay.status === 'Checked In';
                    return (
                      <tr key={stay._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-4">
                          <span className="font-semibold text-slate-900 dark:text-white block">{stay.studentName}</span>
                          <span className="text-[11px] text-slate-500 font-mono">{stay.studentEmail}</span>
                        </td>
                        <td className="py-2.5 px-4 font-mono font-medium text-slate-900 dark:text-white">
                          Room {stay.roomNumber}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                          {stay.checkInDate}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                          {stay.checkOutDate}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-500">
                          {stay.nights} nights
                        </td>
                        <td className="py-2.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded-md ${
                            isCheckedIn
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isCheckedIn ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {stay.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          {isCheckedIn ? (
                            <button
                              type="button"
                              onClick={() => handleAdminCheckOut(stay.studentId, stay.studentName)}
                              disabled={checkingOutStudentId === stay.studentId}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded border border-rose-200 dark:border-rose-900 transition-colors disabled:opacity-50"
                            >
                              <LogOut className="w-3 h-3" />
                              <span>{checkingOutStudentId === stay.studentId ? 'Checking out...' : 'Check Out'}</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Vacated</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>

      {/* 5. All Students Directory */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Resident Student Roster
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive list of all registered student accounts and their room assignments.
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
            {students.length} students
          </span>
        </div>

        {students.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">No students registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 px-4 font-medium">Name</th>
                  <th className="py-2.5 px-4 font-medium">Email</th>
                  <th className="py-2.5 px-4 font-medium">Assigned Room</th>
                  <th className="py-2.5 px-4 font-medium">Status</th>
                  <th className="py-2.5 px-4 text-right font-medium">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {students.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-white">{st.name}</td>
                    <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">{st.email}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-800 dark:text-slate-200 font-mono">
                      {st.room ? `Room ${st.room.number}` : <span className="text-slate-400 italic">None</span>}
                    </td>
                    <td className="py-2.5 px-4">
                      {st.room ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Assigned</span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">Unallocated</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {st.room ? (
                        <button
                          type="button"
                          onClick={() => handleAdminCheckOut(st._id, st.name)}
                          disabled={checkingOutStudentId === st._id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded border border-rose-200 dark:border-rose-900 transition-colors disabled:opacity-50"
                        >
                          <LogOut className="w-3 h-3" />
                          <span>{checkingOutStudentId === st._id ? 'Checking out...' : 'Check Out'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleQuickCheckIn(st._id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-[#1b4d79] hover:bg-[#14395a] rounded transition-colors"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>Check In</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
