import { Router, Response } from 'express';
import { DB } from '../db.ts';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.ts';

const router = Router();
const adminAuth = [authenticateToken, requireRole('admin')];

// GET /api/public-rooms - Public room overview for visitors and students
router.get('/public-rooms', async (_req, res: Response): Promise<void> => {
  try {
    const rooms = await DB.getAllRooms();
    const publicRooms = rooms.map((r) => ({
      _id: r._id,
      number: r.number,
      capacity: 2,
      occupantCount: (r.occupants || []).length,
      availableBeds: Math.max(0, 2 - (r.occupants || []).length),
      isFull: (r.occupants || []).length >= 2,
    }));
    res.json({ rooms: publicRooms });
  } catch (err: any) {
    console.error('Error fetching public rooms:', err);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// POST /api/search-availability - Check available rooms for requested check-in / check-out dates
router.post('/search-availability', async (req, res: Response): Promise<void> => {
  try {
    const { checkIn, checkOut, guests } = req.body;
    const rooms = await DB.getAllRooms();
    const requestedBeds = guests === '2 residents' ? 2 : 1;

    // Filter rooms with enough beds
    const availableRooms = rooms
      .map((r) => {
        const occupantCount = (r.occupants || []).length;
        const availableBeds = Math.max(0, 2 - occupantCount);
        return {
          _id: r._id,
          number: r.number,
          occupants: r.occupants,
          availableBeds,
          occupantCount,
          meetsRequest: availableBeds >= requestedBeds,
        };
      })
      .filter((r) => r.meetsRequest);

    res.json({
      checkIn: checkIn || new Date().toISOString().split('T')[0],
      checkOut: checkOut || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      requestedBeds,
      totalAvailableRooms: availableRooms.length,
      rooms: availableRooms,
    });
  } catch (err: any) {
    console.error('Error searching availability:', err);
    res.status(500).json({ error: 'Failed to search room availability' });
  }
});

// GET /api/stays - List all stay records with check-in and check-out dates (Admin only)
router.get('/stays', adminAuth, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stays = await DB.getAllStays();
    res.json({ stays });
  } catch (err: any) {
    console.error('Error fetching stays:', err);
    res.status(500).json({ error: 'Failed to fetch stays' });
  }
});

// POST /api/check-in - Check-in a student with check-in and check-out dates (Admin only)
router.post('/check-in', adminAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId, roomId, checkInDate, checkOutDate, guestsCount } = req.body;

    if (!studentId || !roomId) {
      res.status(400).json({ error: 'Both studentId and roomId are required' });
      return;
    }

    const student = await DB.findUserById(studentId);
    if (!student || student.role !== 'student') {
      res.status(404).json({ error: 'Student not found or invalid role' });
      return;
    }

    // Check if already in another room
    const currentRoom = await DB.findRoomForStudent(studentId);
    if (currentRoom) {
      res.status(400).json({
        error: `Student ${student.name} is already checked in to Room ${currentRoom.number}. Please check them out first.`,
      });
      return;
    }

    const room = await DB.findRoomById(roomId);
    if (!room) {
      res.status(404).json({ error: 'Target room not found' });
      return;
    }

    if (room.occupants.length >= 2) {
      res.status(400).json({ error: 'Room is full (maximum 2 students)' });
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const defaultOut = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

    const result = await DB.checkInStudent({
      studentId,
      roomId,
      checkInDate: checkInDate || todayStr,
      checkOutDate: checkOutDate || defaultOut,
      guestsCount: Number(guestsCount) || 1,
    });

    if (result === 'FULL') {
      res.status(400).json({ error: 'Room is full (maximum 2 students)' });
      return;
    }

    res.status(201).json({
      message: `Successfully checked in ${student.name} to Room ${room.number}`,
      result,
    });
  } catch (err: any) {
    console.error('Error during check-in:', err);
    res.status(500).json({ error: 'Failed to process check-in' });
  }
});

// POST /api/check-out - Check-out a student (vacates room & updates stay record) (Admin only)
router.post('/check-out', adminAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      res.status(400).json({ error: 'studentId is required' });
      return;
    }

    const student = await DB.findUserById(studentId);
    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    const result = await DB.checkOutStudent(studentId);
    if ((result as any).error) {
      res.status(400).json({ error: (result as any).error });
      return;
    }

    res.json({
      message: `Successfully checked out ${student.name} and vacated bed`,
      result,
    });
  } catch (err: any) {
    console.error('Error during check-out:', err);
    res.status(500).json({ error: 'Failed to process check-out' });
  }
});

// GET /api/rooms - List all rooms with occupants (Admin only)
router.get('/rooms', adminAuth, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rooms = await DB.getAllRooms();
    res.json({ rooms });
  } catch (err: any) {
    console.error('Error fetching rooms:', err);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// POST /api/rooms - Add a new room (Admin only)
router.post('/rooms', adminAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { number } = req.body;

    if (!number || !String(number).trim()) {
      res.status(400).json({ error: 'Room number is required' });
      return;
    }

    const cleanNumber = String(number).trim();

    // Check duplicate room number
    const existing = await DB.findRoomByNumber(cleanNumber);
    if (existing) {
      res.status(409).json({ error: `Room ${cleanNumber} already exists` });
      return;
    }

    const newRoom = await DB.createRoom(cleanNumber);
    res.status(201).json({
      message: `Room ${cleanNumber} created successfully`,
      room: newRoom,
    });
  } catch (err: any) {
    console.error('Error creating room:', err);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// GET /api/students - List all students with their assigned room (Admin only)
router.get('/students', adminAuth, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const students = await DB.getAllStudents();
    res.json({ students });
  } catch (err: any) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// POST /api/allocate - Allocate a student to a room (Admin only)
router.post('/allocate', adminAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId, studentId } = req.body;

    if (!roomId || !studentId) {
      res.status(400).json({ error: 'Both roomId and studentId are required' });
      return;
    }

    // 1. Verify student exists and has role 'student'
    const student = await DB.findUserById(studentId);
    if (!student || student.role !== 'student') {
      res.status(404).json({ error: 'Student not found or invalid role' });
      return;
    }

    // 2. Verify target room exists
    const room = await DB.findRoomById(roomId);
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    // 3. Rule: Check if student is already assigned to ANY room
    const currentAssignedRoom = await DB.findRoomForStudent(studentId);
    if (currentAssignedRoom) {
      if (currentAssignedRoom._id.toString() === roomId.toString()) {
        res.status(400).json({
          error: `Student ${student.name} is already assigned to this room (Room ${currentAssignedRoom.number})`,
        });
        return;
      }
      res.status(400).json({
        error: `Student ${student.name} is already assigned to Room ${currentAssignedRoom.number}`,
      });
      return;
    }

    // 4. Rule: Check room capacity (max 2 students)
    if (room.occupants.length >= 2) {
      res.status(400).json({ error: 'Room is full (maximum 2 students)' });
      return;
    }

    // 5. Execute atomic database update to prevent concurrency race conditions
    const updated = await DB.allocateStudentToRoom(roomId, studentId);

    if (updated === 'FULL' || !updated) {
      res.status(400).json({ error: 'Room is full (maximum 2 students)' });
      return;
    }

    if (updated === 'ALREADY_IN_ROOM') {
      res.status(400).json({
        error: `Student ${student.name} is already assigned to this room`,
      });
      return;
    }

    // Record default stay
    const todayStr = new Date().toISOString().split('T')[0];
    const defaultOut = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    await DB.recordStay({
      studentId,
      roomId,
      checkInDate: todayStr,
      checkOutDate: defaultOut,
      guestsCount: 1,
      status: 'Checked In',
    });

    res.json({
      message: `Successfully allocated ${student.name} to Room ${room.number}`,
      room: updated,
    });
  } catch (err: any) {
    console.error('Error allocating student:', err);
    res.status(500).json({ error: 'Failed to allocate student to room' });
  }
});

// GET /api/complaints - View all complaints (Admin only)
router.get('/complaints', adminAuth, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const complaints = await DB.getAllComplaints();
    res.json({ complaints });
  } catch (err: any) {
    console.error('Error fetching complaints:', err);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// PATCH /api/complaints/:id/resolve - Toggle complaint status (Admin only)
router.patch('/complaints/:id/resolve', adminAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await DB.toggleComplaintStatus(id);

    if (!updated) {
      res.status(404).json({ error: 'Complaint not found' });
      return;
    }

    res.json({
      message: `Complaint marked as ${updated.status}`,
      complaint: updated,
    });
  } catch (err: any) {
    console.error('Error updating complaint status:', err);
    res.status(500).json({ error: 'Failed to update complaint status' });
  }
});

export default router;
