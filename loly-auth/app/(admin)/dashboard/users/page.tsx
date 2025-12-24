type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export default function UsersPage({ user }: { user: User }) {
  // Example data
  const users = [
    { id: "1", name: "John Doe", email: "john@example.com", role: "Admin", status: "Active", lastLogin: "2 hours ago" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", role: "User", status: "Active", lastLogin: "1 day ago" },
    { id: "3", name: "Bob Johnson", email: "bob@example.com", role: "User", status: "Inactive", lastLogin: "1 week ago" },
    { id: "4", name: "Alice Williams", email: "alice@example.com", role: "Editor", status: "Active", lastLogin: "3 hours ago" },
    { id: "5", name: "Charlie Brown", email: "charlie@example.com", role: "User", status: "Active", lastLogin: "5 minutes ago" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-2">
            Manage all system users
          </p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
          + New User
        </button>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium">User</th>
                <th className="text-left p-4 font-medium">Email</th>
                <th className="text-left p-4 font-medium">Role</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Last Access</th>
                <th className="text-right p-4 font-medium">Actions</th>
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
                        u.status === "Active"
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
                      <button className="text-sm text-primary hover:underline">Edit</button>
                      <button className="text-sm text-destructive hover:underline">Delete</button>
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
          Showing 1-5 of {users.length} users
        </p>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-border rounded-md hover:bg-accent transition-colors">
            Previous
          </button>
          <button className="px-3 py-1 border border-border rounded-md hover:bg-accent transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

