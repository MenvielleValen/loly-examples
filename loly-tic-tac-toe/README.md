# Loly Tic Tac Toe Example

A real-time Tic Tac Toe game built with [Loly Framework](https://loly.dev/), demonstrating production-ready WebSocket communication, game rooms, bot opponents, and real-time multiplayer gameplay.

## Features Demonstrated

- 🔌 **WebSocket Integration** - Real-time bidirectional communication using Socket.IO with rooms
- 🎮 **Game Rooms** - Create and join game rooms for multiplayer matches
- 🤖 **Bot Opponent** - Play against an AI opponent using the Minimax algorithm
- 🔐 **Authentication** - Cookie-based user authentication with middleware
- ⚡ **Server-Side Rendering** - SSR with server hooks for data fetching
- 🎨 **Modern UI** - Tailwind CSS v4 with dark mode support
- 📡 **API Routes** - RESTful API endpoints with validation
- 🛡️ **Security** - Rate limiting, CORS, and secure cookie handling
- ✨ **Real-time Updates** - Live game state synchronization across all players

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+ (recommended) or npm/yarn

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:3000`.

### Build for Production

```bash
pnpm build
pnpm start
```

## Project Structure

```
loly-tic-tac-toe/
├── app/
│   ├── api/              # API routes (user setup)
│   ├── game/             # Game page with dynamic room routes
│   ├── lobby/            # Lobby page for room selection
│   ├── wss/              # WebSocket routes (game events)
│   ├── layout.tsx        # Root layout
│   ├── layout.server.hook.ts  # Layout server-side data
│   ├── page.tsx          # Home page (user name entry)
│   └── styles.css        # Global styles
├── components/
│   ├── game/             # Game-specific components (Board, PlayerInfo, WinnerAnimation)
│   ├── shared/           # Shared components (ThemeSwitch)
│   └── ui/               # Reusable UI components
└── lib/                  # Utility functions (game logic, socket hook)
```

## Key Implementation Details

### WebSocket Events

Real-time game events are handled through WebSocket routes with authentication and validation:

```typescript
// app/wss/game/events.ts
export default defineWssRoute({
  auth: async (ctx) => {
    // Authentication logic
  },
  events: {
    createroom: {
      schema: z.object({ bot: z.boolean() }),
      handler: (ctx) => {
        // Create game room logic
      },
    },
    makemove: {
      schema: z.object({ position: z.number() }),
      handler: (ctx) => {
        // Handle game move logic
      },
    },
  },
});
```

### Game Rooms

- **Create Room**: Players can create new game rooms
- **Join Room**: Players can join existing rooms waiting for opponents
- **Bot Mode**: If no rooms are available, players can play against an AI bot
- **Real-time Sync**: All game state changes are broadcast to all players in the room

### Authentication Flow

User authentication is handled via cookies with middleware:

- Setup: `POST /api/user/setup` - Creates authenticated session with name and ID
- Middleware: Validates user on each request via `layout.server.hook.ts`

### Game Logic

The game uses a Minimax algorithm for the bot opponent, ensuring optimal gameplay:

- **Minimax Algorithm**: The bot uses the Minimax algorithm to make optimal moves
- **Win Detection**: Checks for wins, draws, and game state
- **Turn Management**: Enforces turn-based gameplay with real-time updates

## Learn More

- [Loly Framework Documentation](https://loly.dev/)
- [Loly Framework GitHub](https://github.com/MenvielleValen/loly-framework)
- [Example Source Code](https://github.com/MenvielleValen/loly-examples/tree/main/loly-tic-tac-toe)

## License

ISC
