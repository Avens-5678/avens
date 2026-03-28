import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Phone, User, CheckCircle, XCircle } from "lucide-react";

const WhatsAppContacts = () => {
  const [search, setSearch] = useState("");

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["whatsapp_contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_contacts")
        .select("*")
        .order("last_message_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = contacts.filter((c: any) =>
    c.phone_number?.includes(search) ||
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">WhatsApp Contacts</h2>
        <Badge variant="secondary">{contacts.length} contacts</Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by phone or name..."
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No contacts found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          {filtered.map((contact: any) => (
            <Card key={contact.id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{contact.name || `+${contact.phone_number}`}</p>
                    <p className="text-xs text-muted-foreground">+{contact.phone_number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div className="flex flex-col items-end gap-1">
                    {contact.opted_in ? (
                      <Badge variant="default" className="text-[10px] gap-1">
                        <CheckCircle className="h-3 w-3" /> Opted In
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] gap-1">
                        <XCircle className="h-3 w-3" /> Not Opted
                      </Badge>
                    )}
                    {contact.tags?.length > 0 && (
                      <div className="flex gap-1">
                        {contact.tags.slice(0, 2).map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {contact.total_conversations || 0} chats
                    {contact.last_message_at && (
                      <div>{new Date(contact.last_message_at).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WhatsAppContacts;
