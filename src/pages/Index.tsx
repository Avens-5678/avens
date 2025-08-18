import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom"; // Assuming you are using react-router-dom

// --- UI Components (Placeholders) ---
// In a real app, these would be in separate files (e.g., components/ui/button.tsx)

const Button = ({ children, asChild, variant, size, className, ...props }) => {
  const Comp = asChild ? "div" : "button";
  return <Comp className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background ${className}`} {...props}>{children}</Comp>;
};

const Card = ({ children, className, ...props }) => <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`} {...props}>{children}</div>;
const CardHeader = ({ children, className, ...props }) => <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>{children}</div>;
const CardTitle = ({ children, className, ...props }) => <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props}>{children}</h3>;
const CardContent = ({ children, className, ...props }) => <div className={`p-6 pt-0 ${className}`} {...props}>{children}</div>;

const Carousel = ({ children, className, plugins, opts }) => {
    // A simplified placeholder for the carousel component
    return <div className={`relative ${className}`}>{children}</div>;
};
const CarouselContent = ({ children, className }) => <div className={`flex ${className}`}>{children}</div>;
const CarouselItem = ({ children, className }) => <div className={`min-w-0 shrink-0 grow-0 basis-full ${className}`}>{children}</div>;
const CarouselPrevious = ({ className }) => <button className={`absolute h-8 w-8 rounded-full -left-12 top-1/2 -translate-y-1/2 ${className}`}>{"<"}</button>;
const CarouselNext = ({ className }) => <button className={`absolute h-8 w-8 rounded-full -right-12 top-1/2 -translate-y-1/2 ${className}`}>{">"}</button>;

const Badge = ({ children, className }) => <div className={`inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>{children}</div>;

const Dialog = ({ children, open, onOpenChange }) => {
    if (!open) return null;
    return <div onClick={() => onOpenChange(false)} className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm`}><div onClick={e => e.stopPropagation()}>{children}</div></div>;
};
const DialogTrigger = ({ children }) => <div>{children}</div>;
const DialogContent = ({ children, className }) => <div className={`relative bg-white p-6 rounded-lg shadow-xl ${className}`}>{children}</div>;
const DialogHeader = ({ children }) => <div>{children}</div>;
const DialogTitle = ({ children }) => <h2 className="text-lg font-semibold">{children}</h2>;
const DialogDescription = ({ children }) => <p className="text-sm text-muted-foreground">{children}</p>;

// --- Custom Components (Placeholders) ---
const Layout = ({ children }) => <main>{children}</main>;
const AnimatedText = ({ children, variant, delay, className }) => <div className={className}>{children}</div>;
const GradientText = ({ children, variant }) => <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">{children}</span>;
const InquiryForm = ({ formType, rentalId, rentalTitle, title }) => <div><h3 className="font-bold text-lg mb-4">{title}</h3><p>Inquiry form for {formType}: {rentalTitle || 'General Contact'}</p></div>;
const TestimonialsSection = () => <section className="py-16 lg:py-20 bg-gray-100"><div className="container mx-auto px-4 text-center"><h2 className="text-3xl font-bold">Client Stories</h2></div></section>;

// --- Lucide Icons (Placeholders) ---
const ArrowRight = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;
const Sparkles = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9L12 21l1.9-5.8 5.8-1.9-5.8-1.9L12 3z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>;
const Clock = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const Users = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const Award = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>;
const CheckCircle = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const Star = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const Trophy = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>;
const Heart = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;
const Calendar = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>;


// --- Custom Hooks (Mock Data) ---
const useMockData = (data, delay = 500) => {
    const [state, setState] = useState({ data: null, isLoading: true });
    useEffect(() => {
        const timer = setTimeout(() => {
            setState({ data, isLoading: false });
        }, delay);
        return () => clearTimeout(timer);
    }, []);
    return state;
};

const useHeroBanners = () => useMockData([
    { id: 1, image_url: 'https://placehold.co/1920x1080/4a044e/ffffff?text=Elegant+Weddings', title: 'Crafting Your Perfect Day', subtitle: 'Experience the magic of a flawless wedding celebration.', button_text: 'Explore Weddings', event_type: 'weddings' },
    { id: 2, image_url: 'https://placehold.co/1920x1080/065f46/ffffff?text=Corporate+Events', title: 'Professional Corporate Events', subtitle: 'Elevate your brand with seamless and impactful corporate gatherings.', button_text: 'Discover Corporate Services', event_type: 'corporate' },
]);
const useServices = () => useMockData([
    { id: 1, title: 'Wedding Planning', short_description: 'Full-service wedding planning from conception to execution.', event_type: 'weddings' },
    { id: 2, title: 'Corporate Events', short_description: 'Expert management for conferences, galas, and product launches.', event_type: 'corporate' },
    { id: 3, title: 'Private Parties', short_description: 'Creating memorable birthdays, anniversaries, and special occasions.', event_type: 'private' },
]);
const useRentals = () => useMockData([
    { id: 1, title: 'Audio/Visual Equipment', short_description: 'State-of-the-art sound systems, projectors, and lighting.', price_range: '100-500' },
    { id: 2, title: 'Luxury Seating', short_description: 'Elegant chairs, sofas, and lounge furniture for any theme.', price_range: '100-500' },
    { id: 3, title: 'Decorative Items', short_description: 'Centerpieces, linens, and decor to perfect your event\'s ambiance.', price_range: '100-500' },
]);
const useTrustedClients = () => useMockData([
    { id: 1, name: 'Innovate Corp', logo_url: 'https://placehold.co/150x60/cccccc/000000?text=Innovate' },
    { id: 2, name: 'Quantum Solutions', logo_url: 'https://placehold.co/150x60/cccccc/000000?text=Quantum' },
    { id: 3, name: 'Apex Industries', logo_url: 'https://placehold.co/150x60/cccccc/000000?text=Apex' },
    { id: 4, name: 'Stellar Group', logo_url: 'https://placehold.co/150x60/cccccc/000000?text=Stellar' },
]);
const useNewsAchievements = () => useMockData([
    { id: 1, title: 'Voted #1 Event Planner 2024', content: 'We are honored to be recognized by the National Event Planners Association.', image_url: 'https://placehold.co/600x400/7c3aed/ffffff?text=Award', created_at: '2024-01-15T12:00:00Z' },
    { id: 2, title: 'Featured in "Events Monthly"', content: 'Our recent corporate summit was featured in the latest issue of Events Monthly magazine.', image_url: 'https://placehold.co/600x400/db2777/ffffff?text=Magazine', created_at: '2023-11-20T12:00:00Z' },
    { id: 3, title: 'Community Excellence Award', content: 'Recognized for our contributions to local charity events and community building.', image_url: 'https://placehold.co/600x400/10b981/ffffff?text=Community', created_at: '2023-09-05T12:00:00Z' },
]);

// --- Main Component ---
const Index = () => {
    const [selectedPost, setSelectedPost] = useState(null);
    const { data: heroBanners, isLoading: loadingBanners } = useHeroBanners();
    const { data: services, isLoading: loadingServices } = useServices();
    const { data: rentals, isLoading: loadingRentals } = useRentals();
    const { data: trustedClients, isLoading: loadingClients } = useTrustedClients();
    const { data: newsAchievements, isLoading: loadingNews } = useNewsAchievements();
    const [selectedRental, setSelectedRental] = useState(null);

    const [isRentalDialogOpen, setIsRentalDialogOpen] = useState(false);
    const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);


    if (loadingBanners || loadingServices || loadingRentals || loadingClients || loadingNews) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading amazing content...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            {/* Unified gradient background for entire homepage */}
            <div className="bg-gradient-to-b from-background via-muted/10 via-background/80 to-primary/5">
                {/* Hero Section with Carousel */}
                <div className="relative">
                    {heroBanners && heroBanners.length > 0 ? (
                        <Carousel className="w-full h-screen relative" opts={{ align: "start", loop: true }}>
                            <CarouselContent>
                                {heroBanners.map(banner => (
                                    <CarouselItem key={banner.id} className="relative">
                                        <div className="h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center" style={{ backgroundImage: `url(${banner.image_url})` }}>
                                            <div className="absolute inset-0 bg-black/40"></div>
                                            <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
                                                <AnimatedText variant="fade-in-up" className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                                                    <GradientText variant="primary">{banner.title}</GradientText>
                                                </AnimatedText>
                                                {banner.subtitle && (
                                                    <AnimatedText variant="fade-in-up" delay={300} className="text-lg md:text-xl mb-6 text-white/90">
                                                        {banner.subtitle}
                                                    </AnimatedText>
                                                )}
                                                <AnimatedText variant="scale-in" delay={600}>
                                                    <Button asChild size="lg" className="glassmorphism-btn text-lg px-8 py-3 rounded-2xl">
                                                        <Link to={`/events/${banner.event_type}`}>
                                                            {banner.button_text} <ArrowRight className="ml-2 h-5 w-5" />
                                                        </Link>
                                                    </Button>
                                                </AnimatedText>
                                            </div>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="hero-arrow left-4 bg-white/5 hover:bg-white/10 border-white/10 text-white backdrop-blur-md transition-all duration-300 hidden md:flex" />
                            <CarouselNext className="hero-arrow right-4 bg-white/5 hover:bg-white/10 border-white/10 text-white backdrop-blur-md transition-all duration-300 hidden md:flex" />
                        </Carousel>
                    ) : (
                        <div className="h-screen flex items-center justify-center text-center max-w-4xl mx-auto px-4">
                            <div>
                                <AnimatedText variant="fade-in-up" className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                                    <GradientText>Creating Unforgettable</GradientText><br />
                                    <GradientText variant="secondary">Moments</GradientText>
                                </AnimatedText>
                                <AnimatedText variant="fade-in-up" delay={300} className="text-lg md:text-xl mb-6 text-muted-foreground">
                                    Premium event management and rental services for your special occasions
                                </AnimatedText>
                                <AnimatedText variant="scale-in" delay={600}>
                                    <Button asChild size="lg" className="glassmorphism-btn text-lg px-8 py-3 rounded-2xl">
                                        <Link to="/services">
                                            Explore Services <ArrowRight className="ml-2 h-5 w-5" />
                                        </Link>
                                    </Button>
                                </AnimatedText>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats Section */}
                <section className="relative overflow-hidden py-12 lg:py-16">
                    <div className="container mx-auto px-4 relative z-10 max-w-6xl">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 max-w-5xl mx-auto mb-6">
                            <AnimatedText delay={200} className="text-center group">
                                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 lg:p-5 border border-primary/10 hover:border-primary/30 transition-all duration-500 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden cursor-pointer" onMouseMove={(e) => { const card = e.currentTarget; const { left, top } = card.getBoundingClientRect(); const x = e.clientX - left; const y = e.clientY - top; card.style.setProperty('--mouse-x', `${x}px`); card.style.setProperty('--mouse-y', `${y}px`); }}>
                                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(250px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(148, 163, 184, 0.08), transparent 70%)` }} />
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-2xl mb-3">
                                        <Users className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="text-2xl font-bold text-foreground">100+</div>
                                    <div className="text-sm text-muted-foreground">Happy Clients</div>
                                </div>
                            </AnimatedText>
                            <AnimatedText delay={300} className="text-center group">
                                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 lg:p-5 border border-secondary/10 hover:border-secondary/30 transition-all duration-500 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden cursor-pointer" onMouseMove={(e) => { const card = e.currentTarget; const { left, top } = card.getBoundingClientRect(); const x = e.clientX - left; const y = e.clientY - top; card.style.setProperty('--mouse-x', `${x}px`); card.style.setProperty('--mouse-y', `${y}px`); }}>
                                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(250px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(148, 163, 184, 0.08), transparent 70%)` }} />
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-secondary to-hover rounded-2xl mb-3">
                                        <CheckCircle className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="text-2xl font-bold text-foreground">500+</div>
                                    <div className="text-sm text-muted-foreground">Events Completed</div>
                                </div>
                            </AnimatedText>
                            <AnimatedText delay={400} className="text-center group">
                                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 lg:p-5 border border-primary/10 hover:border-primary/30 transition-all duration-500 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden cursor-pointer" onMouseMove={(e) => { const card = e.currentTarget; const { left, top } = card.getBoundingClientRect(); const x = e.clientX - left; const y = e.clientY - top; card.style.setProperty('--mouse-x', `${x}px`); card.style.setProperty('--mouse-y', `${y}px`); }}>
                                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(250px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(148, 163, 184, 0.08), transparent 70%)` }} />
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-2xl mb-3">
                                        <Star className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="text-2xl font-bold text-foreground">4.9</div>
                                    <div className="text-sm text-muted-foreground">Rating Average</div>
                                </div>
                            </AnimatedText>
                            <AnimatedText delay={500} className="text-center group">
                                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 lg:p-5 border border-secondary/10 hover:border-secondary/30 transition-all duration-500 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden cursor-pointer" onMouseMove={(e) => { const card = e.currentTarget; const { left, top } = card.getBoundingClientRect(); const x = e.clientX - left; const y = e.clientY - top; card.style.setProperty('--mouse-x', `${x}px`); card.style.setProperty('--mouse-y', `${y}px`); }}>
                                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(250px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(148, 163, 184, 0.08), transparent 70%)` }} />
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-secondary to-hover rounded-2xl mb-3">
                                        <Trophy className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="text-2xl font-bold text-foreground">15+</div>
                                    <div className="text-sm text-muted-foreground">Years Experience</div>
                                </div>
                            </AnimatedText>
                        </div>
                    </div>
                </section>

                {/* Services Section */}
                <section className="relative overflow-hidden py-16 lg:py-20">
                    <div className="container mx-auto relative z-10 px-4 max-w-6xl">
                        <div className="text-center mb-12 lg:mb-14">
                            <AnimatedText>
                                <Badge variant="secondary" className="mb-4 rounded-full px-6 py-2">
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Our Services
                                </Badge>
                            </AnimatedText>
                            <AnimatedText delay={200}>
                                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                                    Exceptional Event Services
                                </h2>
                            </AnimatedText>
                            <AnimatedText delay={400}>
                                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                    From intimate gatherings to grand celebrations, we bring your vision to life
                                </p>
                            </AnimatedText>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 max-w-6xl mx-auto">
                            {services?.map((service, index) => (
                                <AnimatedText key={service.id} delay={600 + index * 100}>
                                    <Card className="group hover:shadow-xl transition-all duration-500 border-0 glassmorphism-card hover:-translate-y-2 rounded-2xl overflow-hidden relative" onMouseMove={(e) => { const card = e.currentTarget; const { left, top } = card.getBoundingClientRect(); const x = e.clientX - left; const y = e.clientY - top; card.style.setProperty('--mouse-x', `${x}px`); card.style.setProperty('--mouse-y', `${y}px`); }}>
                                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(300px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(148, 163, 184, 0.1), transparent 70%)` }} />
                                        <div className="h-1 bg-gradient-to-r from-primary via-primary-glow to-secondary"></div>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors flex items-center">
                                                <div className="w-2 h-2 bg-primary rounded-full mr-3 group-hover:animate-pulse"></div>
                                                {service.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed text-sm">
                                                {service.short_description}
                                            </p>
                                            <Button asChild variant="ghost" className="glassmorphism-btn w-full rounded-xl">
                                                <Link to={`/events/${service.event_type}`}>
                                                    View Details <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </AnimatedText>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Rentals Section */}
                <section className="relative py-16 lg:py-20 bg-muted/20">
                    <div className="container mx-auto relative z-10 px-4 max-w-6xl">
                        <div className="text-center mb-12 lg:mb-14">
                            <AnimatedText>
                                <Badge variant="secondary" className="mb-4 rounded-full px-6 py-2">
                                    <Clock className="mr-2 h-4 w-4" />
                                    Equipment Rental
                                </Badge>
                            </AnimatedText>
                            <AnimatedText delay={200}>
                                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                                    Premium Event Rentals
                                </h2>
                            </AnimatedText>
                            <AnimatedText delay={400}>
                                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                    High-quality equipment and decor to make your event perfect
                                </p>
                            </AnimatedText>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 max-w-6xl mx-auto">
                            {rentals?.map((rental, index) => (
                                <AnimatedText key={rental.id} delay={600 + index * 100}>
                                    <Card className="group hover:shadow-xl transition-all duration-500 glassmorphism-card border-0 rounded-2xl overflow-hidden hover:-translate-y-2 relative" onMouseMove={(e) => { const card = e.currentTarget; const { left, top } = card.getBoundingClientRect(); const x = e.clientX - left; const y = e.clientY - top; card.style.setProperty('--mouse-x', `${x}px`); card.style.setProperty('--mouse-y', `${y}px`); }}>
                                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(300px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(148, 163, 184, 0.1), transparent 70%)` }} />
                                        <div className="h-1 bg-gradient-to-r from-primary via-primary-glow to-secondary"></div>
                                        <CardHeader className="relative">
                                            <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                                                <Heart className="h-4 w-4 text-primary" />
                                            </div>
                                            <CardTitle className="text-xl font-semibold pr-12">
                                                {rental.title}
                                            </CardTitle>
                                            {rental.price_range && (
                                                <div className="inline-flex items-center bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-full px-3 py-1 w-fit">
                                                    <p className="text-sm text-secondary font-semibold">
                                                        ${rental.price_range} per event
                                                    </p>
                                                </div>
                                            )}
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground mb-6 leading-relaxed">
                                                {rental.short_description}
                                            </p>
                                            <Button className="glassmorphism-btn w-full rounded-2xl" onClick={() => { setSelectedRental(rental); setIsRentalDialogOpen(true); }}>
                                                Enquire Now <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </AnimatedText>
                            ))}
                        </div>

                        <AnimatedText delay={1000} className="text-center mt-10">
                            <Button asChild variant="outline" size="lg" className="glassmorphism-btn rounded-2xl">
                                <Link to="/ecommerce">
                                    View All Rentals <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        </AnimatedText>
                    </div>
                </section>

                {/* Trusted Clients */}
                {trustedClients && trustedClients.length > 0 && (
                    <section className="relative overflow-hidden py-16 lg:py-20">
                        <div className="container mx-auto relative z-10 px-4 max-w-6xl">
                            <div className="text-center mb-12 lg:mb-14">
                                <AnimatedText>
                                    <Badge variant="secondary" className="mb-4 rounded-full px-6 py-2">
                                        <Users className="mr-2 h-4 w-4" />
                                        Trusted By
                                    </Badge>
                                </AnimatedText>
                                <AnimatedText delay={200}>
                                    <h2 className="text-2xl md:text-3xl font-bold mb-3">
                                        Our Valued Clients
                                    </h2>
                                </AnimatedText>
                            </div>

                            <AnimatedText delay={400}>
                                <div className="overflow-hidden rounded-2xl glassmorphism-card py-8 lg:py-12">
                                    <div className="flex animate-scroll space-x-16 lg:space-x-20">
                                        {[...trustedClients, ...trustedClients].map((client, index) => (
                                            <div key={`${client.id}-${index}`} className="flex-shrink-0 h-20 lg:h-24 w-40 lg:w-48 flex items-center justify-center group">
                                                <img src={client.logo_url} alt={client.name} className="max-h-full max-w-full object-contain opacity-60 group-hover:opacity-100 transition-all duration-300 filter grayscale group-hover:grayscale-0" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </AnimatedText>
                        </div>
                    </section>
                )}

                {/* Awards & Achievements */}
                {newsAchievements && newsAchievements.length > 0 && (
                    <section className="relative overflow-hidden py-16 lg:py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
                        <div className="container mx-auto relative z-10 px-4 max-w-6xl">
                            <div className="text-center mb-12 lg:mb-14">
                                <AnimatedText>
                                    <Badge variant="secondary" className="mb-4 rounded-full px-6 py-2">
                                        <Award className="mr-2 h-4 w-4" />
                                        Awards & Achievements
                                    </Badge>
                                </AnimatedText>
                                <AnimatedText delay={200}>
                                    <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
                                        Our Success Stories
                                    </h2>
                                </AnimatedText>
                                <AnimatedText delay={400}>
                                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                                        Celebrating milestones and recognition that reflect our commitment to excellence
                                    </p>
                                </AnimatedText>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 max-w-5xl mx-auto">
                                {newsAchievements.slice(0, 3).map((news, index) => (
                                    <AnimatedText key={news.id} delay={600 + index * 100}>
                                        <Card className="group hover:shadow-lg transition-all duration-500 glassmorphism-card border-0 rounded-2xl overflow-hidden hover:-translate-y-2 h-full relative" onMouseMove={(e) => { const card = e.currentTarget; const { left, top } = card.getBoundingClientRect(); const x = e.clientX - left; const y = e.clientY - top; card.style.setProperty('--mouse-x', `${x}px`); card.style.setProperty('--mouse-y', `${y}px`); }}>
                                            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(300px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(148, 163, 184, 0.1), transparent 70%)` }} />
                                            <div className="relative h-32 bg-gradient-to-br from-primary/10 via-primary-glow/5 to-secondary/10 overflow-hidden">
                                                {news.image_url ? (
                                                    <img src={news.image_url} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Award className="h-8 w-8 text-primary/40" />
                                                    </div>
                                                )}
                                                <div className="absolute top-2 right-2">
                                                    <Badge variant="secondary" className="backdrop-blur-md bg-white/20 border-white/30 text-white rounded-full px-2 py-1 text-xs">
                                                        {new Date(news.created_at).getFullYear()}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <CardContent className="p-4">
                                                <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2 mb-2">
                                                    {news.title}
                                                </h3>
                                                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-3">
                                                    {news.content}
                                                </p>
                                                <Button variant="ghost" className="group/btn p-0 h-auto font-medium hover:text-primary" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setSelectedPost(news); }}>
                                                    Read More
                                                    <ArrowRight className="ml-1 h-3 w-3 group-hover/btn:translate-x-1 transition-transform duration-300" />
                                                </Button>
                                            </CardContent>
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-glow to-secondary"></div>
                                        </Card>
                                    </AnimatedText>
                                ))}
                            </div>

                            <AnimatedText delay={1000} className="text-center mt-8">
                                <Button asChild variant="outline" size="sm" className="px-4 py-2 rounded-full bg-gradient-to-r from-secondary/10 to-primary/10 border border-primary/20 hover:bg-primary/20 hover:border-primary/40 transition-all duration-300">
                                    <Link to="/blog">
                                        View All Updates
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </AnimatedText>
                        </div>
                    </section>
                )}

                {/* Client Stories Section */}
                <TestimonialsSection />

                {/* Get in Touch CTA */}
                <section className="py-16 relative overflow-hidden">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-4xl mx-auto text-center">
                            <AnimatedText>
                                <Badge variant="secondary" className="mb-4 rounded-full px-6 py-2">
                                    <Heart className="mr-2 h-4 w-4" />
                                    Ready to Start?
                                </Badge>
                            </AnimatedText>
                            <AnimatedText delay={200}>
                                <h2 className="text-2xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                                    Let's Create Something Amazing Together
                                </h2>
                            </AnimatedText>
                            <AnimatedText delay={400}>
                                <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
                                    Ready to turn your event dreams into reality? Contact us today and let our expert team craft an unforgettable experience tailored just for you.
                                </p>
                            </AnimatedText>
                            <AnimatedText delay={600}>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button size="xl" className="glassmorphism-btn hover:shadow-glow transition-all duration-300 group text-gray-950" onClick={() => setIsContactDialogOpen(true)}>
                                        Get Started Now
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                    <Button asChild variant="outline" size="xl" className="glassmorphism-btn rounded-2xl hover:bg-secondary hover:text-secondary-foreground transition-all duration-300">
                                        <Link to="/portfolio">
                                            View Our Work <ArrowRight className="ml-2 h-5 w-5" />
                                        </Link>
                                    </Button>
                                </div>
                            </AnimatedText>
                        </div>
                    </div>
                </section>
                
                {/* Modals */}
                <Dialog open={isRentalDialogOpen} onOpenChange={setIsRentalDialogOpen}>
                    {selectedRental && (
                        <DialogContent className="max-w-md rounded-3xl">
                            <DialogTitle className="sr-only">Rental Inquiry</DialogTitle>
                            <DialogDescription className="sr-only">Submit an inquiry for equipment rental</DialogDescription>
                            <InquiryForm formType="rental" rentalId={selectedRental.id} rentalTitle={selectedRental.title} title="Rental Inquiry" />
                        </DialogContent>
                    )}
                </Dialog>
                
                <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                    <DialogContent className="max-w-md rounded-3xl">
                        <DialogTitle className="sr-only">Contact Us</DialogTitle>
                        <DialogDescription className="sr-only">Get in touch with us for your event needs</DialogDescription>
                        <InquiryForm formType="contact" title="Let's Get Started!" />
                    </DialogContent>
                </Dialog>

                <Dialog open={selectedPost !== null} onOpenChange={(open) => { if (!open) setSelectedPost(null); }}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto glassmorphism-card">
                        {selectedPost && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold text-foreground">
                                        {selectedPost.title}
                                    </DialogTitle>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>{new Date(selectedPost.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                </DialogHeader>
                                {selectedPost.image_url && (
                                    <div className="aspect-video overflow-hidden rounded-lg mt-4">
                                        <img src={selectedPost.image_url} alt={selectedPost.title} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="mt-4">
                                    <div className="text-base leading-relaxed text-foreground whitespace-pre-wrap">
                                        {selectedPost.content}
                                    </div>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </Layout>
    );
};

export default Index;