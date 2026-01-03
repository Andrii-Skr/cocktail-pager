import type { Server as HTTPServer } from "node:http"
import type { NextApiRequest, NextApiResponse } from "next"
import type { Server as IOServer } from "socket.io"
import { initIO } from "@/lib/socket"

export const config = { api: { bodyParser: false } }

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  // явно приводим тип
  const socket = res.socket as unknown as {
    server: HTTPServer & { io?: IOServer }
  }
  const httpServer = socket.server

  if (!httpServer.io) {
    httpServer.io = initIO(httpServer)
  }
  res.end()
}
