import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../utils/errors.js';

// South African mobile number validation (0812345678 format)
const mobileRegex = /^0[6-8][0-9]{8}$/;

export const validateRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ageGroupOptions = ['Under 18', '18-25', '26-35', '36-45', '46-55', '56-65', '66+'] as const;
  const schema = z.object({
    name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
    mobile: z.string().regex(mobileRegex, 'Invalid South African mobile number format'),
    ageGroup: z.enum(ageGroupOptions, { message: 'Please select an age group' }),
    suburb: z.string().min(1, 'Suburb is required').max(100, 'Suburb too long'),
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
  });

  try {
    const validated = schema.parse(req.body);
    req.body = validated;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(400, error.errors[0].message));
    }
    next(error);
  }
};

export const validateScoreSubmission = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = z.object({
    mobile: z.string().regex(mobileRegex, 'Invalid mobile number format'),
    score: z.number().int().min(0, 'Score must be non-negative'),
    matchesMade: z.number().int().min(0, 'Matches made must be non-negative'),
    seed: z.number().int().optional(),
  });

  try {
    const validated = schema.parse(req.body);
    req.body = validated;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(400, error.errors[0].message));
    }
    next(error);
  }
};

export const validateAdminLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
  });

  try {
    const validated = schema.parse(req.body);
    req.body = validated;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(400, error.errors[0].message));
    }
    next(error);
  }
};
