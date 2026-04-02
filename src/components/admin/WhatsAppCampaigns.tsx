import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Plus, BarChart3, Users, CheckCircle, XCircle, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const WhatsAppCampaigns = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [phoneNumbers, setPhoneNumbers] = useState("");

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["whatsapp_campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createCampaign = useMutation({
    mutationFn: async () => {
      const phones = phoneNumbers
        .split(/[\n,;]+/)
        .map((p) => p.trim().replace(/\D/g, ""))
        .filter((p) => p.length >= 10);

      if (!templateName || phones.length === 0) throw new Error("Template name and phone numbers are required");

      // Create campaign
      const { data: campaign, error } = await supabase
        .from("whatsapp_campaigns")
        .insert({
          template_name: templateName,
          total_recipients: phones.length,
          status: "ready",
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Insert recipients
      const recipients = phones.map((phone) => ({
        campaign_id: campaign.id,
        phone_number: phone.length === 10 ? `91${phone}` : phone,
      }));

      const { error: recipError } = await supabase
        .from("whatsapp_campaign_recipients")
        .insert(recipients);

      if (recipError) throw recipError;
      return campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp_campaigns"] });
      setShowCreate(false);
      setTemplateName("");
      setPhoneNumbers("");
      toast({ title: "Campaign created!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const sendCampaign = useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await supabase.functions.invoke("whatsapp-campaign", {
        body: { campaign_id: campaignId },
      });
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp_campaigns"] });
      toast({ title: "Campaign sent!", description: `Sent: ${data.sent}, Failed: ${data.failed}` });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft": return <Badge variant="secondary">Draft</Badge>;
      case "ready": return <Badge variant="outline" className="border-primary text-primary">Ready</Badge>;
      case "sent": return <Badge variant="default">Sent</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">WhatsApp Campaigns</h2>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Campaign</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Campaign</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Template Name</label>
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., seasonal_offer"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Must be an approved Meta template</p>
              </div>
              <div>
                <label className="text-sm font-medium">Phone Numbers</label>
                <Textarea
                  value={phoneNumbers}
                  onChange={(e) => setPhoneNumbers(e.target.value)}
                  placeholder="One per line or comma-separated&#10;9876543210&#10;919876543210"
                  rows={6}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {phoneNumbers.split(/[\n,;]+/).filter((p) => p.trim().replace(/\D/g, "").length >= 10).length} valid numbers
                </p>
              </div>
              <Button onClick={() => createCampaign.mutate()} disabled={createCampaign.isPending} className="w-full">
                {createCampaign.isPending ? "Creating..." : "Create Campaign"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading campaigns...</div>
      ) : campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Send className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No campaigns yet. Create one to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign: any) => (
            <Card key={campaign.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{campaign.template_name}</h3>
                    {getStatusBadge(campaign.status)}
                  </div>
                  {campaign.status === "ready" && (
                    <Button
                      size="sm"
                      onClick={() => sendCampaign.mutate(campaign.id)}
                      disabled={sendCampaign.isPending}
                    >
                      <Send className="h-3 w-3 mr-1" /> Send Now
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                  <div className="bg-muted/50 rounded-lg p-2">
                    <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-bold">{campaign.total_recipients}</p>
                    <p className="text-[10px] text-muted-foreground">Total</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <Send className="h-4 w-4 mx-auto mb-1 text-primary" />
                    <p className="text-lg font-bold">{campaign.sent_count || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Sent</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <CheckCircle className="h-4 w-4 mx-auto mb-1 text-green-500" />
                    <p className="text-lg font-bold">{campaign.delivered_count || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Delivered</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <Eye className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                    <p className="text-lg font-bold">{campaign.read_count || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Read</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <XCircle className="h-4 w-4 mx-auto mb-1 text-destructive" />
                    <p className="text-lg font-bold">{campaign.failed_count || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Failed</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Created {new Date(campaign.created_at).toLocaleDateString()}
                  {campaign.sent_at && ` · Sent ${new Date(campaign.sent_at).toLocaleDateString()}`}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WhatsAppCampaigns;
