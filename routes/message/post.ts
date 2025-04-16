import { Request, Response } from 'express'
import { z } from 'zod'

import prisma from '@root/database'

const messageSchema = z.object({
  content: z.string().nonempty({ message: 'Message is required' })
})

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Create a new message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Hello, world!"
 *     responses:
 *       200:
 *         description: The created message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 content:
 *                   type: string
 *                 senderId:
 *                   type: integer
 *                 receiverId:
 *                   type: integer
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Validation error
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
 *                       message:
 *                         type: string
 *                       path:
 *                         type: array
 *                         items:
 *                           type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
export default async (req: Request, res: Response) => {
  try {
    const { content } = messageSchema.parse(req.body)

    const user = req.user

    const message = await prisma.message.create({
      data: {
        content,
        senderId: user.id,
        receiverId: user.id
      }
    })

    const io = req.app.get('socketio')

    io.emit('new_message', {
      ...message,
      sender: user
    })

    res.json(message)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors })
    }

    res.status(500).json({ message: 'Something went wrong' })
  }
}
