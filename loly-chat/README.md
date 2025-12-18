# Loly Chat Example

A real-time chat application built with [Loly Framework](https://loly-framework.onrender.com/), demonstrating production-ready WebSocket communication, authentication, and real-time features.

## Features Demonstrated

- 🔌 **WebSocket Integration** - Real-time bidirectional communication using Socket.IO
- 🔐 **Authentication** - Cookie-based user authentication with middleware
- ⚡ **Server-Side Rendering** - SSR with server hooks for data fetching
- 🎨 **Modern UI** - Tailwind CSS v4 with dark mode support
- 📡 **API Routes** - RESTful API endpoints with validation
- 🛡️ **Security** - Rate limiting, CORS, and secure cookie handling

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
loly-chat/
├── app/
│   ├── api/              # API routes (login, logout, health)
│   ├── chat/             # Chat page and layout
│   ├── wss/              # WebSocket routes
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── styles.css        # Global styles
├── components/
│   ├── shared/           # Chat components
│   └── ui/               # Reusable UI components
└── lib/                  # Utility functions
```

## Key Implementation Details

### WebSocket Events

Real-time chat messages are handled through WebSocket routes with authentication and validation:

```typescript
// app/wss/chat/events.ts
export default defineWssRoute({
  auth: async (ctx) => {
    // Authentication logic
  },
  events: {
    message: {
      schema: z.object({ content: z.string() }),
      handler: (ctx) => {
        // Broadcast message to all clients
      },
    },
  },
});
```

### Authentication Flow

User authentication is handled via cookies with middleware:

- Login: `POST /api/user/login` - Creates authenticated session
- Logout: `POST /api/user/logout` - Clears session
- Middleware: Validates user on each request

## Learn More

- [Loly Framework Documentation](https://loly-framework.onrender.com/)
- [Loly Framework GitHub](https://github.com/MenvielleValen/loly-framework)
- [Example Source Code](https://github.com/MenvielleValen/loly-examples/tree/main/loly-chat)

## License

ISC
