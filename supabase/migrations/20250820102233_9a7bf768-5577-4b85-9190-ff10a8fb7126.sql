-- Delete trusted_clients records with fake file paths
DELETE FROM trusted_clients 
WHERE logo_url LIKE 'C:%' 
   OR logo_url LIKE '%fakepath%' 
   OR logo_url LIKE '%:\\%';