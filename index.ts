import express from 'express'
import nnn from 'nnn-router'
import dotenv from 'dotenv'
import cors from 'cors'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import cookieParser from 'cookie-parser'
import { createServer } from 'http'

import { authMiddleware } from '@root/middleware/auth'

import initSocket from './socketio-setup'

const app = express()
const httpServer = createServer(app)

dotenv.config()

const port = process.env.PORT || 5002
const nnnRouterOptions = { routeDir: '/dist/routes' }
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Training API',
      version: '1.0.0',
      description: 'Training API document'
    },
    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost:5002'
      }
    ]
  },
  apis: ['./routes/**/*.ts']
}
const specs = swaggerJSDoc(swaggerOptions)

app.use(
  cors({
    origin: true,
    credentials: true,
    exposedHeaders: ['X-Total-Count', 'Content-Disposition']
  })
)
app.use(express.json())
app.use(cookieParser())
app.use(authMiddleware)
app.use(nnn(nnnRouterOptions))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

const io = initSocket(httpServer)

app.set('socketio', io)

httpServer.listen(port, () => { 
  console.log(`Listening on port ${port} (http://localhost:${port})`)
})
