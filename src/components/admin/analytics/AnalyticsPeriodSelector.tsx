
import React from 'react';
import { Button } from '@/components/ui/button';
import { TIMEFRAMES, AnalyticsTimeframe } from '@/services/analyticsService';

interface AnalyticsPeriodSelectorProps {
  selectedDays: number;
  onSelectDays: (days: number) => void;
}

const AnalyticsPeriodSelector: React.FC<AnalyticsPeriodSelectorProps> = ({
  selectedDays,
  onSelectDays
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {TIMEFRAMES.map((timeframe: AnalyticsTimeframe) => (
        <Button
          key={timeframe.days}
          variant={selectedDays === timeframe.days ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelectDays(timeframe.days)}
        >
          {timeframe.label}
        </Button>
      ))}
    </div>
  );
};

export default AnalyticsPeriodSelector;
