type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export default function AnalyticsPage({ user }: { user: User }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Estadísticas y métricas de tu aplicación
        </p>
      </div>

      {/* Chart Placeholder */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Visitas por Día</h2>
          <div className="h-64 flex items-center justify-center bg-muted/30 rounded-md">
            <p className="text-muted-foreground">Gráfico de visitas</p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Usuarios por País</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>España</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "65%" }}></div>
                </div>
                <span className="text-sm font-medium">65%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>México</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "25%" }}></div>
                </div>
                <span className="text-sm font-medium">25%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Argentina</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "10%" }}></div>
                </div>
                <span className="text-sm font-medium">10%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Páginas Vistas
          </h3>
          <div className="text-3xl font-bold">24,567</div>
          <p className="text-sm text-muted-foreground mt-2">
            +12.5% vs mes anterior
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Tiempo Promedio
          </h3>
          <div className="text-3xl font-bold">3:42</div>
          <p className="text-sm text-muted-foreground mt-2">
            +8.2% vs mes anterior
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Tasa de Rebote
          </h3>
          <div className="text-3xl font-bold">42%</div>
          <p className="text-sm text-muted-foreground mt-2">
            -5.1% vs mes anterior
          </p>
        </div>
      </div>

      {/* Top Pages */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Páginas Más Visitadas</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-md hover:bg-accent transition-colors">
            <div>
              <p className="font-medium">/dashboard</p>
              <p className="text-sm text-muted-foreground">8,234 visitas</p>
            </div>
            <span className="text-sm text-muted-foreground">33.5%</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-md hover:bg-accent transition-colors">
            <div>
              <p className="font-medium">/users</p>
              <p className="text-sm text-muted-foreground">5,123 visitas</p>
            </div>
            <span className="text-sm text-muted-foreground">20.8%</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-md hover:bg-accent transition-colors">
            <div>
              <p className="font-medium">/settings</p>
              <p className="text-sm text-muted-foreground">3,456 visitas</p>
            </div>
            <span className="text-sm text-muted-foreground">14.1%</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-md hover:bg-accent transition-colors">
            <div>
              <p className="font-medium">/analytics</p>
              <p className="text-sm text-muted-foreground">2,891 visitas</p>
            </div>
            <span className="text-sm text-muted-foreground">11.8%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

