import React, { useState } from 'react';
import { Room, User } from '../types';
import { api } from '../services/api';
import {
  Calendar,
  Users,
  Check,
  DoorClosed,
  Bed,
  Sparkles,
  X,
  ArrowRight,
  ShieldCheck,
  Tag,
  Clock,
} from 'lucide-react';

interface CheckInSearchResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: string;
  availableRooms: Room[];
  user: User | null;
  onOpenAuthForBooking: (roomId: string, checkInDate: string, checkOutDate: string) => void;
  onBookingSuccess: () => void;
}

export const CheckInSearchResultsModal: React.FC<CheckInSearchResultsModalProps> = ({
  isOpen,
  onClose,
  checkInDate,
  checkOutDate,
  guestsCount,
  availableRooms,
  user,
  onOpenAuthForBooking,
  onBookingSuccess,
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    availableRooms.length > 0 ? availableRooms[0]._id : ''
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate nights
  const start = new Date(checkInDate).getTime();
  const end = new Date(checkOutDate).getTime();
  const nights = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) || 7);

  // Pricing calculation
  const baseNightlyRate = 24; // $24 standard rate
  let discountPercent = 0;
  if (nights >= 14) {
    discountPercent = 30; // 30% discount for 14+ nights
  } else if (nights >= 7) {
    discountPercent = 20; // 20% discount for 7-13 nights
  }

  const discountAmount = Math.round((baseNightlyRate * nights * discountPercent) / 100);
  const totalAmount = baseNightlyRate * nights - discountAmount;

  const handleConfirmCheckIn = async (roomId: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    // If not logged in or admin, route to auth modal
    if (!user) {
      onOpenAuthForBooking(roomId, checkInDate, checkOutDate);
      return;
    }

    if (user.role === 'admin') {
      setErrorMsg('Admins manage resident check-ins via the Warden Management Console.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.studentCheckIn({
        roomId,
        checkInDate,
        checkOutDate,
        guestsCount: guestsCount === '2 residents' ? 2 : 1,
      });

      setSuccessMsg(res.message || 'Check-in completed successfully!');
      setTimeout(() => {
        onBookingSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete check-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 animate-fadeIn">
        {/* Modal Header */}
        <div className="bg-[#0b192c] text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Available Rooms for Check-In</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Select Your Hostel Room
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stay Summary Bar */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 border-b border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">CHECK-IN</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
              {checkInDate}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">CHECK-OUT</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
              {checkOutDate}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">DURATION</span>
            <span className="font-semibold text-[#1b4d79] dark:text-sky-400 font-mono">
              {nights} nights
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">GUESTS / BED</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {guestsCount}
            </span>
          </div>
        </div>

        {/* Long-Stay Discount Banner */}
        {discountPercent > 0 && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-900/50 px-5 py-2.5 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center gap-1.5 font-medium">
              <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>
                <strong>Stay Longer, Save More:</strong> {discountPercent}% discount automatically applied for stays of {nights} nights!
              </span>
            </div>
            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
              -${discountAmount}
            </span>
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300">
              {successMsg}
            </div>
          )}

          {/* Rooms List */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Available Rooms ({availableRooms.length})
            </h3>

            {availableRooms.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6">
                <DoorClosed className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500">
                  No rooms have available vacancy for the requested bed capacity. All beds are currently occupied.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableRooms.map((room) => {
                  const occupantsCount = room.occupants ? room.occupants.length : 0;
                  const availableBeds = 2 - occupantsCount;
                  const isSelected = selectedRoomId === room._id;

                  return (
                    <div
                      key={room._id}
                      onClick={() => setSelectedRoomId(room._id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-[#1b4d79] bg-[#e8f1f8]/50 dark:bg-slate-800/80 shadow-sm ring-1 ring-[#1b4d79]'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#1b4d79] text-white flex items-center justify-center font-bold text-sm shrink-0">
                          {room.number}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              Room {room.number}
                            </span>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              {availableBeds} bed{availableBeds > 1 ? 's' : ''} available
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Double Resident Dorm · Maximum 2 Students · Ensuite Study Desk
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-900 dark:text-white font-mono block">
                            ${totalAmount} <span className="text-[11px] font-normal text-slate-400">total</span>
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            ${Math.round(totalAmount / nights)}/night
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConfirmCheckIn(room._id);
                          }}
                          disabled={loading}
                          className="px-4 py-2 text-xs font-semibold text-white bg-[#1b4d79] hover:bg-[#14395a] rounded-lg transition-colors shadow-sm disabled:opacity-50"
                        >
                          {user ? 'Confirm Check-In' : 'Sign in to Check-In'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pricing & Terms */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Standard nightly rate:</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">${baseNightlyRate} / night</span>
            </div>
            <div className="flex justify-between">
              <span>Stay length:</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">{nights} nights</span>
            </div>
            {discountPercent > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Long stay discount ({discountPercent}%):</span>
                <span className="font-mono">-${discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white text-sm">
              <span>Estimated Total:</span>
              <span className="font-mono">${totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Strict 2-Student Maximum Capacity Enforced
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
