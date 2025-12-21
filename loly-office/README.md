# Loly Office Example

A real-time virtual office built with [Loly Framework](https://loly.dev/), demonstrating Phaser 3 integration, WebSocket communication, and real-time multiplayer features.

## Features Demonstrated

- 🎮 **Phaser 3 Integration** - 2D game engine with Matter.js physics for smooth character movement and collision detection
- 👥 **Real-time Multiplayer** - WebSocket synchronization for multiple users with position and animation sync
- 💬 **Chat System** - In-game chat bubbles above player avatars
- 🎨 **Sprite Animations** - Character animations with walk/idle states (up, down, left, right)
- 🔐 **Simple Authentication** - Cookie-based user sessions with anonymous support
- 🗺️ **Tilemap Rendering** - Tiled map integration with collision detection
- 🪑 **Interactive Objects** - Sit/stand on chairs with position synchronization

## Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
loly-office/
├── app/
│   ├── api/user/login/    # User authentication API
│   ├── wss/office/        # WebSocket events for real-time sync
│   ├── layout.tsx         # Root layout with theme provider
│   ├── page.tsx           # Main page with login/office view
│   └── styles.css         # Global styles
├── components/
│   ├── office/            # Phaser game component
│   │   └── OfficeCanvas.tsx
│   ├── shared/            # Shared components
│   │   ├── UserLogin.tsx
│   │   └── theme-switch.tsx
│   └── ui/                # Reusable UI components
├── lib/
│   ├── phaser/            # Phaser configuration and scenes
│   │   ├── config.ts      # Phaser game configuration
│   │   ├── PhaserGame.ts  # Phaser game wrapper
│   │   └── scenes/
│   │       └── OfficeScene.ts  # Main game scene
│   └── office/            # Office game logic
│       ├── types.ts       # TypeScript types
│       ├── constants.ts   # Game constants
│       └── utils.ts       # Utility functions
└── public/assets/         # Game assets
    ├── characters/        # Character spritesheets
    ├── tilemap.json       # Tiled map data
    └── music/             # Background music and sounds
```

## Key Implementation Details

### Phaser Integration

The project uses Phaser 3 with Matter.js physics for smooth character movement and collision detection. The integration demonstrates:

- **Dynamic imports** to avoid SSR issues with browser-only libraries
- **Matter.js physics** for realistic movement and collisions
- **Sprite animations** with frame-based animation system
- **Tilemap rendering** with multiple layers and collision detection
- **Camera following** for smooth player tracking

### WebSocket Events

Real-time synchronization through Loly Framework WebSocket routes:

- `player_join` - Join the office and receive initial state
- `player_move` - Position updates with animation synchronization
- `player_chat` - Chat messages displayed as bubbles above players
- `player_sit` - Sit/stand on chairs with position updates
- `office_state` - Initial state broadcast to new players
- `player_joined` - Notification when a new player joins
- `player_leave` - Notification when a player disconnects

### Assets

- **Tilemaps**: Tiled JSON format (`public/assets/tilemap.json`)
- **Sprites**: Character spritesheets with 64x64 frame size
  - `luis/walk.png` and `luis/dance.png`
  - `sofia/walk.png` and `sofia/dance.png`
- **Music**: Background music and sound effects in `public/music/`

### Controls

- **WASD** or **Arrow Keys** - Move character
- **E** - Sit/stand on nearby chairs
- **Type in chat input** - Send chat messages

## Technical Highlights

### SSR-Safe Phaser Loading

Phaser is loaded dynamically to avoid server-side rendering issues:

```typescript
// Dynamic import in useEffect
const { PhaserGame } = await import("@/lib/phaser/PhaserGame");
const game = new PhaserGame();
await game.init("phaser-container");
```

### Animation Synchronization

Player animations are synchronized across all clients:

- Local player animations are sent via WebSocket
- Remote players receive and play the correct animation
- Idle states are maintained based on last facing direction

### Interpolation

Remote player movement uses interpolation for smooth transitions:

- Position updates are interpolated between server updates
- Reduces jitter and provides smooth movement
- Optimized depth updates for performance

## Learn More

- [Loly Framework Documentation](https://loly.dev/)
- [Loly Framework GitHub](https://github.com/MenvielleValen/loly-framework)
- [Phaser 3 Documentation](https://phaser.io/)
- [Matter.js Documentation](https://brm.io/matter-js/)

## Attribution

This is an implementation of [CondorCoders Café Virtual](https://github.com/CondorCoders/cafe) in [Loly Framework](https://loly.dev/) 💜

## License

ISC
