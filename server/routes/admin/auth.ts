import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getAdminByUsername, updateAdminLastLogin } from '../../db/queries.js';
import { validateAdminLogin } from '../../middleware/validation.js';
import env from '../../config/env.js';
import { AppError } from '../../utils/errors.js';
import logger from '../../utils/logger.js';

const router = Router();

// Admin login
router.post(
  '/login',
  validateAdminLogin,
  async (req: Request, res: Response, next) => {
    try {
      const { username, password } = req.body;

      // Find admin
      const admin = await getAdminByUsername(username);
      if (!admin) {
        return next(new AppError(401, 'Invalid credentials'));
      }

      // Verify password
      const isValid = await bcrypt.compare(password, admin.passwordHash);
      if (!isValid) {
        return next(new AppError(401, 'Invalid credentials'));
      }

      // Update last login
      await updateAdminLastLogin(admin.id);

      // Generate JWT token
      const token = jwt.sign(
        { adminId: admin.id, username: admin.username },
        env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      logger.info(`Admin login successful: ${admin.username}`);

      res.json({
        success: true,
        token,
        expiresIn: '24h',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
