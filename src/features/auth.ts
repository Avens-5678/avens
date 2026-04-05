import { registerFeature } from "../lib/featureRegistry";

registerFeature({
  id: "auth_signup",
  group: "Authentication",
  name: "Signup — form and role selection",
  description: "Full name, email, password, role (Customer/Vendor cards). Vendor -> /vendor/onboarding, Customer -> /ecommerce.",
  route: "/auth",
  implementation: "Auth signup with role selection, redirect based on role",
});

registerFeature({
  id: "auth_login",
  group: "Authentication",
  name: "Login and route protection",
  description: "Email + password login. Role-based redirect. Protected routes redirect to /auth if unauthenticated.",
  route: "/auth",
  implementation: "Auth login, role-based redirect, ProtectedRoute wrappers",
});
