import { StatusBar, Style } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";
import { useEffect } from "react";

export const useStatusBar = () => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    StatusBar.setStyle({ style: Style.Light });
    StatusBar.setBackgroundColor({ color: "#ffffff" });
  }, []);
};
