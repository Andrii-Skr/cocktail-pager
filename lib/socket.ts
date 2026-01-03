// lib/socket.ts

import type { Server as HTTPServer } from "node:http"
import { Server as IOServer } from "socket.io"

declare global {
  // единая точка хранения во всём Node-процессе
  // (ключ с подчёркиванием, чтобы не столкнуться с чужими либами)
  var _io: IOServer | undefined
}

export const initIO = (httpServer: HTTPServer) => {
  if (!global._io) {
    global._io = new IOServer(httpServer, { path: "/api/socket" })
    console.log("🛎  Socket.IO initialised")
  }
  return global._io
}

export const getIO = () => global._io
