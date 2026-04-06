import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useImagePicker = () => {
  const [uploading, setUploading] = useState(false);

  const pickImage = async (source: "camera" | "gallery" = "gallery"): Promise<Blob> => {
    if (Capacitor.isNativePlatform()) {
      const image = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: source === "camera" ? CameraSource.Camera : CameraSource.Photos,
        width: 1200,
        height: 1200,
      });

      if (!image.base64String) throw new Error("No image data");

      const byteChars = atob(image.base64String);
      const byteArr = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
      return new Blob([byteArr], { type: `image/${image.format || "jpeg"}` });
    }

    // Web fallback
    return new Promise<Blob>((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      if (source === "camera") input.capture = "environment";
      input.onchange = () => {
        const file = input.files?.[0];
        if (file) resolve(file);
        else reject(new Error("No file selected"));
      };
      input.click();
    });
  };

  const uploadToSupabase = async (blob: Blob, bucket: string, path: string): Promise<string> => {
    setUploading(true);
    try {
      const fileName = `${path}/${Date.now()}.jpg`;
      const { data, error } = await supabase.storage.from(bucket).upload(fileName, blob, {
        contentType: "image/jpeg",
        cacheControl: "3600",
      });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
      return urlData.publicUrl;
    } finally {
      setUploading(false);
    }
  };

  return { pickImage, uploadToSupabase, uploading };
};
