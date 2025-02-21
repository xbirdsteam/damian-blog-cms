"use client";

import { Button } from "@/components/ui/button";
import { AddAdminDialog } from "@/components/users/add-admin-dialog";
import { EditUserDialog } from "@/components/users/edit-user-dialog";
import { UsersTable } from "@/components/users/users-table";
import { UsersTableSkeleton } from "@/components/users/users-skeleton";
import { useUsers } from "@/hooks/use-users";
import { User } from "@/services/user-service";
import { UserPlus } from "lucide-react";
import { useState } from "react";

export default function Users() {
  const { users, isLoading, refetch } = useUsers();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  if (isLoading) {
    return <UsersTableSkeleton />;
  }

  return (
    <div className="p-8">
      <div className="rounded-lg border bg-card">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-end">
            <Button onClick={() => setAddDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Admin
            </Button>
          </div>

          <div className="border rounded-lg">
            <UsersTable users={users} onEdit={handleEditUser} />
          </div>
        </div>
      </div>

      <EditUserDialog
        user={selectedUser}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={refetch}
      />

      <AddAdminDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={refetch}
      />
    </div>
  );
} 