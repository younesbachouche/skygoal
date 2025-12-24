import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import Hls from "hls.js";

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
  const getFirstAvailable = () => {
    if (streams.english) return "english" as const;
    if (streams.arabic) return "arabic" as const;
    if (streams.server3) return "server3" as const;
    if (streams.server4) return "server4" as const;
    return "english" as const;
  };

  const [active, setActive] = useState(getFirstAvailable());
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const getUrl = () => {
    switch (active) {
      case "english":
        return streams.english || "";
      case "arabic":
        return streams.arabic || "";
      case "server3":
        return streams.server3 || "";
      case "server4":
        return streams.server4 || "";
      default:
        return "";
    }
  };

  const url = getUrl();
  const isM3U8 = url.includes("m3u8");
  const isMobile = useIsMobile();

  useEffect(() => {
    let cancelled = false;
    const initHls = async () => {
      setPlaybackError(null);
      if (!isM3U8 || !videoRef.current) return;

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      try {
        videoRef.current.crossOrigin = "anonymous";
      } catch (e) {
        // ignore
      }

      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, debug: false, xhrSetup: (xhr) => { xhr.withCredentials = false; } });
        hlsRef.current = hls;
        hls.loadSource(url);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (cancelled) return;
          videoRef.current?.play().catch(() => {});
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.warn("HLS error", data);
          if (data && data.fatal) {
            try { hls.destroy(); } catch (e) {}
            hlsRef.current = null;

            if (videoRef.current && videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
              videoRef.current.src = url;
              videoRef.current.play().catch((err) => {
                console.warn("Native play failed", err);
                if (!cancelled) setPlaybackError("Playback failed — try opening the stream in a new tab.");
              });
            } else {
              if (!cancelled) setPlaybackError("Playback failed — try opening the stream in a new tab.");
            }
          }
        });
      } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
        videoRef.current.src = url;
        videoRef.current.play().catch((err) => {
          console.warn("Native play failed", err);
          if (!cancelled) setPlaybackError("Playback failed — try opening the stream in a new tab.");
        });
      } else {
        if (!cancelled) setPlaybackError("This browser does not support in-page HLS playback.");
      }
    };

    initHls();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      cancelled = true;
    };
  }, [url]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-4xl mx-auto transform transition-all duration-200">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
          <div className="relative">
            <div className="absolute top-3 right-3 z-20">
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full w-9 h-9">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-4 flex flex-wrap gap-3 items-center justify-center">
              {streams.english && (
                <button
                  onClick={() => setActive("english")}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-shadow focus:outline-none w-full sm:w-auto ${
                    active === "english" ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-foreground'
                  }`}
                >
                  Server 1
                </button>
              )}

              {streams.arabic && (
                <button
                  onClick={() => setActive("arabic")}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-shadow focus:outline-none w-full sm:w-auto ${
                    active === "arabic" ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-foreground'
                  }`}
                >
                  Server 2
                </button>
              )}

              {streams.server3 && (
                <button
                  onClick={() => setActive("server3")}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-shadow focus:outline-none w-full sm:w-auto ${
                    active === "server3" ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-foreground'
                  }`}
                >
                  Server 3
                </button>
              )}

              {streams.server4 && (
                <button
                  onClick={() => window.open(streams.server4, "_blank")}
                  className="px-4 py-2 rounded-full text-sm font-semibold bg-transparent border border-gray-200 dark:border-gray-700 w-full sm:w-auto"
                >
                  Backup
                </button>
              )}
            </div>

            <div className="w-full bg-black flex items-center justify-center">
              <div className="w-full h-[55vh] md:h-[65vh] lg:h-[70vh] rounded-b-2xl overflow-hidden relative">
                {playbackError ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-black text-center p-4">
                    <p className="text-sm text-white mb-3">{playbackError}</p>
                    <div className="flex gap-3">
                      <Button onClick={() => window.open(url, "_blank")}>
                        Open in new tab
                      </Button>
                      <Button variant="ghost" onClick={() => setPlaybackError(null)}>
                        Try again
                      </Button>
                    </div>
                  </div>
                ) : isM3U8 ? (
                  <video
                    ref={videoRef}
                    key={url}
                    controls
                    className="w-full h-full bg-black object-contain"
                    playsInline
                    autoPlay
                    muted
                  />
                ) : (
                  <iframe
                    key={url}
                    src={url}
                    title="stream-player"
                    className="w-full h-full"
                    style={{ border: "none", backgroundColor: "#000" }}
                    allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamPopup;