import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";

export const shareContent = async (options: {
  title: string;
  text: string;
  url: string;
}) => {
  if (Capacitor.isNativePlatform()) {
    await Share.share(options);
  } else if (navigator.share) {
    await navigator.share(options);
  } else {
    await navigator.clipboard.writeText(options.url);
  }
};
