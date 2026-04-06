import { useState } from "react";
import { Capacitor } from "@capacitor/core";
import { useImagePicker } from "@/hooks/useImagePicker";
import { Camera as CameraIcon, Image, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImagePickerButtonProps {
  onImageSelected: (blob: Blob) => void;
  label?: string;
  className?: string;
}

const ImagePickerButton = ({ onImageSelected, label = "Add Photo", className }: ImagePickerButtonProps) => {
  const { pickImage } = useImagePicker();
  const [showSheet, setShowSheet] = useState(false);
  const [loading, setLoading] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  const handlePick = async (source: "camera" | "gallery") => {
    setShowSheet(false);
    setLoading(true);
    try {
      const blob = await pickImage(source);
      onImageSelected(blob);
    } catch {
      // User cancelled — ignore
    } finally {
      setLoading(false);
    }
  };

  if (!isNative) {
    // Web: simple file picker
    return (
      <Button
        variant="outline"
        size="sm"
        className={className}
        disabled={loading}
        onClick={() => handlePick("gallery")}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Image className="h-4 w-4 mr-1.5" />}
        {label}
      </Button>
    );
  }

  // Native: show camera/gallery action sheet
  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className={className}
        disabled={loading}
        onClick={() => setShowSheet(true)}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <CameraIcon className="h-4 w-4 mr-1.5" />}
        {label}
      </Button>

      {showSheet && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setShowSheet(false)} />
          <div className="fixed bottom-0 inset-x-0 z-50 bg-background rounded-t-2xl p-4 space-y-2 animate-in slide-in-from-bottom" style={{ paddingBottom: "calc(1rem + var(--safe-area-bottom))" }}>
            <button
              onClick={() => handlePick("camera")}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-muted transition-colors text-left"
            >
              <CameraIcon className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Take Photo</span>
            </button>
            <button
              onClick={() => handlePick("gallery")}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-muted transition-colors text-left"
            >
              <Image className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Choose from Gallery</span>
            </button>
            <button
              onClick={() => setShowSheet(false)}
              className="w-full p-3 rounded-xl text-sm font-medium text-muted-foreground text-center"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ImagePickerButton;
