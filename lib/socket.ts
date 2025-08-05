// lib/socket.ts
import { Server as IOServer } from "socket.io";
import type { Server as HTTPServer } from "http";

let io: IOServer | undefined;

/**
 * Инициализирует io на переданном http-сервере
 * (вызывается один раз из pages/api/socket.ts)
 */
export const initIO = (httpServer: HTTPServer) => {
  if (!io) {
    io = new IOServer(httpServer, { path: "/api/socket" });
    console.log("🛎  Socket.io initialised");
  }
  return io;
};

/** Получить уже созданный экземпляр (используют App-роуты) */
export const getIO = () => io;
