import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Room } from '../types';
import { PieChart as PieChartIcon, BarChart3, DoorOpen, DoorClosed, AlertCircle } from 'lucide-react';

interface RoomOccupancyChartProps {
  rooms: Room[];
}

export const RoomOccupancyChart: React.FC<RoomOccupancyChartProps> = ({ rooms }) => {
  const totalRooms = rooms.length;

  // Classify rooms
  const emptyRooms = rooms.filter((r) => !r.occupants || r.occupants.length === 0);
  const occupiedRooms = rooms.filter((r) => r.occupants && r.occupants.length > 0);
  const partiallyOccupied = rooms.filter((r) => r.occupants && r.occupants.length === 1);
  const fullyOccupied = rooms.filter((r) => r.occupants && r.occupants.length === 2);

  const totalBeds = totalRooms * 2;
  const occupiedBeds = rooms.reduce((acc, r) => acc + (r.occupants ? r.occupants.length : 0), 0);
  const emptyBeds = totalBeds - occupiedBeds;

  const occupancyRatio = totalRooms > 0 ? Math.round((occupiedRooms.length / totalRooms) * 100) : 0;
  const bedOccupancyRatio = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // Ratio Pie Data: Empty vs Occupied
  const ratioPieData = [
    {
      name: 'Occupied Rooms',
      value: occupiedRooms.length,
      color: '#1b4d79', // Hosteller deep navy
    },
    {
      name: 'Empty Rooms',
      value: emptyRooms.length,
      color: '#94a3b8', // slate-400
    },
  ];

  // Detailed breakdown: Full vs Partial vs Empty
  const breakdownPieData = [
    {
      name: 'Fully Occupied (2/2)',
      value: fullyOccupied.length,
      color: '#10b981', // emerald-500
    },
    {
      name: 'Partially Occupied (1/2)',
      value: partiallyOccupied.length,
      color: '#f59e0b', // amber-500
    },
    {
      name: 'Completely Empty (0/2)',
      value: emptyRooms.length,
      color: '#94a3b8', // slate-400
    },
  ].filter((item) => item.value > 0);

  // Bar Chart Data: Room-by-room occupancy
  const barChartData = rooms.map((r) => ({
    room: `Rm ${r.number}`,
    occupants: r.occupants ? r.occupants.length : 0,
    status:
      !r.occupants || r.occupants.length === 0
        ? 'Empty'
        : r.occupants.length === 1
        ? 'Partial (1/2)'
        : 'Full (2/2)',
  }));

  if (totalRooms === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <PieChartIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Room Occupancy Analytics
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          No rooms have been added yet. Add rooms above to visualize occupancy ratios.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Room Occupancy & Ratio Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visual ratio analysis of empty rooms versus occupied rooms and bed capacity utilization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium font-mono bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
            {occupancyRatio}% Rooms Occupied
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
            {bedOccupancyRatio}% Beds Filled
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Occupied Rooms</span>
            <DoorClosed className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
            {occupiedRooms.length}
            <span className="text-xs font-normal text-slate-400 ml-1">/ {totalRooms}</span>
          </div>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
            {occupancyRatio}% of rooms
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Empty Rooms</span>
            <DoorOpen className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
            {emptyRooms.length}
            <span className="text-xs font-normal text-slate-400 ml-1">/ {totalRooms}</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            {totalRooms > 0 ? Math.round((emptyRooms.length / totalRooms) * 100) : 0}% vacant
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Fully Occupied (2/2)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {fullyOccupied.length}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-0.5">
            No empty beds
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Partially Occupied (1/2)</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {partiallyOccupied.length}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-0.5">
            1 vacant bed available
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Chart 1: Donut Ratio of Empty vs Occupied */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Empty vs Occupied Ratio
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Total {totalRooms} rooms</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ratioPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={88}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name ? name.split(' ')[0] : ''}: ${((percent || 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {ratioPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.92)',
                    borderColor: 'rgba(51, 65, 85, 0.5)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any, name: any) => [`${val} rooms (${totalRooms > 0 ? Math.round((Number(val) / totalRooms) * 100) : 0}%)`, name]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
            Ratio:{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
              {occupiedRooms.length} Occupied
            </span>{' '}
            :{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
              {emptyRooms.length} Empty
            </span>{' '}
            ({totalRooms > 0 ? (occupiedRooms.length / totalRooms).toFixed(2) : 0} :{' '}
            {totalRooms > 0 ? (emptyRooms.length / totalRooms).toFixed(2) : 0})
          </div>
        </div>

        {/* Chart 2: Room by Room Occupancy Bar Chart */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
              Per-Room Bed Allocation (Max 2)
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Capacity: 2 beds/room</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  dataKey="room"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  domain={[0, 2]}
                  ticks={[0, 1, 2]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.92)',
                    borderColor: 'rgba(51, 65, 85, 0.5)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '12px',
                  }}
                  formatter={(value: any, _name: any, item: any) => [
                    `${value} / 2 beds (${item?.payload?.status || ''})`,
                    'Occupants',
                  ]}
                />
                <Bar dataKey="occupants" radius={[4, 4, 0, 0]}>
                  {barChartData.map((entry, index) => {
                    const barColor =
                      entry.occupants === 2
                        ? '#10b981' // emerald-500
                        : entry.occupants === 1
                        ? '#f59e0b' // amber-500
                        : '#94a3b8'; // slate-400
                    return <Cell key={`bar-${index}`} fill={barColor} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              Full (2/2)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
              Partial (1/2)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-400" />
              Empty (0/2)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
