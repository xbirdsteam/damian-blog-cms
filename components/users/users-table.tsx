"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "@/services/user-service";
import { Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
}

export function UsersTable({ users, onEdit }: UsersTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[400px] py-5 pl-6">User</TableHead>
            <TableHead className="w-[400px]">Email</TableHead>
            <TableHead className="w-[100px] pr-6"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="hover:bg-muted/50">
              <TableCell className="py-5 pl-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={user.avatar_url || ""} />
                    <AvatarFallback className="text-base bg-primary/10">
                      {user.fullname?.[0] || user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">
                      {user.fullname || "Unnamed User"}
                    </span>
                    {!user.fullname && (
                      <span className="text-xs text-muted-foreground">
                        No name set
                      </span>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-5">
                <span className="text-sm text-muted-foreground">{user.email}</span>
              </TableCell>
              <TableCell className="py-5 pr-6 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(user)}
                  className="hover:bg-muted w-9 h-9 p-0"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 