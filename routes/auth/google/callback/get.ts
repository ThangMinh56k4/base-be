import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import dotenv from 'dotenv'

import prisma from '@root/database'
import { getGoogleAccessToken, getGoogleUser } from '@root/services/google'
import { getRandomColor } from '@root/utils'

dotenv.config()

const loginSchema = z.object({
  code: z.string().nonempty({ message: 'Code is required' })
})

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth2 Callback
 *     description: |
 *       Handles the Google OAuth2 callback. Exchanges the authorization code for an access token, fetches user information from Google, then finds or creates the user in the database.
 *       Finally, it issues a JWT and redirects to the client with the token.
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         description: Authorization code returned from Google after user consents.
 *         schema:
 *           type: string
 *           example: "4/0AY0e-g7I2aXg..."
 *     responses:
 *       302:
 *         description: Redirects to client with JWT token as query param.
 *         headers:
 *           Location:
 *             description: Client redirect URL with token
 *             schema:
 *               type: string
 *               example: "http://localhost:3000/auth/success?token=eyJhbGciOi..."
 *       400:
 *         description: Validation error (e.g. missing code)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Code is required"
 *       500:
 *         description: Server error during the OAuth process
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
    const { code } = await loginSchema.parseAsync(req.query)

    const accessToken = await getGoogleAccessToken({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!
    })

    const googleUser = await getGoogleUser(accessToken)

    let user = await prisma.user.findUnique({
      where: { googleId: googleUser.sub }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.sub,
          color: getRandomColor(),
          picture: googleUser.picture || ''
        }
      })
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        name: user.name || '',
        color: user.color,
        picture: user.picture
      },
      process.env.SECRET_KEY!,
      { expiresIn: '1d' }
    )

    res.redirect(`${process.env.FRONTEND_REDIRECT_URI}?google_token=${token}`)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Something went wrong' })
  }
}
