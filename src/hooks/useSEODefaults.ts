import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Reads SEO defaults from site_settings and applies them
 * to the document head (title, meta description, og:image).
 * Only sets defaults — individual pages can override.
 */
export const useSEODefaults = () => {
  const { data: seo } = useQuery({
    queryKey: ["seo-defaults"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "seo_defaults")
        .maybeSingle();
      if (error) throw error;
      return data?.value as { title: string; description: string; og_image: string } | null;
    },
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (!seo) return;

    // Only set if not already overridden by a page
    if (seo.title && document.title === "Evnting - Premium Event Management") {
      document.title = seo.title;
    }

    const setMeta = (name: string, content: string, attr = "name") => {
      if (!content) return;
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    if (seo.description) {
      setMeta("description", seo.description);
      setMeta("og:description", seo.description, "property");
      setMeta("twitter:description", seo.description);
    }

    if (seo.title) {
      setMeta("og:title", seo.title, "property");
      setMeta("twitter:title", seo.title);
    }

    if (seo.og_image) {
      setMeta("og:image", seo.og_image, "property");
      setMeta("twitter:image", seo.og_image);
    }
  }, [seo]);
};
