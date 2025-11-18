// routes/index.js
import express from 'express';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);

// add other routes: /users, /jobs, etc.

export default router;
