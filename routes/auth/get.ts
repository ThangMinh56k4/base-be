import { Request, Response } from 'express'

import prisma from '@root/database'

/**
 * @swagger
 * /auth/user:
 *   get:
 *     summary: Get authenticated user information
 *     description: Returns the authenticated user's details by decoding the JWT token.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 email:
 *                   type: string
 *                   example: "user@example.com"
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 role:
 *                   type: string
 *                   example: "user"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-01-01T12:00:00Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-01-02T12:00:00Z"
 *       401:
 *         description: Unauthorized or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
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
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userData = await prisma.user.findUnique({ where: { id: user.id } });

    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      color: userData.color,
      picture: userData.picture,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}
