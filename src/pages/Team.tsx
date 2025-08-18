import { useState, useEffect } from "react";
import { useTeamMembers } from "@/hooks/useData";
import Layout from "@/components/Layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AnimatedText, GradientText } from "@/components/ui/animated-text";
import { Users, Phone, Mail } from "lucide-react";

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsModalOpen(!!selectedMember);
  }, [selectedMember]);


  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
          <div className="container mx-auto px-4 py-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading our amazing team...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-grid-primary/[0.02] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

        <div className="container mx-auto px-4 py-32 relative z-10">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <AnimatedText variant="fade-in-up">
              <Badge variant="secondary" className="mb-6 px-6 py-3">
                <Users className="mr-2 h-5 w-5" />
                Meet Our Team
              </Badge>
            </AnimatedText>
            
            <AnimatedText variant="fade-in-up" delay={200}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                The Creative <GradientText>Minds</GradientText><br />
                Behind Your <GradientText variant="secondary">Dreams</GradientText>
              </h1>
            </AnimatedText>
            
            <AnimatedText variant="fade-in-up" delay={400}>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Meet the passionate professionals who bring expertise, creativity, and dedication to every event we create
              </p>
            </AnimatedText>
          </div>

          {/* Team Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto [perspective:1000px]">
            {teamMembers?.map((member, index) => (
              <AnimatedText key={member.id} variant="fade-in-up" delay={600 + index * 100}>
                <Card 
                  className="glassmorphism-card relative overflow-hidden transition-all duration-500 cursor-pointer group hover:-translate-y-2 border border-white/10 hover:border-primary/50 [transform-style:preserve-3d] hover:[transform:rotateY(var(--rotate-y,0))_rotateX(var(--rotate-x,0))] hover:shadow-2xl hover:shadow-primary/20"
                  onClick={() => setSelectedMember(member)}
                  onMouseMove={(e) => {
                    const card = e.currentTarget;
                    const { left, top, width, height } = card.getBoundingClientRect();
                    const x = e.clientX - left;
                    const y = e.clientY - top;
                    const rotateX = -10 * ((y - height / 2) / height);
                    const rotateY = 10 * ((x - width / 2) / width);
                    card.style.setProperty('--rotate-x', `${rotateX}deg`);
                    card.style.setProperty('--rotate-y', `${rotateY}deg`);
                    card.style.setProperty('--mouse-x', `${x}px`);
                    card.style.setProperty('--mouse-y', `${y}px`);
                  }}
                  onMouseLeave={(e) => {
                    const card = e.currentTarget;
                    card.style.setProperty('--rotate-x', '0deg');
                    card.style.setProperty('--rotate-y', '0deg');
                  }}
                >
                  {/* Spotlight Effect */}
                   <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(350px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(148, 163, 184, 0.15), transparent 80%)`,
                    }}
                  />

                  <CardContent className="p-8 text-center [transform:translateZ(40px)]">
                    {/* Profile Image with Gradient Border */}
                    <div className="relative w-32 h-32 mx-auto mb-6 [transform:translateZ(20px)]">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full p-1 group-hover:scale-105 transition-transform duration-300">
                        <Avatar className="w-full h-full bg-background">
                          <AvatarImage src={member.photo_url} alt={member.name} className="object-cover" />
                          <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary/10 to-secondary/10 text-primary">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    
                    {/* Member Info */}
                    <h3 className="text-2xl font-bold mb-2 [transform:translateZ(15px)]">
                      <GradientText>{member.name}</GradientText>
                    </h3>
                    
                    <Badge variant="outline" className="mb-4 px-4 py-1 [transform:translateZ(10px)]">
                      {member.role}
                    </Badge>
                    
                    <p className="text-muted-foreground leading-relaxed min-h-[100px] transition-opacity duration-300 group-hover:opacity-60">
                      {member.short_bio}
                    </p>

                    {/* Hover Effect Indicator */}
                    <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-sm text-primary font-medium">Click to learn more</p>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedText>
            ))}
          </div>

          {/* CTA Section */}
          <AnimatedText variant="fade-in-up" delay={1200} className="text-center mt-20">
            <div className="glassmorphism-card max-w-2xl mx-auto p-8 rounded-3xl relative overflow-hidden">
               <div className="absolute inset-0 bg-primary/10 animate-pulse rounded-3xl" />
              <h3 className="text-3xl font-bold mb-4 relative">
                Ready to Work With Us?
              </h3>
              <p className="text-lg text-muted-foreground mb-6 relative">
                Our experienced team is here to make your event dreams come true
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center relative">
                <div className="flex items-center text-muted-foreground">
                  <Phone className="mr-2 h-5 w-5 text-primary" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Mail className="mr-2 h-5 w-5 text-primary" />
                  <span>hello@avensevents.com</span>
                </div>
              </div>
            </div>
          </AnimatedText>
        </div>

        {/* Member Detail Modal */}
        <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) setSelectedMember(null); }}>
          <DialogContent className="max-w-3xl glassmorphism-card border-0 transition-all duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <div className={`transition-opacity duration-500 ${isModalOpen ? 'opacity-100' : 'opacity-0'}`}>
              <DialogHeader>
                <DialogTitle className="flex flex-col items-center text-center gap-4">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full p-1">
                      <Avatar className="w-full h-full bg-background">
                        <AvatarImage src={selectedMember?.photo_url} alt={selectedMember?.name} className="object-cover" />
                        <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary/10 to-secondary/10 text-primary">
                          {selectedMember?.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{selectedMember?.name}</h2>
                    <Badge variant="secondary" className="px-4 py-1">
                      {selectedMember?.role}
                    </Badge>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4 text-primary">About</h4>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {selectedMember?.full_bio || selectedMember?.short_bio}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Team;
