import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useEmployeePermissions, PermissionCategory } from "@/hooks/useEmployeePermissions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShoppingBag, ClipboardList, Briefcase } from "lucide-react";

interface EmployeePermissionManagerProps {
  employeeId: string;
  employeeName: string;
}

const CATEGORIES: { value: PermissionCategory; label: string; icon: any; description: string }[] = [
  { value: "ecommerce", label: "Ecommerce", icon: ShoppingBag, description: "Rentals, Promo Banners, Trust Strip, Vendor Inventory" },
  { value: "content", label: "Content", icon: ClipboardList, description: "Portfolio, Reviews, Forms, FAQ" },
  { value: "operations", label: "Operations", icon: Briefcase, description: "Event Center, Rental Orders, Event Requests, Quote Maker" },
];

const EmployeePermissionManager = ({ employeeId, employeeName }: EmployeePermissionManagerProps) => {
  const { permissions, isLoading, upsertPermission } = useEmployeePermissions(employeeId);
  const { toast } = useToast();

  const getPermission = (category: PermissionCategory) => {
    return permissions?.find((p) => p.permission_category === category);
  };

  const handleToggle = async (category: PermissionCategory, field: "can_view" | "can_edit", value: boolean) => {
    const existing = getPermission(category);
    try {
      await upsertPermission.mutateAsync({
        employee_id: employeeId,
        permission_category: category,
        can_view: field === "can_view" ? value : existing?.can_view ?? false,
        can_edit: field === "can_edit" ? value : existing?.can_edit ?? false,
      });
      toast({ title: "Permission Updated", description: `${category} ${field.replace("can_", "")} access ${value ? "granted" : "revoked"}.` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return <Loader2 className="h-5 w-5 animate-spin mx-auto" />;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">
          Permissions for <Badge variant="outline">{employeeName}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {CATEGORIES.map((cat) => {
          const perm = getPermission(cat.value);
          const Icon = cat.icon;
          return (
            <div key={cat.value} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{cat.label}</p>
                  <p className="text-xs text-muted-foreground">{cat.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-xs">View</Label>
                  <Switch
                    checked={perm?.can_view ?? false}
                    onCheckedChange={(v) => handleToggle(cat.value, "can_view", v)}
                    disabled={upsertPermission.isPending}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Edit</Label>
                  <Switch
                    checked={perm?.can_edit ?? false}
                    onCheckedChange={(v) => handleToggle(cat.value, "can_edit", v)}
                    disabled={upsertPermission.isPending}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default EmployeePermissionManager;
