# Loly Office - Virtual Office

Una oficina virtual 2D con Canvas donde múltiples usuarios pueden moverse, interactuar con objetos y chatear mediante globos de diálogo en tiempo real usando WebSockets.

## Características

- 🎮 **Oficina Virtual 2D**: Canvas HTML5 nativo para renderizado de la oficina y personajes
- 👥 **Multi-usuario en tiempo real**: WebSockets con Loly Framework para sincronización
- 💬 **Chat con globos de diálogo**: Mensajes aparecen sobre los personajes
- 🎨 **Sistema de sprites**: Soporte para sprites de personajes y objetos (con fallback a formas simples)
- 🔐 **Autenticación simple**: Login con nombre o entrada anónima (Anonymous0001, etc.)
- 🎯 **Colisiones**: Sistema de detección de colisiones con objetos y paredes
- ⌨️ **Controles**: WASD o flechas para movimiento

## Tecnologías

- **Loly Framework**: Framework full-stack React con WebSockets
- **Canvas 2D API**: Renderizado nativo sin librerías adicionales
- **TypeScript**: Type safety completo
- **Tailwind CSS**: Estilos modernos
- **Socket.IO**: Comunicación en tiempo real (via Loly Framework)

## Getting Started

### Prerequisites

- Node.js 18+
- npm o pnpm

### Installation

1. Instalar dependencias:

```bash
npm install
```

2. Iniciar servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

### Build para Producción

```bash
npm run build
npm start
```

## Uso

1. **Entrar a la oficina**: 
   - Ingresa tu nombre o haz clic en "Enter as Anonymous" para un nombre automático
   
2. **Moverse**:
   - Usa **WASD** o **flechas del teclado** para mover tu personaje
   
3. **Chatear**:
   - Escribe un mensaje en el input inferior y presiona Enter
   - Los mensajes aparecen como globos sobre los personajes
   
4. **Interactuar**:
   - Click en objetos interactuables (escritorios, sillas) para interactuar

## Estructura del Proyecto

```
loly-office/
├── app/
│   ├── page.tsx                    # Página principal
│   ├── api/user/login/route.ts     # API para login/anónimo
│   └── wss/office/events.ts        # WebSocket events
├── components/
│   ├── office/
│   │   └── OfficeCanvas.tsx        # Componente principal del canvas
│   └── shared/
│       └── UserLogin.tsx           # Componente de login
├── lib/office/
│   ├── types.ts                    # TypeScript types
│   ├── constants.ts                # Constantes y configuración
│   └── utils.ts                    # Utilidades (colisiones, carga de sprites)
└── public/sprites/                 # Sprites (opcional)
    ├── characters/                 # Sprites de personajes
    └── office/                     # Sprites del escenario
```

## Sprites

El proyecto soporta sprites pero funciona sin ellos usando formas simples (círculos para personajes, rectángulos para objetos).

Para agregar sprites:
1. Coloca las imágenes PNG en `public/sprites/`
2. Referencia las rutas en `lib/office/constants.ts` → `SPRITE_PATHS`

## Configuración WebSocket

La configuración de WebSocket está en `loly.config.ts`:
- Desarrollo: `allowedOrigins: "*"` (permisivo)
- Producción: Configurar dominios específicos

## Eventos WebSocket

Todos los eventos usan nombres en **lowercase** (requisito de Loly Framework):

- `player_join`: Unirse a la oficina
- `player_move`: Actualizar posición (x, y)
- `player_chat`: Enviar mensaje de chat
- `object_interact`: Interactuar con objeto
- `office_state`: Estado inicial de la oficina (recibido por nuevos jugadores)
- `player_joined`: Notificación de nuevo jugador (broadcast)
- `player_leave`: Notificación de jugador que se fue (broadcast)

## Desarrollo

### Agregar nuevos objetos

Edita `lib/office/constants.ts` → `DEFAULT_OFFICE_OBJECTS` para agregar nuevos objetos a la oficina.

### Personalizar oficina

Modifica el layout editando `DEFAULT_OFFICE_OBJECTS` en `lib/office/constants.ts`.

## Licencia

ISC
