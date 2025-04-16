import { Request } from 'express'
import { Socket, Server } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'

import { UserPayload } from '@root/types'

declare module 'express-serve-static-core' {
  interface Request {
    user: UserPayload
  }
}

interface CustomSocket extends Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap> {
  user?: UserPayload;
}

declare global {
  namespace Express {
    interface Application {
      get(name: 'socketio'): Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
    }
  }
}
