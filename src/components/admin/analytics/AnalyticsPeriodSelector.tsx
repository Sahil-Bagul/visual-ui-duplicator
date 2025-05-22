
import React from 'react';
import { Button } from '@/components/ui/button';
import { TIMEFRAMES, AnalyticsTimeframe } from '@/services/analyticsService';

interface AnalyticsPeriodSelectorProps {
  selectedPeriod: AnalyticsTimeframe;
  onChange: (period: AnalyticsTimeframe) => void;
}

const AnalyticsPeriodSelector: React.FC<AnalyticsPeriodSelectorProps> = ({
  selectedPeriod,
  onChange
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {TIMEFRAMES.map((timeframe) => (
        <Button
          key={timeframe.value}
          variant={selectedPeriod === timeframe.value ? "default" : "outline"}
          className={selectedPeriod === timeframe.value ? "bg-[#00C853] hover:bg-[#00A846]" : ""}
          onClick={() => onChange(timeframe.value as AnalyticsTimeframe)}
          size="sm"
        >
          {timeframe.label}
        </Button>
      ))}
    </div>
  );
};

export default AnalyticsPeriodSelector;
