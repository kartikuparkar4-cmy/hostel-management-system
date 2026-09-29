import { Router, Response } from 'express';
import { DB } from '../db.ts';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// GET /api/my-room - Student's assigned room, roommates, and active stay details
router.get('/my-room', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // If an admin requests this, return room: null gracefully
    if (req.user.role !== 'student') {
      res.json({ room: null, stay: null });
      return;
    }

    const studentId = req.user._id;
    const room = await DB.findRoomForStudent(studentId);

    if (!room) {
      res.json({ room: null, stay: null });
      return;
    }

    // Identify roommates (other occupants excluding current student)
    const occupants = (room.occupants || []).map((occ: any) => ({
      _id: occ._id ? occ._id.toString() : occ.toString(),
      name: occ.name || 'Occupant',
      email: occ.email || '',
    }));

    const roommates = occupants.filter((o: any) => o._id !== studentId);

    // Retrieve active stay record
    const stay = await DB.getActiveStayForStudent(studentId);

    res.json({
      room: {
        _id: room._id ? room._id.toString() : room._id,
        number: room.number,
        occupants,
        roommates,
      },
      stay,
    });
  } catch (err: any) {
    console.error('Error fetching student room:', err);
    res.status(500).json({ error: 'Failed to retrieve room details' });
  }
});

// POST /api/my-check-in - Student self-check-in / booking from search availability
router.post('/my-check-in', authenticateToken, requireRole('student'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user!._id;
    const { roomId, checkInDate, checkOutDate, guestsCount } = req.body;

    if (!roomId) {
      res.status(400).json({ error: 'roomId is required' });
      return;
    }

    // Rule: Check if student already has a room
    const currentRoom = await DB.findRoomForStudent(studentId);
    if (currentRoom) {
      res.status(400).json({
        error: `You are already checked in to Room ${currentRoom.number}. Please check out first before reserving a new room.`,
      });
      return;
    }

    const targetRoom = await DB.findRoomById(roomId);
    if (!targetRoom) {
      res.status(404).json({ error: 'Target room not found' });
      return;
    }

    if (targetRoom.occupants.length >= 2) {
      res.status(400).json({ error: 'Selected room is full (maximum 2 students)' });
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const defaultOut = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

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
      message: `Successfully checked in to Room ${targetRoom.number}`,
      result,
    });
  } catch (err: any) {
    console.error('Error during student check-in:', err);
    res.status(500).json({ error: 'Failed to complete check-in' });
  }
});

// POST /api/my-check-out - Student self-check-out (vacates room & closes active stay)
router.post('/my-check-out', authenticateToken, requireRole('student'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user!._id;
    const result = await DB.checkOutStudent(studentId);

    if ((result as any).error) {
      res.status(400).json({ error: (result as any).error });
      return;
    }

    res.json({
      message: `You have successfully checked out of Room ${(result as any).roomNumber}. Your bed has been vacated.`,
      result,
    });
  } catch (err: any) {
    console.error('Error during student check-out:', err);
    res.status(500).json({ error: 'Failed to complete check-out' });
  }
});

// GET /api/my-stays - List complete stay history (active and checked out) for this student
router.get('/my-stays', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (req.user.role !== 'student') {
      res.json({ stays: [] });
      return;
    }

    const studentId = req.user._id;
    const stays = await DB.getStaysForStudent(studentId);
    res.json({ stays });
  } catch (err: any) {
    console.error('Error fetching student stays:', err);
    res.status(500).json({ error: 'Failed to fetch stay history' });
  }
});

// GET /api/my-complaints - List complaints filed by this student
router.get('/my-complaints', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // If an admin requests this, return empty complaints list gracefully
    if (req.user.role !== 'student') {
      res.json({ complaints: [] });
      return;
    }

    const studentId = req.user._id;
    const complaints = await DB.getComplaintsForStudent(studentId);
    res.json({ complaints });
  } catch (err: any) {
    console.error('Error fetching student complaints:', err);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// POST /api/complaints - Submit maintenance complaint (Only student with assigned room)
router.post('/complaints', authenticateToken, requireRole('student'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user!._id;
    const { text } = req.body;

    // Rule: Empty complaint text is rejected
    if (!text || !text.trim()) {
      res.status(400).json({ error: 'Complaint text cannot be empty' });
      return;
    }

    // Rule: Only students assigned to a room can lodge a complaint for that room
    const room = await DB.findRoomForStudent(studentId);
    if (!room) {
      res.status(403).json({
        error: 'Cannot file a complaint without an assigned room. Please contact your warden for room allocation.',
      });
      return;
    }

    const roomId = room._id ? room._id.toString() : room._id;
    const complaint = await DB.createComplaint({
      studentId,
      roomId,
      text: text.trim(),
    });

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint,
    });
  } catch (err: any) {
    console.error('Error submitting complaint:', err);
    res.status(500).json({ error: 'Failed to submit complaint' });
  }
});

export default router;
