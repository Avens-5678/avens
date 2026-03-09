import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PermissionCategory = "ecommerce" | "content" | "operations";

export interface EmployeePermission {
  id: string;
  employee_id: string;
  permission_category: PermissionCategory;
  can_view: boolean;
  can_edit: boolean;
  created_at: string;
  updated_at: string;
}

export const useEmployeePermissions = (employeeId?: string) => {
  const queryClient = useQueryClient();

  const { data: permissions, isLoading } = useQuery({
    queryKey: ["employee_permissions", employeeId],
    queryFn: async () => {
      const query = employeeId
        ? supabase.from("employee_permissions").select("*").eq("employee_id", employeeId)
        : supabase.from("employee_permissions").select("*");
      
      const { data, error } = await query;
      if (error) throw error;
      return data as EmployeePermission[];
    },
    enabled: employeeId !== undefined,
  });

  const upsertPermission = useMutation({
    mutationFn: async ({
      employee_id,
      permission_category,
      can_view,
      can_edit,
    }: {
      employee_id: string;
      permission_category: PermissionCategory;
      can_view: boolean;
      can_edit: boolean;
    }) => {
      const { error } = await supabase
        .from("employee_permissions")
        .upsert(
          { employee_id, permission_category, can_view, can_edit },
          { onConflict: "employee_id,permission_category" }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee_permissions"] });
    },
  });

  const removePermission = useMutation({
    mutationFn: async ({
      employee_id,
      permission_category,
    }: {
      employee_id: string;
      permission_category: PermissionCategory;
    }) => {
      const { error } = await supabase
        .from("employee_permissions")
        .delete()
        .eq("employee_id", employee_id)
        .eq("permission_category", permission_category);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee_permissions"] });
    },
  });

  const hasPermission = (category: PermissionCategory, type: "view" | "edit" = "view") => {
    const perm = permissions?.find((p) => p.permission_category === category);
    if (!perm) return false;
    return type === "view" ? perm.can_view : perm.can_edit;
  };

  return {
    permissions,
    isLoading,
    upsertPermission,
    removePermission,
    hasPermission,
  };
};
