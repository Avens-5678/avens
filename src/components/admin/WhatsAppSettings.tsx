import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Settings, Users, RefreshCw } from "lucide-react";

const WhatsAppSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  // Fetch assignment rules
  const { data: rules } = useQuery({
    queryKey: ["whatsapp_assignment_rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_assignment_rules")
        .select("*")
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch employees
  const { data: employees = [] } = useQuery({
    queryKey: ["employees_list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .eq("role", "employee");
      if (error) throw error;
      return data || [];
    },
  });

  const [autoAssign, setAutoAssign] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  useEffect(() => {
    if (rules) {
      setAutoAssign(rules.is_auto_assign || false);
      setSelectedEmployees(rules.eligible_employee_ids || []);
    }
  }, [rules]);

  const toggleEmployee = (userId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSave = async () => {
    if (!rules?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("whatsapp_assignment_rules")
        .update({
          is_auto_assign: autoAssign,
          eligible_employee_ids: selectedEmployees,
        })
        .eq("id", rules.id);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["whatsapp_assignment_rules"] });
      toast({ title: "Settings saved!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <Settings className="h-5 w-5" /> WhatsApp Settings
      </h2>

      {/* Auto-Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Auto-Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Enable Round-Robin Auto-Assignment</p>
              <p className="text-xs text-muted-foreground">
                Automatically assign incoming human-handoff chats to eligible employees
              </p>
            </div>
            <Switch checked={autoAssign} onCheckedChange={setAutoAssign} />
          </div>

          {autoAssign && (
            <div className="space-y-3 pt-2 border-t">
              <p className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" /> Eligible Employees
              </p>
              {employees.length === 0 ? (
                <p className="text-xs text-muted-foreground">No employees found. Add employees in User Management.</p>
              ) : (
                <div className="grid gap-2">
                  {employees.map((emp) => (
                    <button
                      key={emp.user_id}
                      onClick={() => toggleEmployee(emp.user_id)}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        selectedEmployees.includes(emp.user_id)
                          ? "bg-primary/5 border-primary"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                          {(emp.full_name || emp.email)?.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium">{emp.full_name || "No name"}</p>
                          <p className="text-xs text-muted-foreground">{emp.email}</p>
                        </div>
                      </div>
                      {selectedEmployees.includes(emp.user_id) && (
                        <Badge variant="default" className="text-[10px]">Selected</Badge>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connection Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span className="text-sm">Meta WhatsApp Token</span>
            <Badge variant="outline">Configure in Supabase Secrets</Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span className="text-sm">Phone Number ID</span>
            <Badge variant="outline">Configure in Supabase Secrets</Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span className="text-sm">Webhook URL</span>
            <code className="text-xs bg-muted px-2 py-1 rounded break-all">
              https://zbcnepczdenymvfeuoaj.supabase.co/functions/v1/whatsapp-webhook
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppSettings;
