"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchPatrolTeams,
  createPatrolTeam,
  deletePatrolTeam,
  selectPatrolTeams,
  selectPatrolTeamsLoading,
} from "@/lib/store/patrolTeamsSlice";
import { fetchWoredas, selectWoredas } from "@/lib/store/geoSlice";
import { fetchUsers, selectUsers } from "@/lib/store/usersSlice";
import { useAuth } from "@/app/context/auth-context";
import { UserRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Users } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function PatrolTeamsPage() {
  const dispatch = useAppDispatch();
  const teams = useAppSelector(selectPatrolTeams);
  const loading = useAppSelector(selectPatrolTeamsLoading);
  const woredas = useAppSelector(selectWoredas);
  const users = useAppSelector(selectUsers);
  const { user } = useAuth();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedWoredaId, setSelectedWoredaId] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Only Woreda Police Commander can create/manage teams
  const canManageTeams = user?.role === UserRole.POLICE_COMMANDER_WOREDA;
  const isSuperAdmin = user?.role === UserRole.SYSTEM_SUPER_ADMIN || user?.role === UserRole.SYSTEM_ADMIN;

  useEffect(() => {
    dispatch(fetchPatrolTeams());
    dispatch(fetchWoredas());
    dispatch(fetchUsers());
  }, [dispatch]);

  const patrolOfficers = users.filter((u: any) => u.role === "PATROL");

  const handleCreate = async () => {
    if (!name.trim() || !selectedWoredaId) {
      toast.error("Name and Woreda are required");
      return;
    }
    try {
      await dispatch(createPatrolTeam({
        name,
        woredaId: selectedWoredaId,
        memberIds: selectedMemberIds,
      })).unwrap();
      toast.success("Team created");
      setDialogOpen(false);
      setName(""); setSelectedWoredaId(""); setSelectedMemberIds([]);
    } catch (e: any) {
      toast.error(e?.message || "Failed to create team");
    }
  };

  const handleDelete = (id: string) => {
    setConfirmTargetId(id);
    setConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!confirmTargetId) return;
    setConfirmLoading(true);
    try {
      await dispatch(deletePatrolTeam(confirmTargetId)).unwrap();
      toast.success("Team deleted");
      setConfirmOpen(false);
      setConfirmTargetId(null);
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete");
    } finally {
      setConfirmLoading(false);
    }
  };

  const toggleMember = (userId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Patrol Teams</h1>
        {canManageTeams ? (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Team
          </Button>
        ) : (
          <div className="relative group">
            <Button disabled className="opacity-50 cursor-not-allowed">
              <Plus className="mr-2 h-4 w-4" />
              Add Team
            </Button>
            <div className="absolute right-0 top-full mt-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              {isSuperAdmin
                ? "Team creation is restricted to Woreda Police Commander only."
                : "You don't have permission to create patrol teams."}
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-muted-foreground col-span-full">Loading...</p>
        ) : teams.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-8">No teams found</p>
        ) : (
          teams.map((team: any) => (
            <Card key={team.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">{team.name}</CardTitle>
                {canManageTeams ? (
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(team.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                ) : (
                  <div className="relative group">
                    <Button variant="ghost" size="sm" disabled className="opacity-50 cursor-not-allowed">
                      <Trash2 className="h-4 w-4 text-gray-400" />
                    </Button>
                    <div className="absolute right-0 top-full mt-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      Only Woreda Police Commander can delete teams.
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Woreda: {woredas.find((w: any) => w.id === team.woredaId)?.name || "N/A"}
                </p>
                <div className="flex items-center gap-1 text-sm">
                  <Users className="h-4 w-4" />
                  <span>{team.members?.length || 0} members</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Patrol Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Team Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Select value={selectedWoredaId} onValueChange={setSelectedWoredaId}>
              <SelectTrigger><SelectValue placeholder="Select Woreda" /></SelectTrigger>
              <SelectContent>
                {woredas.map((w: any) => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <p className="text-sm font-medium mb-2">Members (optional)</p>
              <div className="max-h-40 overflow-y-auto space-y-1 border rounded p-2">
                {patrolOfficers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No patrol officers available</p>
                ) : (
                  patrolOfficers.map((u: any) => (
                    <label key={u.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedMemberIds.includes(u.id)}
                        onChange={() => toggleMember(u.id)}
                      />
                      {u.fullName || u.name || u.email}
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Patrol Team"
        description="Are you sure you want to delete this team? This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={confirmLoading}
        onConfirm={executeDelete}
      />
    </div>
  );
}
