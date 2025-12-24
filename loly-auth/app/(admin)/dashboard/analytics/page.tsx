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
          Statistics and metrics for your application
        </p>
      </div>

      {/* Chart Placeholder */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Visits per Day</h2>
          <div className="h-64 flex items-center justify-center bg-muted/30 rounded-md">
            <p className="text-muted-foreground">Visits chart</p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Users by Country</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>United States</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "65%" }}></div>
                </div>
                <span className="text-sm font-medium">65%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>United Kingdom</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "25%" }}></div>
                </div>
                <span className="text-sm font-medium">25%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Canada</span>
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
            Page Views
          </h3>
          <div className="text-3xl font-bold">24,567</div>
          <p className="text-sm text-muted-foreground mt-2">
            +12.5% vs last month
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Average Time
          </h3>
          <div className="text-3xl font-bold">3:42</div>
          <p className="text-sm text-muted-foreground mt-2">
            +8.2% vs last month
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Bounce Rate
          </h3>
          <div className="text-3xl font-bold">42%</div>
          <p className="text-sm text-muted-foreground mt-2">
            -5.1% vs last month
          </p>
        </div>
      </div>

      {/* Top Pages */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Most Visited Pages</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-md hover:bg-accent transition-colors">
            <div>
              <p className="font-medium">/dashboard</p>
              <p className="text-sm text-muted-foreground">8,234 visits</p>
            </div>
            <span className="text-sm text-muted-foreground">33.5%</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-md hover:bg-accent transition-colors">
            <div>
              <p className="font-medium">/users</p>
              <p className="text-sm text-muted-foreground">5,123 visits</p>
            </div>
            <span className="text-sm text-muted-foreground">20.8%</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-md hover:bg-accent transition-colors">
            <div>
              <p className="font-medium">/settings</p>
              <p className="text-sm text-muted-foreground">3,456 visits</p>
            </div>
            <span className="text-sm text-muted-foreground">14.1%</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-md hover:bg-accent transition-colors">
            <div>
              <p className="font-medium">/analytics</p>
              <p className="text-sm text-muted-foreground">2,891 visits</p>
            </div>
            <span className="text-sm text-muted-foreground">11.8%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

