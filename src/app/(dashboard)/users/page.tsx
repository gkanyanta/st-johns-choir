"use client";

import { useState } from "react";
import { useApi } from "@/lib/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageLoading, Spinner } from "@/components/shared/loading";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { UserCog, Plus } from "lucide-react";
import { ROLE_LABELS } from "@/lib/constants";

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
  member: { id: string; firstName: string; lastName: string } | null;
}

interface Member {
  id: string;
  firstName: string;
  lastName: string;
}

interface MembersResponse {
  members: Member[];
}

export default function UsersPage() {
  const { data, loading, error, refetch } = useApi<{ users: User[] }>("/api/users");
  const { data: membersData } = useApi<MembersResponse>("/api/members?limit=100");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    role: "MEMBER",
    memberId: "",
  });

  const handleCreate = async () => {
    setSaving(true);
    setFormError(null);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          memberId: form.memberId || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed to create user" }));
        throw new Error(data.error || "Failed to create user");
      }
      setDialogOpen(false);
      setForm({ email: "", username: "", password: "", role: "MEMBER", memberId: "" });
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (userId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) throw new Error("Failed to update user");
      refetch();
    } catch {
      alert("Failed to update user status");
    }
  };

  if (loading) return <PageLoading />;

  return (
    <div className="space-y-4">
      <PageHeader title="Users" description="Manage user accounts">
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add User
        </Button>
      </PageHeader>

      {/* Add User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>Add a new user account to the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {formError}
              </div>
            )}
            <div className="space-y-2">
              <Label>Username *</Label>
              <Input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="user@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Password *</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {Object.entries(ROLE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Link to Member (Optional)</Label>
              <Select
                value={form.memberId}
                onChange={(e) => setForm({ ...form, memberId: e.target.value })}
              >
                <option value="">-- None --</option>
                {membersData?.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.firstName} {m.lastName}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={saving || !form.username || !form.email || !form.password}
            >
              {saving ? <Spinner className="mr-2" /> : null}
              {saving ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {error && <div className="p-4 text-red-600 text-sm">Error: {error}</div>}

      {data?.users.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title="No users"
          description="Add user accounts to manage the system"
        />
      ) : (
        <div className="space-y-3">
          {data?.users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    {user.member && (
                      <p className="text-xs text-gray-400">
                        Linked: {user.member.firstName} {user.member.lastName}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {ROLE_LABELS[user.role] || user.role}
                    </Badge>
                    <Badge
                      variant={user.isActive ? "success" : "secondary"}
                      className="text-xs"
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(user.id, user.isActive)}
                      className="text-xs h-7"
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
