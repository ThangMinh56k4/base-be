import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import dotenv from 'dotenv'

import prisma from '@root/database'
import { getFacebookUser } from '@root/services/facebook'
import { getRandomColor } from '@root/utils'

dotenv.config()

const loginSchema = z.object({
  accessToken: z.string().nonempty({ message: 'Access token is required' })
})

/**
 * @swagger
 * /auth/facebook:
 *    post:
 *      summary: Login with Facebook account
 *      description: Authenticate a user with Facebook. Returns a JWT token if successful.
 *      tags:
 *        - Authentication
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - accessToken
 *              properties:
 *                accessToken:
 *                  type: string
 *                  example: "EAA..."
 *      responses:
 *        200:
 *          description: User authenticated successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  token:
 *                    type: string
 *                    example: "eyJhbGciOiJIUzI1NiIsInR..."
 *        400:
 *          description: Invalid input data
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "Invalid access token"
 *        500:
 *          description: Server error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "Something went wrong"
 */

export default async (req: Request, res: Response) => {
  try {
    const { accessToken } = loginSchema.parse(req.body)

    const fbUser = await getFacebookUser(accessToken)

    if (!fbUser) {
      return res.status(400).json({ message: 'Invalid access token' })
    }

    let user = await prisma.user.findUnique({
      where: { facebookId: fbUser.id }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: fbUser.email || '',
          name: fbUser.name,
          facebookId: fbUser.id,
          color: getRandomColor(),
          picture: fbUser.picture.data.url,
        }
      })
    }

    const token = jwt.sign({
      id: user.id,
      role: user.role,
      name: user.name || '',
      color: user.color,
      picture: user.picture
    }, process.env.SECRET_KEY!, { expiresIn: '1h' })

    res.json({ token })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Something went wrong' })
  }
}
