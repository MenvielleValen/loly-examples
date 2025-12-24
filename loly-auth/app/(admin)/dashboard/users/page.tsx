type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export default function UsersPage({ user }: { user: User }) {
  // Datos de ejemplo
  const users = [
    { id: "1", name: "Juan Pérez", email: "juan@example.com", role: "Admin", status: "Activo", lastLogin: "Hace 2 horas" },
    { id: "2", name: "María García", email: "maria@example.com", role: "Usuario", status: "Activo", lastLogin: "Hace 1 día" },
    { id: "3", name: "Carlos López", email: "carlos@example.com", role: "Usuario", status: "Inactivo", lastLogin: "Hace 1 semana" },
    { id: "4", name: "Ana Martínez", email: "ana@example.com", role: "Editor", status: "Activo", lastLogin: "Hace 3 horas" },
    { id: "5", name: "Luis Rodríguez", email: "luis@example.com", role: "Usuario", status: "Activo", lastLogin: "Hace 5 minutos" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona todos los usuarios del sistema
          </p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
          + Nuevo Usuario
        </button>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium">Usuario</th>
                <th className="text-left p-4 font-medium">Email</th>
                <th className="text-left p-4 font-medium">Rol</th>
                <th className="text-left p-4 font-medium">Estado</th>
                <th className="text-left p-4 font-medium">Último Acceso</th>
                <th className="text-right p-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium">{u.name}</div>
                  </td>
                  <td className="p-4 text-muted-foreground">{u.email}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        u.status === "Activo"
                          ? "bg-green-500/20 text-green-600 dark:text-green-400"
                          : "bg-gray-500/20 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground text-sm">{u.lastLogin}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button className="text-sm text-primary hover:underline">Editar</button>
                      <button className="text-sm text-destructive hover:underline">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando 1-5 de {users.length} usuarios
        </p>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-border rounded-md hover:bg-accent transition-colors">
            Anterior
          </button>
          <button className="px-3 py-1 border border-border rounded-md hover:bg-accent transition-colors">
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}

