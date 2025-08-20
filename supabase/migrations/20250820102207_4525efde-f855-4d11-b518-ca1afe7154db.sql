-- Clean up fake file paths in trusted_clients table
UPDATE trusted_clients 
SET logo_url = NULL 
WHERE logo_url LIKE 'C:%' 
   OR logo_url LIKE '%fakepath%' 
   OR logo_url LIKE '%:\\%';