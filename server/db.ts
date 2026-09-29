import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// Types
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'student';
  comparePassword(candidate: string): Promise<boolean>;
}

export interface IRoom extends Document {
  number: string;
  occupants: (Types.ObjectId | IUser)[];
}

export interface IComplaint extends Document {
  student: Types.ObjectId | IUser;
  room: Types.ObjectId | IRoom;
  text: string;
  status: 'Pending' | 'Resolved';
  createdAt: Date;
  updatedAt: Date;
}

export interface IStay extends Document {
  student: Types.ObjectId | IUser;
  room: Types.ObjectId | IRoom;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guestsCount: number;
  status: 'Checked In' | 'Checked Out' | 'Reserved';
  checkedOutAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// -------------------------------------------------------------
// Real Mongoose Schemas
// -------------------------------------------------------------
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'student'], default: 'student', required: true },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

const RoomSchema = new Schema<IRoom>(
  {
    number: { type: String, required: true, unique: true, trim: true },
    occupants: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      validate: [
        (val: Types.ObjectId[]) => val.length <= 2,
        'Room capacity cannot exceed 2 students',
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const ComplaintSchema = new Schema<IComplaint>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    text: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Pending', 'Resolved'], default: 'Pending' },
  },
  { timestamps: true }
);

const StaySchema = new Schema<IStay>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    checkInDate: { type: String, required: true },
    checkOutDate: { type: String, required: true },
    nights: { type: Number, default: 7 },
    guestsCount: { type: Number, default: 1 },
    status: { type: String, enum: ['Checked In', 'Checked Out', 'Reserved'], default: 'Checked In' },
    checkedOutAt: { type: Date },
  },
  { timestamps: true }
);

export const MongoUserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const MongoRoomModel: Model<IRoom> = mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);
export const MongoComplaintModel: Model<IComplaint> =
  mongoose.models.Complaint || mongoose.model<IComplaint>('Complaint', ComplaintSchema);
export const MongoStayModel: Model<IStay> =
  mongoose.models.Stay || mongoose.model<IStay>('Stay', StaySchema);

// -------------------------------------------------------------
// Seamless In-Memory / File-backed Fallback Store
// (Ensures the app functions immediately in zero-setup/preview environments
// while running real Mongoose as soon as MONGO_URI is reachable)
// -------------------------------------------------------------
export let isUsingMongo = false;

interface MemoryUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'student';
  createdAt: string;
}

interface MemoryRoom {
  _id: string;
  number: string;
  occupants: string[];
  createdAt: string;
}

interface MemoryComplaint {
  _id: string;
  student: string;
  room: string;
  text: string;
  status: 'Pending' | 'Resolved';
  createdAt: string;
  updatedAt: string;
}

export interface MemoryStay {
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

interface StoreData {
  users: MemoryUser[];
  rooms: MemoryRoom[];
  complaints: MemoryComplaint[];
  stays: MemoryStay[];
}

const DATA_FILE = path.resolve(process.cwd(), '.hostel_data.json');

class MemoryStore {
  private data: StoreData = { users: [], rooms: [], complaints: [], stays: [] };

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          users: parsed.users || [],
          rooms: parsed.rooms || [],
          complaints: parsed.complaints || [],
          stays: parsed.stays || [],
        };
      }
    } catch {
      this.data = { users: [], rooms: [], complaints: [], stays: [] };
    }
  }

  private save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch {
      // ignore
    }
  }

  get users() {
    return this.data.users;
  }
  get rooms() {
    return this.data.rooms;
  }
  get complaints() {
    return this.data.complaints;
  }
  get stays() {
    return this.data.stays;
  }

  persist() {
    this.save();
  }

  clear() {
    this.data = { users: [], rooms: [], complaints: [], stays: [] };
    this.save();
  }
}

export const memoryStore = new MemoryStore();

// Universal Unified Database Access Adapter
export const DB = {
  isUsingMongo: () => isUsingMongo,

  // USER METHODS
  async findUserByEmail(email: string) {
    const clean = email.toLowerCase().trim();
    if (isUsingMongo) {
      return MongoUserModel.findOne({ email: clean });
    }
    const found = memoryStore.users.find((u) => u.email === clean);
    if (!found) return null;
    return {
      _id: found._id,
      name: found.name,
      email: found.email,
      password: found.password,
      role: found.role,
      async comparePassword(candidate: string) {
        return bcrypt.compare(candidate, found.password);
      },
    };
  },

  async findUserById(id: string) {
    if (isUsingMongo) {
      return MongoUserModel.findById(id).select('-password');
    }
    const found = memoryStore.users.find((u) => u._id === id);
    if (!found) return null;
    return {
      _id: found._id,
      name: found.name,
      email: found.email,
      role: found.role,
    };
  },

  async createUser(data: { name: string; email: string; passwordHash: string; role: 'admin' | 'student' }) {
    const clean = data.email.toLowerCase().trim();
    if (isUsingMongo) {
      const doc = new MongoUserModel({
        name: data.name.trim(),
        email: clean,
        password: data.passwordHash,
        role: data.role,
      });
      await doc.save();
      return {
        _id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        role: doc.role,
      };
    }
    const newUser: MemoryUser = {
      _id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      name: data.name.trim(),
      email: clean,
      password: data.passwordHash,
      role: data.role,
      createdAt: new Date().toISOString(),
    };
    memoryStore.users.push(newUser);
    memoryStore.persist();
    return {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };
  },

  async getAllStudents() {
    if (isUsingMongo) {
      const students = await MongoUserModel.find({ role: 'student' }).select('-password').sort({ name: 1 }).lean();
      const rooms = await MongoRoomModel.find().lean();
      return students.map((s) => {
        const studentIdStr = s._id.toString();
        const assignedRoom = rooms.find((r) =>
          (r.occupants || []).some((occ: any) => occ.toString() === studentIdStr)
        );
        return {
          _id: studentIdStr,
          name: s.name,
          email: s.email,
          role: s.role,
          room: assignedRoom
            ? {
                _id: assignedRoom._id.toString(),
                number: assignedRoom.number,
              }
            : null,
        };
      });
    }

    return memoryStore.users
      .filter((u) => u.role === 'student')
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((s) => {
        const assignedRoom = memoryStore.rooms.find((r) => r.occupants.includes(s._id));
        return {
          _id: s._id,
          name: s.name,
          email: s.email,
          role: s.role,
          room: assignedRoom
            ? {
                _id: assignedRoom._id,
                number: assignedRoom.number,
              }
            : null,
        };
      });
  },

  // ROOM METHODS
  async getAllRooms() {
    if (isUsingMongo) {
      const rooms = await MongoRoomModel.find().populate('occupants', 'name email').sort({ number: 1 }).lean();
      return rooms.map((r) => ({
        _id: r._id.toString(),
        number: r.number,
        occupants: (r.occupants as any[]).map((occ) => ({
          _id: occ._id.toString(),
          name: occ.name,
          email: occ.email,
        })),
      }));
    }

    return memoryStore.rooms
      .slice()
      .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }))
      .map((r) => {
        const occupantsData = r.occupants
          .map((id) => {
            const u = memoryStore.users.find((user) => user._id === id);
            return u ? { _id: u._id, name: u.name, email: u.email } : null;
          })
          .filter(Boolean);
        return {
          _id: r._id,
          number: r.number,
          occupants: occupantsData,
        };
      });
  },

  async findRoomByNumber(num: string) {
    const clean = num.trim();
    if (isUsingMongo) {
      return MongoRoomModel.findOne({ number: clean });
    }
    return memoryStore.rooms.find((r) => r.number.toLowerCase() === clean.toLowerCase()) || null;
  },

  async findRoomById(id: string) {
    if (isUsingMongo) {
      return MongoRoomModel.findById(id).populate('occupants', 'name email');
    }
    const r = memoryStore.rooms.find((rm) => rm._id === id);
    if (!r) return null;
    const occupantsData = r.occupants
      .map((uid) => {
        const u = memoryStore.users.find((user) => user._id === uid);
        return u ? { _id: u._id, name: u.name, email: u.email } : null;
      })
      .filter(Boolean);
    return {
      _id: r._id,
      number: r.number,
      occupants: occupantsData,
    };
  },

  async findRoomForStudent(studentId: string) {
    if (isUsingMongo) {
      const room = await MongoRoomModel.findOne({ occupants: studentId }).populate('occupants', 'name email');
      return room;
    }
    const r = memoryStore.rooms.find((rm) => rm.occupants.includes(studentId));
    if (!r) return null;
    const occupantsData = r.occupants
      .map((uid) => {
        const u = memoryStore.users.find((user) => user._id === uid);
        return u ? { _id: u._id, name: u.name, email: u.email } : null;
      })
      .filter(Boolean);
    return {
      _id: r._id,
      number: r.number,
      occupants: occupantsData,
    };
  },

  async createRoom(number: string) {
    const clean = number.trim();
    if (isUsingMongo) {
      const room = new MongoRoomModel({ number: clean, occupants: [] });
      await room.save();
      return {
        _id: room._id.toString(),
        number: room.number,
        occupants: [],
      };
    }

    const newRoom: MemoryRoom = {
      _id: 'rm_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      number: clean,
      occupants: [],
      createdAt: new Date().toISOString(),
    };
    memoryStore.rooms.push(newRoom);
    memoryStore.persist();
    return newRoom;
  },

  /**
   * Atomic allocation of a student to a room.
   * Ensures capacity <= 2 and no double assignment concurrently.
   */
  async allocateStudentToRoom(roomId: string, studentId: string) {
    if (isUsingMongo) {
      const updated = await MongoRoomModel.findOneAndUpdate(
        {
          _id: roomId,
          'occupants.1': { $exists: false }, // index 1 does not exist -> 0 or 1 occupants
          occupants: { $ne: studentId },
        },
        {
          $push: { occupants: studentId },
        },
        { new: true }
      ).populate('occupants', 'name email');

      return updated;
    }

    const room = memoryStore.rooms.find((r) => r._id === roomId);
    if (!room) return null;

    if (room.occupants.length >= 2) {
      return 'FULL';
    }
    if (room.occupants.includes(studentId)) {
      return 'ALREADY_IN_ROOM';
    }

    room.occupants.push(studentId);
    memoryStore.persist();

    const occupantsData = room.occupants
      .map((uid) => {
        const u = memoryStore.users.find((user) => user._id === uid);
        return u ? { _id: u._id, name: u.name, email: u.email } : null;
      })
      .filter(Boolean);

    return {
      _id: room._id,
      number: room.number,
      occupants: occupantsData,
    };
  },

  /**
   * Deallocates a student from a room (vacates their bed).
   */
  async deallocateStudentFromRoom(roomId: string, studentId: string) {
    if (isUsingMongo) {
      const updated = await MongoRoomModel.findByIdAndUpdate(
        roomId,
        { $pull: { occupants: studentId } },
        { new: true }
      ).populate('occupants', 'name email');
      return updated;
    }

    const room = memoryStore.rooms.find((r) => r._id === roomId);
    if (!room) return null;
    room.occupants = room.occupants.filter((id) => id !== studentId);
    memoryStore.persist();

    const occupantsData = room.occupants
      .map((uid) => {
        const u = memoryStore.users.find((user) => user._id === uid);
        return u ? { _id: u._id, name: u.name, email: u.email } : null;
      })
      .filter(Boolean);

    return {
      _id: room._id,
      number: room.number,
      occupants: occupantsData,
    };
  },

  // -------------------------------------------------------------
  // CHECK-IN & CHECK-OUT STAY MANAGEMENT
  // -------------------------------------------------------------
  async recordStay(params: {
    studentId: string;
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    nights?: number;
    guestsCount?: number;
    status?: 'Checked In' | 'Checked Out' | 'Reserved';
  }) {
    const student = await this.findUserById(params.studentId);
    const room = await this.findRoomById(params.roomId);

    const start = new Date(params.checkInDate).getTime();
    const end = new Date(params.checkOutDate).getTime();
    const nights = params.nights || Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) || 7);

    if (isUsingMongo) {
      const stay = new MongoStayModel({
        student: params.studentId,
        room: params.roomId,
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        nights,
        guestsCount: params.guestsCount || 1,
        status: params.status || 'Checked In',
      });
      await stay.save();
      return stay;
    }

    const newStay: MemoryStay = {
      _id: 'sty_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      studentId: params.studentId,
      studentName: student?.name || 'Resident',
      studentEmail: student?.email || '',
      roomId: params.roomId,
      roomNumber: room?.number || '101',
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      nights,
      guestsCount: params.guestsCount || 1,
      status: params.status || 'Checked In',
      createdAt: new Date().toISOString(),
    };
    memoryStore.stays.push(newStay);
    memoryStore.persist();
    return newStay;
  },

  async checkInStudent(params: {
    studentId: string;
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    guestsCount?: number;
  }) {
    // 1. Allocate student to room
    const allocated = await this.allocateStudentToRoom(params.roomId, params.studentId);
    if (!allocated || allocated === 'FULL' || allocated === 'ALREADY_IN_ROOM') {
      return allocated;
    }

    // 2. Record stay
    const stay = await this.recordStay({
      studentId: params.studentId,
      roomId: params.roomId,
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      guestsCount: params.guestsCount || 1,
      status: 'Checked In',
    });

    return { allocated, stay };
  },

  async checkOutStudent(studentId: string) {
    const room = await this.findRoomForStudent(studentId);
    if (!room) {
      return { error: 'Student has no active room assignment to check out from.' };
    }

    const roomId = room._id ? room._id.toString() : room._id;
    await this.deallocateStudentFromRoom(roomId, studentId);

    // Update active stay status
    if (isUsingMongo) {
      await MongoStayModel.findOneAndUpdate(
        { student: studentId, status: 'Checked In' },
        { status: 'Checked Out', checkedOutAt: new Date() }
      );
    } else {
      const stay = memoryStore.stays.find(
        (s) => s.studentId === studentId && s.status === 'Checked In'
      );
      if (stay) {
        stay.status = 'Checked Out';
        stay.checkedOutAt = new Date().toISOString();
        memoryStore.persist();
      }
    }

    return { success: true, roomNumber: room.number };
  },

  async getAllStays() {
    if (isUsingMongo) {
      const stays = await MongoStayModel.find()
        .populate('student', 'name email')
        .populate('room', 'number')
        .sort({ createdAt: -1 })
        .lean();
      return stays.map((s: any) => ({
        _id: s._id.toString(),
        studentId: s.student?._id?.toString() || '',
        studentName: s.student?.name || 'Resident',
        studentEmail: s.student?.email || '',
        roomId: s.room?._id?.toString() || '',
        roomNumber: s.room?.number || '',
        checkInDate: s.checkInDate,
        checkOutDate: s.checkOutDate,
        nights: s.nights || 7,
        guestsCount: s.guestsCount || 1,
        status: s.status,
        createdAt: s.createdAt,
        checkedOutAt: s.checkedOutAt,
      }));
    }

    return memoryStore.stays
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getActiveStayForStudent(studentId: string) {
    if (isUsingMongo) {
      const s = await MongoStayModel.findOne({ student: studentId, status: 'Checked In' })
        .populate('room', 'number')
        .lean();
      if (!s) return null;
      return {
        _id: (s as any)._id.toString(),
        studentId,
        studentName: (s as any).student?.name || 'Resident',
        studentEmail: (s as any).student?.email || '',
        roomId: (s as any).room?._id?.toString() || '',
        roomNumber: (s as any).room?.number || '',
        checkInDate: (s as any).checkInDate,
        checkOutDate: (s as any).checkOutDate,
        nights: (s as any).nights,
        guestsCount: (s as any).guestsCount,
        status: (s as any).status,
        createdAt: (s as any).createdAt,
      };
    }

    return memoryStore.stays.find((s) => s.studentId === studentId && s.status === 'Checked In') || null;
  },

  async getStaysForStudent(studentId: string) {
    if (isUsingMongo) {
      const stays = await MongoStayModel.find({ student: studentId })
        .populate('room', 'number')
        .sort({ createdAt: -1 })
        .lean();
      return stays.map((s: any) => ({
        _id: s._id.toString(),
        studentId,
        studentName: s.student?.name || 'Resident',
        studentEmail: s.student?.email || '',
        roomId: s.room?._id?.toString() || '',
        roomNumber: s.room?.number || '',
        checkInDate: s.checkInDate,
        checkOutDate: s.checkOutDate,
        nights: s.nights || 7,
        guestsCount: s.guestsCount || 1,
        status: s.status,
        createdAt: s.createdAt,
        checkedOutAt: s.checkedOutAt,
      }));
    }

    return memoryStore.stays
      .filter((s) => s.studentId === studentId)
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // COMPLAINT METHODS
  async createComplaint(data: { studentId: string; roomId: string; text: string }) {
    if (isUsingMongo) {
      const comp = new MongoComplaintModel({
        student: data.studentId,
        room: data.roomId,
        text: data.text.trim(),
        status: 'Pending',
      });
      await comp.save();
      await comp.populate([
        { path: 'student', select: 'name email' },
        { path: 'room', select: 'number' },
      ]);
      return comp;
    }

    const newComp: MemoryComplaint = {
      _id: 'cmp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      student: data.studentId,
      room: data.roomId,
      text: data.text.trim(),
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryStore.complaints.push(newComp);
    memoryStore.persist();

    const studentObj = memoryStore.users.find((u) => u._id === data.studentId);
    const roomObj = memoryStore.rooms.find((r) => r._id === data.roomId);

    return {
      _id: newComp._id,
      text: newComp.text,
      status: newComp.status,
      createdAt: newComp.createdAt,
      student: studentObj ? { _id: studentObj._id, name: studentObj.name, email: studentObj.email } : null,
      room: roomObj ? { _id: roomObj._id, number: roomObj.number } : null,
    };
  },

  async getAllComplaints() {
    if (isUsingMongo) {
      return MongoComplaintModel.find()
        .populate('student', 'name email')
        .populate('room', 'number')
        .sort({ createdAt: -1 })
        .lean();
    }

    return memoryStore.complaints
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((c) => {
        const studentObj = memoryStore.users.find((u) => u._id === c.student);
        const roomObj = memoryStore.rooms.find((r) => r._id === c.room);
        return {
          _id: c._id,
          text: c.text,
          status: c.status,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          student: studentObj ? { _id: studentObj._id, name: studentObj.name, email: studentObj.email } : null,
          room: roomObj ? { _id: roomObj._id, number: roomObj.number } : null,
        };
      });
  },

  async getComplaintsForStudent(studentId: string) {
    if (isUsingMongo) {
      return MongoComplaintModel.find({ student: studentId })
        .populate('room', 'number')
        .sort({ createdAt: -1 })
        .lean();
    }

    return memoryStore.complaints
      .filter((c) => c.student === studentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((c) => {
        const roomObj = memoryStore.rooms.find((r) => r._id === c.room);
        return {
          _id: c._id,
          text: c.text,
          status: c.status,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          room: roomObj ? { _id: roomObj._id, number: roomObj.number } : null,
        };
      });
  },

  async toggleComplaintStatus(complaintId: string) {
    if (isUsingMongo) {
      const comp = await MongoComplaintModel.findById(complaintId);
      if (!comp) return null;
      comp.status = comp.status === 'Pending' ? 'Resolved' : 'Pending';
      await comp.save();
      await comp.populate([
        { path: 'student', select: 'name email' },
        { path: 'room', select: 'number' },
      ]);
      return comp;
    }

    const c = memoryStore.complaints.find((comp) => comp._id === complaintId);
    if (!c) return null;
    c.status = c.status === 'Pending' ? 'Resolved' : 'Pending';
    c.updatedAt = new Date().toISOString();
    memoryStore.persist();

    const studentObj = memoryStore.users.find((u) => u._id === c.student);
    const roomObj = memoryStore.rooms.find((r) => r._id === c.room);
    return {
      _id: c._id,
      text: c.text,
      status: c.status,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      student: studentObj ? { _id: studentObj._id, name: studentObj.name, email: studentObj.email } : null,
      room: roomObj ? { _id: roomObj._id, number: roomObj.number } : null,
    };
  },
};

// Database Connect Helper
export async function connectDB(): Promise<void> {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.log('[Database] No MONGO_URI specified. Operating with persistent embedded datastore.');
    isUsingMongo = false;
    await seedDemoDataIfEmpty();
    return;
  }

  try {
    console.log(`[Database] Attempting connection to MongoDB at ${uri}...`);
    // Connect with a 2-second timeout so the server starts immediately even if MongoDB isn't running locally
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isUsingMongo = true;
    console.log('[Database] Successfully connected to MongoDB via Mongoose!');
    await seedDemoDataIfEmpty();
  } catch (err: any) {
    console.warn(`[Database] MongoDB connection failed (${err.message}). Using persistent fallback datastore.`);
    isUsingMongo = false;
    await seedDemoDataIfEmpty();
  }
}

// Seed Initial Demo Data (sample admin, rooms, students) if empty
export async function seedDemoDataIfEmpty(force = false) {
  try {
    const existingAdmin = await DB.findUserByEmail('warden@hostel.edu');
    if (existingAdmin && !force) {
      return;
    }

    console.log('[Database] Seeding initial hostel demo data...');
    const hashedAdminPass = await bcrypt.hash('warden123', 10);
    const hashedStudentPass = await bcrypt.hash('student123', 10);

    // Create Admin
    const admin = await DB.createUser({
      name: 'Dr. Arthur Vance (Warden)',
      email: 'warden@hostel.edu',
      passwordHash: hashedAdminPass,
      role: 'admin',
    });

    // Create Students
    const student1 = await DB.createUser({
      name: 'Alex Johnson',
      email: 'alex@student.edu',
      passwordHash: hashedStudentPass,
      role: 'student',
    });

    const student2 = await DB.createUser({
      name: 'Samantha Lee',
      email: 'sam@student.edu',
      passwordHash: hashedStudentPass,
      role: 'student',
    });

    const student3 = await DB.createUser({
      name: 'Jordan Miller',
      email: 'jordan@student.edu',
      passwordHash: hashedStudentPass,
      role: 'student',
    });

    const student4 = await DB.createUser({
      name: 'Rohan Sharma',
      email: 'rohan@student.edu',
      passwordHash: hashedStudentPass,
      role: 'student',
    });

    // Create Rooms
    const room101 = await DB.createRoom('101');
    const room102 = await DB.createRoom('102');
    const room103 = await DB.createRoom('103');

    // Allocate Alex and Sam to Room 101 (making it 2/2 full)
    await DB.allocateStudentToRoom(room101._id.toString(), student1._id.toString());
    await DB.allocateStudentToRoom(room101._id.toString(), student2._id.toString());

    // Allocate Jordan to Room 102 (making it 1/2 occupied)
    await DB.allocateStudentToRoom(room102._id.toString(), student3._id.toString());
    // Rohan is unassigned (0/2 in room 103)

    // Seed Initial Stays
    await DB.recordStay({
      studentId: student1._id.toString(),
      roomId: room101._id.toString(),
      checkInDate: '2026-09-01',
      checkOutDate: '2026-12-20',
      nights: 110,
      guestsCount: 1,
      status: 'Checked In',
    });

    await DB.recordStay({
      studentId: student2._id.toString(),
      roomId: room101._id.toString(),
      checkInDate: '2026-09-05',
      checkOutDate: '2026-12-20',
      nights: 106,
      guestsCount: 1,
      status: 'Checked In',
    });

    await DB.recordStay({
      studentId: student3._id.toString(),
      roomId: room102._id.toString(),
      checkInDate: '2026-09-10',
      checkOutDate: '2026-12-20',
      nights: 101,
      guestsCount: 1,
      status: 'Checked In',
    });

    // Add a complaint from Alex for Room 101
    await DB.createComplaint({
      studentId: student1._id.toString(),
      roomId: room101._id.toString(),
      text: 'The study lamp desk socket is sparking and the bathroom tap is leaking.',
    });

    // Add a resolved complaint from Jordan for Room 102
    const c2 = await DB.createComplaint({
      studentId: student3._id.toString(),
      roomId: room102._id.toString(),
      text: 'Window latch was loose. Repaired by maintenance.',
    });
    await DB.toggleComplaintStatus(c2._id.toString());

    console.log('[Database] Seed data created successfully!');
  } catch (err: any) {
    console.error('[Database] Error seeding demo data:', err.message);
  }
}
