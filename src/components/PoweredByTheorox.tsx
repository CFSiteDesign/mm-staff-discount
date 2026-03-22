import theoroxLogo from "@/assets/theorox-logo.png";

export default function PoweredByTheorox() {
  return (
    <a href="https://theorox.com" target="_blank" rel="noopener noreferrer" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
      <span className="text-xs text-white font-medium drop-shadow-md">Powered by</span>
      <img src={theoroxLogo} alt="TheoroX" className="h-10 drop-shadow-md" />
    </a>
  );
}
