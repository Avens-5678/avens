import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FolderOpen, Plus, Users, Clock, Trash2, CalendarIcon, ChevronRight, UserPlus } from "lucide-react";
import { format } from "date-fns";

interface EventFolder {
  id: string;
  title: string;
  event_date: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

interface TimelineItem {
  id: string;
  folder_id: string;
  time: string;
  title: string;
  description: string | null;
  assigned_vendor_id: string | null;
  display_order: number;
}

interface FolderMember {
  id: string;
  folder_id: string;
  vendor_id: string;
  role: string;
  service_type: string | null;
}

const EventWorkspace = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFolder, setNewFolder] = useState({ title: "", event_date: "", notes: "" });
  const [newTimeline, setNewTimeline] = useState({ time: "", title: "", description: "" });

  // Fetch folders
  const { data: folders = [], isLoading } = useQuery({
    queryKey: ["event-folders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_folders")
        .select("*")
        .eq("client_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as EventFolder[];
    },
  });

  // Fetch members for selected folder
  const { data: members = [] } = useQuery({
    queryKey: ["folder-members", selectedFolder],
    enabled: !!selectedFolder,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_folder_members")
        .select("*")
        .eq("folder_id", selectedFolder!);
      if (error) throw error;
      return data as FolderMember[];
    },
  });

  // Fetch timeline for selected folder
  const { data: timeline = [] } = useQuery({
    queryKey: ["event-timeline", selectedFolder],
    enabled: !!selectedFolder,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_timeline")
        .select("*")
        .eq("folder_id", selectedFolder!)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as TimelineItem[];
    },
  });

  const createFolder = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("event_folders").insert({
        client_id: user!.id,
        title: newFolder.title,
        event_date: newFolder.event_date || null,
        notes: newFolder.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-folders"] });
      setShowCreateDialog(false);
      setNewFolder({ title: "", event_date: "", notes: "" });
      toast({ title: "Event folder created!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const addTimelineItem = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("event_timeline").insert({
        folder_id: selectedFolder!,
        time: newTimeline.time,
        title: newTimeline.title,
        description: newTimeline.description || null,
        display_order: timeline.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-timeline"] });
      setNewTimeline({ time: "", title: "", description: "" });
      toast({ title: "Timeline item added!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteTimeline = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("event_timeline").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["event-timeline"] }),
  });

  const activeFolder = folders.find((f) => f.id === selectedFolder);

  if (selectedFolder && activeFolder) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setSelectedFolder(null)}>
            ← Back
          </Button>
          <div>
            <h2 className="text-lg font-bold">{activeFolder.title}</h2>
            {activeFolder.event_date && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                {format(new Date(activeFolder.event_date), "dd MMM yyyy")}
              </p>
            )}
          </div>
          <Badge variant={activeFolder.status === "active" ? "default" : "secondary"}>
            {activeFolder.status}
          </Badge>
        </div>

        {/* Vendors / Members */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" /> Team ({members.length} vendors)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No vendors attached yet. Book venues or crew from the marketplace — they'll automatically appear here.
              </p>
            ) : (
              <div className="space-y-2">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between border rounded-lg px-3 py-2">
                    <div>
                      <span className="text-sm font-medium">{m.role}</span>
                      {m.service_type && (
                        <Badge variant="outline" className="ml-2 text-[10px]">{m.service_type}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline / Run of Show */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" /> Run of Show
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {timeline.length > 0 && (
              <div className="space-y-2">
                {timeline.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 border-l-2 border-primary/30 pl-4 py-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {item.time}
                        </span>
                        <span className="text-sm font-medium">{item.title}</span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteTimeline.mutate(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="border rounded-lg p-3 space-y-2 bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground">Add timeline entry</p>
              <div className="flex gap-2">
                <Input
                  placeholder="7:00 PM"
                  className="w-24 text-xs h-8"
                  value={newTimeline.time}
                  onChange={(e) => setNewTimeline((p) => ({ ...p, time: e.target.value }))}
                />
                <Input
                  placeholder="Event (e.g. Dinner served)"
                  className="flex-1 text-xs h-8"
                  value={newTimeline.title}
                  onChange={(e) => setNewTimeline((p) => ({ ...p, title: e.target.value }))}
                />
                <Button
                  size="sm"
                  className="h-8 text-xs"
                  disabled={!newTimeline.time || !newTimeline.title}
                  onClick={() => addTimelineItem.mutate()}
                >
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {activeFolder.notes && (
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">{activeFolder.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Event Workspace</h2>
          <p className="text-sm text-muted-foreground">Your event command center</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> New Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Event Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Input
                placeholder="Event name (e.g. Priya's Wedding)"
                value={newFolder.title}
                onChange={(e) => setNewFolder((p) => ({ ...p, title: e.target.value }))}
              />
              <Input
                type="date"
                value={newFolder.event_date}
                onChange={(e) => setNewFolder((p) => ({ ...p, event_date: e.target.value }))}
              />
              <Textarea
                placeholder="Notes (optional)"
                value={newFolder.notes}
                onChange={(e) => setNewFolder((p) => ({ ...p, notes: e.target.value }))}
                rows={2}
              />
              <Button
                onClick={() => createFolder.mutate()}
                disabled={!newFolder.title || createFolder.isPending}
                className="w-full"
              >
                Create Folder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
      ) : folders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <FolderOpen className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <p className="text-sm text-muted-foreground">No event folders yet</p>
            <p className="text-xs text-muted-foreground">
              Create one to start organizing your vendors, timeline, and guest coordination.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {folders.map((folder) => (
            <Card
              key={folder.id}
              className="cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setSelectedFolder(folder.id)}
            >
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FolderOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{folder.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {folder.event_date ? format(new Date(folder.event_date), "dd MMM yyyy") : "No date set"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={folder.status === "active" ? "default" : "secondary"} className="text-[10px]">
                    {folder.status}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventWorkspace;
