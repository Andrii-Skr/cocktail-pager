import { Server as IOServer } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as HTTPServer } from "http";

export const config = { api: { bodyParser: false } };

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  // явно приводим тип
  const httpServer = (res.socket as any)
    .server as HTTPServer & { io?: IOServer };

  if (!httpServer.io) {
    httpServer.io = new IOServer(httpServer, { path: "/api/socket" });
  }
  res.end();
}
