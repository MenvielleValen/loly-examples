import { useState, useEffect, useCallback } from "react";
import { lolySocket } from "@lolyjs/core/sockets";
import type { Socket } from "socket.io-client";
import type { Board } from "./game-logic";

export interface GameRoom {
  roomId: string;
  players: Array<{ id: string; name: string; symbol: "X" | "O" }>;
  board: Board;
  currentPlayer: "X" | "O";
  status: "waiting" | "playing" | "finished";
  winner: "X" | "O" | "draw" | null;
  bot: boolean;
  createdAt: number;
}

export interface AvailableRoom {
  roomId: string;
  players: number;
  playerName: string;
  bot: boolean;
}

interface UseGameSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  room: GameRoom | null;
  availableRooms: AvailableRoom[];
  error: string | null;
  createRoom: (bot?: boolean) => void;
  joinRoom: (roomId: string) => void;
  makeMove: (roomId: string, position: number) => void;
  leaveRoom: (roomId: string) => void;
  listRooms: () => void;
  getGameState: (roomId: string) => void;
  resetGame: (roomId: string) => void;
}

export function useGameSocket(): UseGameSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ws = lolySocket("/game", {});

    setSocket(ws);
    setIsConnected(false);

    ws.on("connect", () => {
      setIsConnected(true);
      setError(null);
    });

    ws.on("disconnect", () => {
      setIsConnected(false);
    });

    ws.on("__loly:error", (err: { code: string; message: string }) => {
      setError(err.message);
    });

    ws.on("roomcreated", (data: { roomId: string; room: GameRoom }) => {
      setRoom(data.room);
      setError(null);
    });

    ws.on("playerjoined", (data: { room: GameRoom }) => {
      setRoom(data.room);
      setError(null);
    });

    ws.on("movemade", (data: { room: GameRoom }) => {
      setRoom(data.room);
      setError(null);
    });

    ws.on("gamestate", (data: { room: GameRoom }) => {
      setRoom(data.room);
      setError(null);
    });

    ws.on("roomlist", (data: { rooms: AvailableRoom[] }) => {
      setAvailableRooms(data.rooms);
    });

    ws.on("roomlistupdated", (data: { rooms: AvailableRoom[] }) => {
      setAvailableRooms(data.rooms);
      // Don't update room state when room list updates - only update available rooms
      // This prevents auto-redirect in lobby when other players create rooms
    });

    ws.on("playerleft", (data: { room: GameRoom }) => {
      setRoom(data.room);
    });

    return () => {
      ws.close();
    };
  }, []);

  const createRoom = useCallback(
    (bot: boolean = false) => {
      if (socket && socket.connected) {
        socket.emit("createroom", {
          bot: bot,
        });
      }
    },
    [socket]
  );

  const joinRoom = useCallback(
    (roomId: string) => {
      if (socket && socket.connected) {
        socket.emit("joinroom", { roomId });
      }
    },
    [socket]
  );

  const makeMove = useCallback(
    (roomId: string, position: number) => {
      if (socket && socket.connected) {
        socket.emit("makemove", { roomId, position });
      }
    },
    [socket]
  );

  const leaveRoom = useCallback(
    (roomId: string) => {
      if (socket && socket.connected) {
        socket.emit("leaveroom", { roomId });
      }
    },
    [socket]
  );

  const listRooms = useCallback(() => {
    if (socket && socket.connected) {
      socket.emit("listrooms", {});
    }
  }, [socket]);

  const getGameState = useCallback(
    (roomId: string) => {
      if (socket && socket.connected) {
        socket.emit("getgamestate", { roomId });
      }
    },
    [socket]
  );

  const resetGame = useCallback(
    (roomId: string) => {
      if (socket && socket.connected) {
        socket.emit("resetgame", { roomId });
      }
    },
    [socket]
  );

  return {
    socket,
    isConnected,
    room,
    availableRooms,
    error,
    createRoom,
    joinRoom,
    makeMove,
    leaveRoom,
    listRooms,
    getGameState,
    resetGame,
  };
}

