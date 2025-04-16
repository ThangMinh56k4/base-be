import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import dotenv from 'dotenv';

import prisma from '@root/database'

import { UserPayload } from '@root/types'

dotenv.config();

const registerSchema = z.object({
  token: z.string().nonempty({ message: 'Token is required' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' })
})

export default async (req: Request, res: Response) => { 
  try {
    const { token, password } = registerSchema.parse(req.body);

    const decoded = jwt.verify(token, process.env.SECRET_KEY!) as UserPayload

    if (!decoded) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword }
    });

    return res.json({ message: 'Password reset successfully' });
  } catch (error) { 
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }

    return res.status(500).json({ message: 'Something went wrong' });
  }
}
