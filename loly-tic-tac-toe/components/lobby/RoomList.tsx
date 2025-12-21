import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Bot } from "lucide-react";
import type { AvailableRoom } from "@/lib/game-socket";

interface RoomListProps {
  rooms: AvailableRoom[];
  onJoinRoom: (roomId: string) => void;
  loading?: boolean;
}

export function RoomList({ rooms, onJoinRoom, loading }: RoomListProps) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading rooms...</p>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No rooms available. Create one to start playing!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rooms.map((room) => (
        <Card
          key={room.roomId}
          className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {room.bot ? (
                <Bot className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Users className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">{room.bot ? "Bot Game" : room.playerName}</p>
                <p className="text-sm text-muted-foreground">
                  {room.players}/2 players
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => onJoinRoom(room.roomId)}
              disabled={room.players >= 2}
            >
              {room.players >= 2 ? "Full" : "Join"}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

