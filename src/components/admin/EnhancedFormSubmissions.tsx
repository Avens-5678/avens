import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Download, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface EnhancedFormSubmissionsProps {
  formSubmissions: any[];
}

// CSV export utility - no external dependencies needed
const escapeCSV = (value: string): string => {
  if (value == null) return '';
  const str = String(value);
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const EnhancedFormSubmissions = ({ formSubmissions }: EnhancedFormSubmissionsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('form_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Form submission deleted successfully",
      });

      await queryClient.invalidateQueries({ queryKey: ['form-submissions'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete submission",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportToCSV = () => {
    try {
      // Define headers
      const headers = [
        'Name', 'Email', 'Phone', 'Event Type', 'Form Type', 
        'Equipment/Rental', 'Message', 'Status', 'Submitted Date', 'Submitted Time'
      ];

      // Prepare data rows
      const rows = formSubmissions.map(submission => [
        escapeCSV(submission.name),
        escapeCSV(submission.email),
        escapeCSV(submission.phone || 'N/A'),
        escapeCSV(submission.event_type || 'N/A'),
        escapeCSV(submission.form_type),
        escapeCSV(submission.rental_title || 'N/A'),
        escapeCSV(submission.message),
        escapeCSV(submission.status),
        escapeCSV(new Date(submission.created_at).toLocaleDateString()),
        escapeCSV(new Date(submission.created_at).toLocaleTimeString()),
      ]);

      // Build CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `form-submissions-${new Date().toISOString().split('T')[0]}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Downloaded ${formSubmissions.length} submissions to ${filename}`,
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export data",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Form Submissions ({formSubmissions?.length || 0})</CardTitle>
          <div className="flex space-x-2">
            <Button
              onClick={handleExportToCSV}
              variant="outline"
              disabled={!formSubmissions?.length}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {formSubmissions?.length > 0 ? (
            formSubmissions.map((submission) => (
              <Card key={submission.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{submission.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant={submission.status === 'new' ? 'default' : 'secondary'}>
                        {submission.status}
                      </Badge>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={deletingId === submission.id}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center space-x-2">
                              <AlertCircle className="h-5 w-5 text-destructive" />
                              <span>Delete Form Submission</span>
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this form submission from {submission.name}? 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(submission.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 text-sm">
                    <div><span className="font-medium">Email:</span> {submission.email}</div>
                    <div><span className="font-medium">Phone:</span> {submission.phone || 'N/A'}</div>
                    <div><span className="font-medium">Event Type:</span> {submission.event_type || 'N/A'}</div>
                    <div><span className="font-medium">Form Type:</span> {submission.form_type}</div>
                    {submission.rental_title && (
                      <div><span className="font-medium">Equipment:</span> {submission.rental_title}</div>
                    )}
                    <div><span className="font-medium">Message:</span> {submission.message}</div>
                    <div><span className="font-medium">Submitted:</span> {new Date(submission.created_at).toLocaleDateString()} at {new Date(submission.created_at).toLocaleTimeString()}</div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No form submissions yet.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedFormSubmissions;