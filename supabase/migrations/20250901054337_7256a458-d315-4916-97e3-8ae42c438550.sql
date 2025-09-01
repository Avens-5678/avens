-- Insert Corporate & Exhibitions event into events table
INSERT INTO events (
  event_type,
  title,
  description,
  hero_title,
  hero_subtitle,
  hero_description,
  process_description,
  is_active,
  url_slug,
  meta_description,
  cta_title,
  cta_description,
  default_portfolio_tags
) VALUES (
  'corporate-exhibitions',
  'Corporate & Exhibitions',
  'At Avens Events, we specialize in creating impactful corporate experiences that drive business growth. From high-profile conferences and seminars to dynamic trade shows and product launches, we deliver comprehensive event solutions that elevate your brand and engage your audience. Our expert team combines strategic planning with flawless execution to ensure every corporate gathering achieves its objectives.',
  'Corporate & Exhibitions',
  'Elevating Business Connections',
  'Professional event infrastructure for conferences, seminars, trade shows, and corporate gatherings that drive business success.',
  'Our systematic approach ensures every corporate event delivers measurable results and lasting impressions.',
  true,
  'corporate-exhibitions',
  'Professional corporate event management services including conferences, seminars, trade shows, and exhibitions in India.',
  'Ready to Elevate Your Next Corporate Event?',
  'From concept to execution, our experienced team is ready to transform your corporate vision into a memorable experience that drives results.',
  ARRAY['corporate', 'business', 'conference', 'exhibition', 'trade show']
);