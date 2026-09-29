import { Router, Request, Response } from 'express';
import { memoryStore, seedDemoDataIfEmpty, isUsingMongo } from '../db.ts';

const router = Router();

// POST /api/seed/reset - Re-seeds initial demo data
router.post('/reset', async (_req: Request, res: Response): Promise<void> => {
  try {
    memoryStore.clear();
    await seedDemoDataIfEmpty(true);
    res.json({
      message: 'Demo dataset has been reset successfully',
      isUsingMongo: isUsingMongo,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reset demo data: ' + err.message });
  }
});

// GET /api/seed/status - System and DB status
router.get('/status', async (_req: Request, res: Response): Promise<void> => {
  res.json({
    status: 'ok',
    isUsingMongo: isUsingMongo,
    timestamp: new Date().toISOString(),
  });
});

export default router;
