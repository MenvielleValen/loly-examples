type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export default function DashboardPage({ user }: { user: User }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenido de vuelta, {user.name || user.email}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Usuarios Totales</h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="text-2xl font-bold">1,234</div>
          <p className="text-xs text-muted-foreground">
            +12% desde el mes pasado
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Sesiones Activas</h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
          </div>
          <div className="text-2xl font-bold">456</div>
          <p className="text-xs text-muted-foreground">
            +23% desde el mes pasado
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Solicitudes</h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <path d="M20 8v6"></path>
              <path d="M23 11h-6"></path>
            </svg>
          </div>
          <div className="text-2xl font-bold">89</div>
          <p className="text-xs text-muted-foreground">
            +5 nuevas hoy
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Tasa de Conversión</h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
          </div>
          <div className="text-2xl font-bold">24.8%</div>
          <p className="text-xs text-muted-foreground">
            +2.1% desde el mes pasado
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-border bg-card">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <p className="font-medium">Nuevo usuario registrado</p>
                <p className="text-sm text-muted-foreground">hace 5 minutos</p>
              </div>
              <span className="text-sm text-muted-foreground">user@example.com</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <p className="font-medium">Configuración actualizada</p>
                <p className="text-sm text-muted-foreground">hace 1 hora</p>
              </div>
              <span className="text-sm text-muted-foreground">Sistema</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Backup completado</p>
                <p className="text-sm text-muted-foreground">hace 3 horas</p>
              </div>
              <span className="text-sm text-muted-foreground">Automático</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}