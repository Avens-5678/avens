import { useState } from "react";
import { useTeamMembers } from "@/hooks/useData";
import Layout from "@/components/Layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  short_bio: string;
  full_bio?: string;
  photo_url?: string;
}

const Team = () => {
  const { data: teamMembers, isLoading } = useTeamMembers();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">Loading team members...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Team</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Meet the talented professionals who bring your events to life
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers?.map((member) => (
            <Card 
              key={member.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedMember(member)}
            >
              <CardContent className="p-6 text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={member.photo_url} alt={member.name} />
                  <AvatarFallback className="text-lg">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                <p className="text-primary font-medium mb-3">{member.role}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {member.short_bio}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedMember?.photo_url} alt={selectedMember?.name} />
                  <AvatarFallback>
                    {selectedMember?.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{selectedMember?.name}</h2>
                  <p className="text-primary font-medium">{selectedMember?.role}</p>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="mt-6">
              <p className="text-muted-foreground leading-relaxed">
                {selectedMember?.full_bio || selectedMember?.short_bio}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Team;