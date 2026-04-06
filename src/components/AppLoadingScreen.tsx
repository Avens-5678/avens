interface AppLoadingScreenProps {
  visible: boolean;
}

const AppLoadingScreen = ({ visible }: AppLoadingScreenProps) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-3xl font-brand font-bold italic tracking-tight uppercase text-[#1a1a2e]">
          Evnting<span className="text-[#F97316]">.com</span>
        </h1>
      </div>
    </div>
  );
};

export default AppLoadingScreen;
