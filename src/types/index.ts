export type Role = 'admin' | 'student';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: Role;
}

export interface Occupant {
  _id: string;
  name: string;
  email: string;
}

export interface Room {
  _id: string;
  number: string;
  occupants: Occupant[];
  capacity?: number;
  occupantCount?: number;
  availableBeds?: number;
  isFull?: boolean;
  createdAt?: string;
}

export interface StudentWithRoom {
  _id: string;
  name: string;
  email: string;
  role: Role;
  room: {
    _id: string;
    number: string;
  } | null;
}

export interface Complaint {
  _id: string;
  text: string;
  status: 'Pending' | 'Resolved';
  createdAt: string;
  updatedAt?: string;
  student?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  room?: {
    _id: string;
    number: string;
  } | null;
}

export interface StayRecord {
  _id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  roomId: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guestsCount: number;
  status: 'Checked In' | 'Checked Out' | 'Reserved';
  createdAt: string;
  checkedOutAt?: string;
}

export interface StudentRoomDetails {
  room: {
    _id: string;
    number: string;
    occupants: Occupant[];
    roommates: Occupant[];
  } | null;
  stay?: StayRecord | null;
}
