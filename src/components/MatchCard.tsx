import React, { useState, useEffect, useRef } from "react";

interface Team {
  name: string;
  logo: string;
}

interface MatchProps {
  match: {
    team1: Team;
    team2: Team;
    competitionLogo: string;
    competitionDarkLogo: string;
    competitionName: string;
    matchTime: string;
    streamUrlEnglish: string;
    streamUrlArabic: string;
    streamUrlServer3: string;
  };
  index: number;
  onOpenStream: (englishUrl: string, arabicUrl: string, server3Url: string) => void;
  isEnded?: boolean;
}

const MatchCard = ({ match, index, onOpenStream, isEnded = false }: MatchProps) => {
  const [matchStatus, setMatchStatus] = useState<"upcoming" | "starting-soon" | "live" | "ended">(
    isEnded ? "ended" : "upcoming"
  );
  const [countdown, setCountdown] = useState<string>("00:00:00");
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      const matchStartTime = new Date(match.matchTime).getTime();
      const matchEndTime = matchStartTime + 2 * 60 * 60 * 1000;
      const currentTime = new Date().getTime();

      if (currentTime >= matchEndTime) {
        setMatchStatus("ended");
      } else if (currentTime >= matchStartTime - 5 * 60 * 1000) {
        setMatchStatus("live");
      } else if (currentTime >= matchStartTime - 30 * 60 * 1000) {
        setMatchStatus("starting-soon");
      } else {
        setMatchStatus("upcoming");

        let remainingTime = matchStartTime - currentTime;
        let hours = Math.floor(remainingTime / (1000 * 60 * 60));
        let minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

        const formattedHours = hours.toString().padStart(2, "0");
        const formattedMinutes = minutes.toString().padStart(2, "0");
        const formattedSeconds = seconds.toString().padStart(2, "0");

        setCountdown(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`);
        setRemainingSeconds(hours * 3600 + minutes * 60 + seconds);
      }
    };

    updateStatus();
    const intervalId = setInterval(updateStatus, 1000);
    return () => clearInterval(intervalId);
  }, [match.matchTime, isEnded]);

  // FIX: Define the handleOpenStream function that was missing
  const handleOpenStream = () => {
    onOpenStream(match.streamUrlEnglish, match.streamUrlArabic, match.streamUrlServer3);
  };

  const convertToLocalTime = (utcTime: string) => {
    const matchDate = new Date(utcTime);
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZoneName: "short"
    };
    return new Intl.DateTimeFormat(undefined, options).format(matchDate);
  };

  const getAnimationProgress = () => {
    const totalSeconds = 3600 * 3;
    const progress = (remainingSeconds / totalSeconds) * 100;
    return Math.min(progress, 100);
  };

  return (
    <div
      className={`bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden animate-fade-in
        ${isEnded ? 'opacity-60' : 'hover:shadow-md transition-shadow duration-300'}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="p-3 sm:p-4">
        {/* Competition Badge - Top */}
        <div className="flex justify-center mb-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium bg-accent/10 text-accent border border-accent/20">
            <img
              src={document.documentElement.classList.contains("dark") ? match.competitionDarkLogo : match.competitionLogo}
              alt="Competition"
              className="w-3 h-3 sm:w-4 sm:h-4 object-contain"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/16?text=?';
              }}
            />
            <span className="truncate max-w-[100px] sm:max-w-[120px]">{match.competitionName}</span>
          </div>
        </div>

        {/* Teams Row */}
        <div className="flex items-center justify-between gap-2">
          {/* Team 1 */}
          <div className="flex flex-col items-center flex-1 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-muted/50 flex items-center justify-center p-1.5 ring-1 ring-border/30">
              <img
                src={match.team1.logo}
                alt={match.team1.name}
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/40?text=?';
                }}
              />
            </div>
            <p className="mt-1.5 font-medium text-xs sm:text-sm text-center leading-tight truncate w-full px-1">
              {match.team1.name}
            </p>
          </div>

          {/* Match Status - Center */}
          <div className="flex flex-col items-center justify-center px-2 min-w-[80px] sm:min-w-[100px]">
            {matchStatus === "upcoming" && (
              <>
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">
                  {convertToLocalTime(match.matchTime)}
                </p>
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex justify-center items-center">
                  <svg className="absolute w-full h-full transform -rotate-90">
                    <circle
                      className="text-muted"
                      strokeWidth="2"
                      stroke="currentColor"
                      fill="transparent"
                      r="22"
                      cx="50%"
                      cy="50%"
                    />
                    <circle
                      className="text-secondary transition-all duration-1000"
                      strokeDasharray={`${2 * Math.PI * 22}`}
                      strokeDashoffset={`${2 * Math.PI * 22 * (100 - getAnimationProgress()) / 100}`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="22"
                      cx="50%"
                      cy="50%"
                    />
                  </svg>
                  <p className="text-[9px] sm:text-[10px] font-mono font-medium text-muted-foreground z-10">
                    {countdown}
                  </p>
                </div>
              </>
            )}

            {matchStatus === "starting-soon" && (
              <button
                onClick={handleOpenStream}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold
                  bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-transform active:scale-95"
              >
                Starts Soon
              </button>
            )}

            {matchStatus === "live" && (
              <button
                onClick={handleOpenStream}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold
                  bg-destructive text-destructive-foreground shadow-lg shadow-destructive/30
                  animate-pulse transition-transform active:scale-95"
              >
                LIVE
              </button>
            )}

            {matchStatus === "ended" && (
              <div className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                Ended
              </div>
            )}
          </div>

          {/* Team 2 */}
          <div className="flex flex-col items-center flex-1 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-muted/50 flex items-center justify-center p-1.5 ring-1 ring-border/30">
              <img
                src={match.team2.logo}
                alt={match.team2.name}
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/40?text=?';
                }}
              />
            </div>
            <p className="mt-1.5 font-medium text-xs sm:text-sm text-center leading-tight truncate w-full px-1">
              {match.team2.name}
            </p>
          </div>
        </div>
      </div>

      <video ref={videoRef} className="hidden" playsInline muted />
    </div>
  );
};

export default MatchCard;
