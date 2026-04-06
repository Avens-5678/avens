import { App, URLOpenListenerEvent } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

export const initDeepLinks = (navigate: (path: string) => void) => {
  if (!Capacitor.isNativePlatform()) return;

  App.addListener("appUrlOpen", (event: URLOpenListenerEvent) => {
    try {
      const url = new URL(event.url);
      const path = url.pathname + url.search;
      navigate(path || "/ecommerce");
    } catch {
      // Custom scheme URL (evnting://path)
      const path = event.url.replace(/^evnting:\/\//, "/");
      navigate(path || "/ecommerce");
    }
  });
};
