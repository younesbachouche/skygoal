import React, { useEffect, useState } from "react";
import { X, ExternalLink } from "lucide-react";

interface StreamPopupProps {
  streams: {
    english?: string;
    arabic?: string;
    server3?: string;
    server4?: string;
  };
  onClose: () => void;
}

const StreamPopup: React.FC<StreamPopupProps> = ({ streams, onClose }) => {
  const servers = {
    english: streams.english?.trim() || "",
    arabic: streams.arabic?.trim() || "",
    server3: streams.server3?.trim() || "",
    server4: streams.server4?.trim() || "",
  };

  const getFirst = () => {
    if (servers.english) return "english";
    if (servers.arabic) return "arabic";
    if (servers.server3) return "server3";
    if (servers.server4) return "server4";
    return "english";
  };

  const [active, setActive] = useState<keyof typeof servers>(getFirst());
  const [iframeKey, setIframeKey] = useState(Date.now());

  const url = servers[active];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleServerChange = (server: keyof typeof servers) => {
    // Skip if same server
    if (server === active) return;
    
    // If server4, just open in new tab
    if (server === "server4" && servers.server4) {
      window.open(servers.server4, '_blank');
      return;
    }
    
    // Immediately switch server without showing loading
    setActive(server);
    // Force iframe reload by changing key
    setIframeKey(Date.now());
  };

  if (!url) {
    onClose();
    return null;
  }

  const isMobile = window.innerWidth < 768;

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/90 p-2 sm:p-4">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* Close button - FLOATING ABOVE POPUP ON MOBILE */}
      {isMobile && (
        <button
          onClick={onClose}
          className="relative mb-2 z-50 bg-black/80 hover:bg-red-600 text-white p-3 rounded-full transition-colors duration-200 shadow-lg"
        >
          <X size={26} className="text-red-400 hover:text-white" />
        </button>
      )}

      <div className="relative w-full max-w-4xl bg-gradient-to-br from-gray-900 to-black rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
        
        {/* Close button - INSIDE ON DESKTOP */}
        {!isMobile && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-50 bg-black/80 hover:bg-red-600 text-white p-2 rounded-full transition-colors duration-200 shadow-lg"
          >
            <X size={20} className="text-red-400 hover:text-white" />
          </button>
        )}

        {/* Server buttons */}
        <div className="flex flex-wrap gap-2 p-3 sm:p-4 justify-center bg-gradient-to-r from-gray-900 to-black border-b border-gray-800">
          {servers.english && (
            <button
              onClick={() => handleServerChange("english")}
              className={`
                px-4 sm:px-4 py-2.5 sm:py-2 rounded-lg font-medium transition-all duration-200
                ${active === "english" 
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
                }
                ${isMobile ? 'text-base min-w-[80px]' : 'text-sm'}
              `}
            >
              Server 1
            </button>
          )}
          {servers.arabic && (
            <button
              onClick={() => handleServerChange("arabic")}
              className={`
                px-4 sm:px-4 py-2.5 sm:py-2 rounded-lg font-medium transition-all duration-200
                ${active === "arabic" 
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
                }
                ${isMobile ? 'text-base min-w-[80px]' : 'text-sm'}
              `}
            >
              Server 2
            </button>
          )}
          {servers.server3 && (
            <button
              onClick={() => handleServerChange("server3")}
              className={`
                px-4 sm:px-4 py-2.5 sm:py-2 rounded-lg font-medium transition-all duration-200
                ${active === "server3" 
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
                }
                ${isMobile ? 'text-base min-w-[80px]' : 'text-sm'}
              `}
            >
              Server 3
            </button>
          )}
          {servers.server4 && (
            <button
              onClick={() => window.open(servers.server4, '_blank')}
              className={`
                px-4 sm:px-4 py-2.5 sm:py-2 rounded-lg font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700 transition-all duration-200 flex items-center gap-2
                ${isMobile ? 'text-base min-w-[80px]' : 'text-sm'}
              `}
            >
              Server 4 <ExternalLink size={isMobile ? 18 : 14} />
            </button>
          )}
        </div>

        {/* Stream Container - 16:9 Ratio */}
        <div className="relative w-full bg-black">
          <div 
            className="relative w-full mx-auto"
            style={{ 
              paddingBottom: '56.25%',
              maxWidth: isMobile ? '95vw' : '100%'
            }}
          >
            <iframe
              key={iframeKey}
              src={url}
              className="absolute top-0 left-0 w-full h-full border-0"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              title="Live Stream"
              // If iframe takes time to load, it will show black screen which is better than loading spinner
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamPopup;
