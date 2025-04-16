import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import dotenv from 'dotenv';

import prisma from '@root/database'
import { sendEmail } from '@root/utils/email'

dotenv.config();

const registerSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }).nonempty({ message: 'Email is required' }),
  redirectUrl: z.string().url({ message: 'Invalid URL format' }).nonempty({ message: 'Redirect URL is required' })
})

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Send a reset password email
 *     description: Sends a reset password email to the user with a token to reset their password.
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
 *               - redirectUrl
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               redirectUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/reset-password"
 *     responses:
 *       200:
 *         description: Email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email sent successfully"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
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
    const { email, redirectUrl } = parsedData

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY!, { expiresIn: '1h' })
    const resetUrl = `${redirectUrl}?token=${token}`

    await sendEmail({
      to: email,
      subject: 'Reset Password',
      html: `
        <p>Click the link below to reset your password</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `
    })

    res.status(200).json({ message: 'Email sent successfully' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors })
    }

    console.error(error)

    res.status(500).json({ message: 'Something went wrong' })
  }
}
