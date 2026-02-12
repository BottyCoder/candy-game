import bcrypt from 'bcrypt';
import { db } from '../config/database.js';
import { adminUsers } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import env from '../config/env.js';
import logger from './logger.js';

export async function initAdmin() {
  try {
    // Check if admin already exists
    const [existing] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, env.ADMIN_USERNAME))
      .limit(1);

    if (existing) {
      logger.info(`Admin user already exists: ${env.ADMIN_USERNAME}`);
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);

    // Create admin user
    const [admin] = await db
      .insert(adminUsers)
      .values({
        username: env.ADMIN_USERNAME,
        passwordHash,
        role: 'admin',
      })
      .returning();

    logger.info(`Admin user created: ${admin.username}`);
  } catch (error) {
    logger.error('Error initializing admin user:', error);
    throw error;
  }
}
