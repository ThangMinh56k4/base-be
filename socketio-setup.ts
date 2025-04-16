import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

import type { CustomSocket, UserPayload } from '@root/types'

dotenv.config()

const initSocket = (httpServer: HTTPServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    },
    transports: ['websocket']
  })

  io.use((socket: CustomSocket, next) => {
    const token = socket.handshake.auth.token

    if (!token) {
      return next(new Error('Authentication error'))
    }

    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY!) as UserPayload
      socket.user = decoded
      next()
    } catch (error) {
      return next(new Error('Authentication error'))
    }
  })

  io.on('connection', (socket: CustomSocket) => {
    console.log(`User ${socket.user?.name} connected`)

    socket.on('chatMessage', msg => {
      io.emit('chatMessage', { user: socket.user?.username, msg })
    })
  })

  return io
}

export default initSocket
