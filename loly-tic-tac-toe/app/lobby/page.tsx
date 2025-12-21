import { useEffect, useState } from "react";
import { useRouter } from "@lolyjs/core/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RoomList } from "@/components/lobby/RoomList";
import { useGameSocket } from "@/lib/game-socket";
import { Gamepad2, Users, Bot, RefreshCw, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LobbyPage() {
  const router = useRouter();
  const {
    isConnected,
    availableRooms,
    room,
    error,
    createRoom,
    joinRoom,
    listRooms,
  } = useGameSocket();
  const [loading, setLoading] = useState(false);
  const [timeoutError, setTimeoutError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected) {
      listRooms();
    }
  }, [isConnected, listRooms]);

  // Timeout to reset loading if no response after 5 seconds
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        setLoading(false);
        setTimeoutError("Request timed out. Please try again.");
      }, 5000);
      return () => clearTimeout(timeout);
    } else {
      setTimeoutError(null);
    }
  }, [loading]);

  // Redirect to game when room is created/joined
  // Only redirect if we're not already on a game page and the room was just created/joined
  useEffect(() => {
    if (room?.roomId && loading) {
      // Only redirect if we were in the process of creating/joining (loading is true)
      // This prevents auto-redirect when other players create rooms
      setLoading(false);
      setTimeoutError(null);
      router.push(`/game/${room.roomId}`);
    }
  }, [room, router, loading]);

  // Reset loading on error
  useEffect(() => {
    if (error) {
      setLoading(false);
    }
  }, [error]);

  const handleCreateRoom = () => {
    setLoading(true);
    setTimeoutError(null);
    createRoom(false);
  };

  const handlePlayVsBot = () => {
    setLoading(true);
    setTimeoutError(null);
    createRoom(true);
  };

  const handleJoinRoom = (roomId: string) => {
    setLoading(true);
    setTimeoutError(null);
    joinRoom(roomId);
  };

  const handleLogout = () => {
    // Clear cookie and redirect to home
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-accent/10 to-transparent opacity-60" />
      
      <div className="relative container mx-auto px-6 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/90 to-primary shadow-lg shadow-primary/20 mb-4">
            <Gamepad2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
            Game Lobby
          </h1>
          <p className="text-muted-foreground">
            Create a room or join an existing game
          </p>
        </div>

        {/* Connection Status */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              isConnected ? "bg-green-500" : "bg-red-500"
            )}
          />
          <span className="text-sm text-muted-foreground">
            {isConnected ? "Connected" : "Connecting..."}
          </span>
        </div>

        {(error || timeoutError) && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-center">
            {error || timeoutError}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="hover:bg-accent/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Create Room
              </CardTitle>
              <CardDescription>
                Create a room and wait for another player to join
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleCreateRoom}
                disabled={!isConnected || loading}
                className="w-full"
                size="lg"
              >
                {loading ? "Creating..." : "Create Room"}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:bg-accent/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Play vs Bot
              </CardTitle>
              <CardDescription>
                Start a game immediately against an AI opponent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handlePlayVsBot}
                disabled={!isConnected || loading}
                className="w-full"
                size="lg"
                variant="secondary"
              >
                {loading ? "Starting..." : "Play vs Bot"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Available Rooms */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Available Rooms
                </CardTitle>
                <CardDescription>
                  Join a room waiting for players
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => listRooms()}
                disabled={!isConnected}
                aria-label="Refresh rooms"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <RoomList
              rooms={availableRooms}
              onJoinRoom={handleJoinRoom}
              loading={!isConnected}
            />
          </CardContent>
        </Card>

        {/* Logout Button */}
        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-muted-foreground"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Change Name
          </Button>
        </div>
      </div>
    </main>
  );
}

