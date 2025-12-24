import React from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { League } from '@/data/leagues';

interface LeagueFilterProps {
  leagues: League[];
  selectedLeague: League;
  onSelectLeague: (league: League) => void;
}

const LeagueFilter = ({ leagues, selectedLeague, onSelectLeague }: LeagueFilterProps) => {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-3 px-1">
        {leagues.map((league) => {
          const isSelected = league.id === selectedLeague.id;
          
          return (
            <button
              key={league.id}
              onClick={() => onSelectLeague(league)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200
                text-xs sm:text-sm font-medium flex-shrink-0
                ${isSelected 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'bg-card hover:bg-muted border border-border/50'
                }`}
            >
              <img 
                src={league.logo} 
                alt={league.name}
                className="w-4 h-4 object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/16?text=?';
                }}
              />
              <span className="truncate max-w-[80px] sm:max-w-[100px]">{league.name}</span>
            </button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" className="h-1.5" />
    </ScrollArea>
  );
};

export default LeagueFilter;
