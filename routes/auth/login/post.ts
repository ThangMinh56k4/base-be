import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import dotenv from 'dotenv'

import prisma from '@root/database'

dotenv.config()

const registerSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }).nonempty({ message: 'Email is required' }),
  password: z.string().nonempty({ message: 'Password is required' }),
  rememberMe: z.boolean().optional()
})

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     description: Authenticate a user with email and password. Returns a JWT token if successful.
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
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "strongpassword123"
 *               rememberMe:
 *                 type: boolean
 *                 default: false
 *                 example: true
 *     responses:
 *       200:
 *         description: User authenticated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR..."
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
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
 *       401:
 *         description: Invalid credentials (email or password)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid credentials"
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
    const { email, password, rememberMe } = parsedData

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password!)

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const expiresIn = rememberMe ? '7d' : '1h'

    const token = jwt.sign({
      id: user.id,
      role: user.role,
      name: user.name || '',
      color: user.color,
      picture: user.picture
    }, process.env.SECRET_KEY!, {
      expiresIn
    })

    res.json({ token })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors })
    }

    res.status(500).json({ message: 'Something went wrong' })
  }
}
