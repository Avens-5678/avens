import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";

export const openExternalUrl = async (url: string) => {
  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url, presentationStyle: "popover" });
  } else {
    window.open(url, "_blank");
  }
};
