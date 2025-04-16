import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import dotenv from 'dotenv'

import { UserPayload } from '@root/types'

import { PUBLIC_ROUTE_REGEX } from '@root/constants'

dotenv.config()

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const isPublicRoute = PUBLIC_ROUTE_REGEX.some((regex) => regex.test(req.path))

  if (isPublicRoute) {
    return next()
  }

  const cookieToken = req.cookies?.['_authToken']

  if (!cookieToken) {
    res.status(401).json({ message: 'Unauthorized, token is required' })

    return
  }

  try {
    const decoded = jwt.verify(cookieToken, process.env.SECRET_KEY!) as UserPayload
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' })

    return
  }
}
