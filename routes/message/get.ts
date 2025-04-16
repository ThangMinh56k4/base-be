import { Request, Response } from 'express'
import { z } from 'zod'

import prisma from '@root/database'
import { generatePaginationQueryParams } from '@root/utils'

const messageQuerySchema = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(10),
  orderBy: z.enum(['createdAt', 'updatedAt']).optional().default('createdAt'),
  orderDirection: z.enum(['asc', 'desc']).optional().default('desc')
})

/**
 * @swagger
 * /messages:
 *   get:
 *     summary: Retrieve a list of messages
 *     tags: [Messages]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of messages per page
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt]
 *           default: createdAt
 *         description: Field to order by
 *       - in: query
 *         name: orderDirection
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Order direction
 *     responses:
 *       200:
 *         description: A list of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       content:
 *                         type: string
 *                       senderId:
 *                         type: integer
 *                       receiverId:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       sender:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           email:
 *                             type: string
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
 *                 error:
 *                   type: object
 */
export const getMessages = async (req: Request, res: Response) => {
  try {
    const pagination = generatePaginationQueryParams(req)

    const { page, limit, orderBy, orderDirection } = messageQuerySchema.parse(pagination)

    const skip = (page - 1) * limit

    const messages = await prisma.message.findMany({
      skip,
      take: limit,
      orderBy: {
        [orderBy]: orderDirection
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            color: true,
            picture: true,
          }
        }
      }
    })

    const totalMessages = await prisma.message.count()

    res.status(200).json({
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalMessages / limit)
      },
      data: (messages || []).reverse()
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors })
    }

    res.status(500).json({ message: 'Error retrieving messages', error })
  }
}
