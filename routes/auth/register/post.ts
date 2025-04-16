import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { z } from 'zod'

import prisma from '@root/database'

import { getRandomColor } from '@root/utils'

const registerSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  name: z.string().optional()
})

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with email, password, and name. Returns the created user's details.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "strongpassword123"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *     responses:
 *       201:
 *         description: User successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *       400:
 *         description: Invalid input or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email already exists"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       path:
 *                         type: string
 *                         example: "email"
 *                       message:
 *                         type: string
 *                         example: "Invalid email format"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Something went wrong"
 */

export default async (req: Request, res: Response) => {
  try {
    const parsedData = registerSchema.parse(req.body)
    const { email, password, name } = parsedData

    const existingUser = await prisma.user.findUnique({ where: { email } })
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        color: getRandomColor()
      }
    })

    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors })
    }

    res.status(500).json({ message: 'Something went wrong' })
  }
}
