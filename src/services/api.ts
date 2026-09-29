import { Complaint, Room, StudentRoomDetails, StudentWithRoom, User, StayRecord } from '../types';

const TOKEN_KEY = 'hostel_auth_token';
const USER_KEY = 'hostel_auth_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredAuth(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // If expired token (401), clear and notify
    if (response.status === 401 && !endpoint.includes('/login') && !endpoint.includes('/register')) {
      clearStoredAuth();
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    const message = data.error || data.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
    (error as any).status = response.status;
    (error as any).data = data;
    throw error;
  }

  return data as T;
}

export const api = {
  // Auth
  async register(params: {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'student';
    adminCode?: string;
  }): Promise<{ token: string; user: User; message: string }> {
    return request('/api/register', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async login(params: {
    email: string;
    password: string;
    role: 'admin' | 'student';
  }): Promise<{ token: string; user: User; message: string }> {
    return request('/api/login', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async getMe(): Promise<{ user: User }> {
    return request('/api/me');
  },

  // Public
  async getPublicRooms(): Promise<{ rooms: Room[] }> {
    return request('/api/public-rooms');
  },

  async searchAvailability(params: {
    checkIn: string;
    checkOut: string;
    guests: string;
  }): Promise<{
    checkIn: string;
    checkOut: string;
    requestedBeds: number;
    totalAvailableRooms: number;
    rooms: (Room & { availableBeds: number; occupantCount: number })[];
  }> {
    return request('/api/search-availability', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Admin
  async getRooms(): Promise<{ rooms: Room[] }> {
    return request('/api/rooms');
  },

  async addRoom(number: string): Promise<{ room: Room; message: string }> {
    return request('/api/rooms', {
      method: 'POST',
      body: JSON.stringify({ number }),
    });
  },

  async getStudents(): Promise<{ students: StudentWithRoom[] }> {
    return request('/api/students');
  },

  async allocateStudent(roomId: string, studentId: string): Promise<{ room: Room; message: string }> {
    return request('/api/allocate', {
      method: 'POST',
      body: JSON.stringify({ roomId, studentId }),
    });
  },

  async getAllStays(): Promise<{ stays: any[] }> {
    return request('/api/stays');
  },

  async adminCheckIn(params: {
    studentId: string;
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    guestsCount?: number;
  }): Promise<{ message: string; result: any }> {
    return request('/api/check-in', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async adminCheckOut(studentId: string): Promise<{ message: string; result: any }> {
    return request('/api/check-out', {
      method: 'POST',
      body: JSON.stringify({ studentId }),
    });
  },

  async getAllComplaints(): Promise<{ complaints: Complaint[] }> {
    return request('/api/complaints');
  },

  async toggleComplaintStatus(complaintId: string): Promise<{ complaint: Complaint; message: string }> {
    return request(`/api/complaints/${complaintId}/resolve`, {
      method: 'PATCH',
    });
  },

  // Student
  async getMyRoom(): Promise<StudentRoomDetails> {
    return request('/api/my-room');
  },

  async studentCheckIn(params: {
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    guestsCount?: number;
  }): Promise<{ message: string; result: any }> {
    return request('/api/my-check-in', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async studentCheckOut(): Promise<{ message: string; result: any }> {
    return request('/api/my-check-out', {
      method: 'POST',
    });
  },

  async getMyStays(): Promise<{ stays: StayRecord[] }> {
    return request('/api/my-stays');
  },

  async getMyComplaints(): Promise<{ complaints: Complaint[] }> {
    return request('/api/my-complaints');
  },

  async submitComplaint(text: string): Promise<{ complaint: Complaint; message: string }> {
    return request('/api/complaints', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  // Demo / Seed
  async resetDemoData(): Promise<{ message: string; isUsingMongo: boolean }> {
    return request('/api/seed/reset', {
      method: 'POST',
    });
  },

  async getDbStatus(): Promise<{ status: string; isUsingMongo: boolean }> {
    return request('/api/seed/status');
  },
};
