import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

const Logo = ({ className }: LogoProps) => {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="relative">
        {/* 3D Blocks representing the logo */}
        <div className="flex items-end space-x-1">
          <div className="w-3 h-6 bg-gradient-to-b from-blue-400 to-blue-500 transform rotate-12 opacity-80"></div>
          <div className="w-3 h-8 bg-gradient-to-b from-blue-300 to-blue-400 transform -rotate-6"></div>
          <div className="w-3 h-5 bg-gradient-to-b from-blue-500 to-blue-600 transform rotate-12 opacity-90"></div>
          <div className="w-3 h-7 bg-gradient-to-b from-blue-400 to-blue-500"></div>
        </div>
      </div>
      <div className="font-bold">
        <span className="text-red-500 text-xl">Avens</span>
        <div className="text-gray-600 text-sm -mt-1">Expositions Pvt. Ltd.</div>
      </div>
    </div>
  );
};

export default Logo;