import { registerFeature } from "../lib/featureRegistry";

registerFeature({
  id: "onboarding_wizard",
  group: "Vendor Onboarding",
  name: "Onboarding — 7-step wizard",
  description: "IMPLEMENTED: TOTAL_STEPS=7 constant, currentStep state 1-7. Progress persistence via vendor_onboarding_progress table upsert with current_step + onboarding_data fields. Resume on mount by querying saved step. Back button from step 2+. OTP has 3-attempt lockout with 5-min cooldown (otpAttempts/otpLocked/lockoutEnd states). File uploads have size validation (2MB passport, 5MB shop). Step 6 requires aadhaar_url && pan_url before Next.",
  route: "/vendor/onboarding",
  implementation: "VendorOnboardingWizard.tsx: TOTAL_STEPS=7, vendor_onboarding_progress upsert/resume, OTP lockout (otpAttempts>=3), upload size checks, canProceed guards",
});

registerFeature({
  id: "onboarding_step1",
  group: "Vendor Onboarding",
  name: "Step 1 — eligibility quiz",
  description: "3 questions with clickable cards. Green success card after all selected. Auto-advance to Step 2 after 1.8s.",
  route: "/vendor/onboarding",
  implementation: "Step 1 option cards, success animation, setTimeout auto-advance",
});

registerFeature({
  id: "onboarding_step2",
  group: "Vendor Onboarding",
  name: "Step 2 — phone OTP",
  description: "+91 prefix, 10-digit input, signInWithOtp, 6-box OTP, 30s countdown, verifyOtp. Auto-advance on success.",
  route: "/vendor/onboarding",
  implementation: "supabase.auth.signInWithOtp + verifyOtp, countdown timer",
});

registerFeature({
  id: "onboarding_step3",
  group: "Vendor Onboarding",
  name: "Step 3 — required fields validation",
  description: "Business name, owner, email, city, WhatsApp — all required. Next DISABLED until Zod validates. No bank fields.",
  route: "/vendor/onboarding",
  implementation: "react-hook-form + zod, mode: onChange, disabled Next",
});

registerFeature({
  id: "onboarding_step4",
  group: "Vendor Onboarding",
  name: "Step 4 — dynamic fields by vendor type",
  description: "Equipment: categories, stock, years. Venue: type, capacity, amenities. Crew: service, team size, experience.",
  route: "/vendor/onboarding",
  implementation: "Conditional rendering based on formData.vendor_type",
});

registerFeature({
  id: "onboarding_step5",
  group: "Vendor Onboarding",
  name: "Step 5 — photo upload",
  description: "Passport photo (circular, 2MB) + shop photo (rectangular, 5MB). Both required. vendor-photos bucket.",
  route: "/vendor/onboarding",
  implementation: "2 upload slots, Supabase storage vendor-photos bucket",
});

registerFeature({
  id: "onboarding_step6",
  group: "Vendor Onboarding",
  name: "Step 6 — documents (Aadhaar + PAN)",
  description: "Aadhaar (Required), PAN (Required), GST (Optional). Next disabled until both uploaded. vendor-documents bucket.",
  route: "/vendor/onboarding",
  implementation: "3 slots, canProceed = !!aadhaar_url && !!pan_url",
});

registerFeature({
  id: "onboarding_step7",
  group: "Vendor Onboarding",
  name: "Step 7 — review and submit",
  description: "Summary cards with Edit buttons. Terms checkbox. profiles.upsert status=pending_review. Success screen with timeline.",
  route: "/vendor/onboarding",
  implementation: "Summary, profiles upsert, success screen",
});
