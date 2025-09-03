-- Update corporate-exhibitions event with complete content
UPDATE events 
SET 
  specialties = '[
    {
      "title": "Conference Management",
      "description": "End-to-end conference planning with expert speakers, seamless logistics, and engaging formats.",
      "icon": "users",
      "image": "/lovable-uploads/corporate-conferences.jpg"
    },
    {
      "title": "Trade Show Excellence", 
      "description": "Dynamic exhibition spaces with custom booths, lead generation systems, and networking opportunities.",
      "icon": "briefcase",
      "image": "/lovable-uploads/trade-shows.jpg"
    },
    {
      "title": "Product Launch Events",
      "description": "High-impact launch experiences that create buzz, drive media coverage, and accelerate market adoption.",
      "icon": "zap",
      "image": "/lovable-uploads/product-launches.jpg"
    },
    {
      "title": "Corporate Seminars",
      "description": "Professional development sessions with industry experts, interactive workshops, and knowledge sharing.",
      "icon": "star",
      "image": "/lovable-uploads/corporate-seminars.jpg"
    }
  ]'::jsonb,
  services = '[
    {
      "title": "Strategic Event Planning",
      "description": "Comprehensive event strategy aligned with your business objectives and target audience.",
      "icon": "target",
      "category": "planning"
    },
    {
      "title": "Venue Selection & Setup",
      "description": "Premium venues with professional staging, lighting, and audio-visual systems.",
      "icon": "building",
      "category": "venue"
    },
    {
      "title": "Speaker & Content Management",
      "description": "Curated speaker lineup, content development, and presentation coordination.",
      "icon": "mic",
      "category": "content"
    },
    {
      "title": "Technology Integration",
      "description": "Live streaming, hybrid events, mobile apps, and digital engagement platforms.",
      "icon": "monitor",
      "category": "technology"
    },
    {
      "title": "Exhibition Design",
      "description": "Custom booth designs, display systems, and interactive demonstration areas.",
      "icon": "layout",
      "category": "design"
    },
    {
      "title": "Networking & Catering",
      "description": "Structured networking sessions with premium catering and hospitality services.",
      "icon": "users",
      "category": "hospitality"
    }
  ]'::jsonb,
  process_steps = '[
    {
      "step": 1,
      "title": "Objectives & Strategy",
      "description": "We begin by understanding your business goals, target audience, and success metrics to create a tailored event strategy."
    },
    {
      "step": 2,
      "title": "Planning & Design",
      "description": "Our team develops comprehensive event plans including venue selection, speaker curation, and experience design."
    },
    {
      "step": 3,
      "title": "Pre-Event Coordination",
      "description": "We handle all logistics, vendor coordination, marketing support, and attendee management systems."
    },
    {
      "step": 4,
      "title": "Event Execution",
      "description": "Professional on-site management ensuring seamless delivery, real-time problem solving, and quality control."
    },
    {
      "step": 5,
      "title": "Post-Event Analysis",
      "description": "Detailed reporting, ROI analysis, lead tracking, and recommendations for future events."
    }
  ]'::jsonb,
  hero_image_url = '/assets/corporate-exhibitions-hero.jpg'
WHERE event_type = 'corporate-exhibitions';