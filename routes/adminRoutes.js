// routes/adminRoutes.js
import express from 'express';
import { registerRMG, registerHR } from '../controllers/adminController.js';
import { protect } from '../middlewares/auth.js';
import { authorize } from '../middlewares/roles.js';

const router = express.Router();

// All routes below are protected and only accessible by Admins
router.use(protect);
router.use(authorize('Admin'));

// POST /api/admin/rmg
router.post('/rmg', registerRMG);

// POST /api/admin/hr
router.post('/hr', registerHR);

export default router;
