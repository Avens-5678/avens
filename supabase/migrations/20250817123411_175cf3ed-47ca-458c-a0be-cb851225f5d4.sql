-- First, let's see what the portfolio_view looks like
SELECT definition FROM pg_views WHERE schemaname = 'public' AND viewname = 'portfolio_view';