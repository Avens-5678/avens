// Auth state is now managed by AuthContext — a single onAuthStateChange
// listener shared across the entire app. This re-export keeps all existing
// import { useAuth } from "@/hooks/useAuth" calls working unchanged.
export { useAuth } from "@/contexts/AuthContext";