import { useWebGazer } from '@/hooks/useWebGazer';
import { useDwellSelection } from '@/hooks/useDwellSelection';
import { SelectionZone } from './SelectionZone';
import { NeutralZone } from './NeutralZone';
import { LoadingScreen } from './LoadingScreen';
import { ErrorScreen } from './ErrorScreen';

const NEUTRAL_ZONE_WIDTH_PERCENT = 15;

export function EyeTrackingInterface() {
  const { gazeState, isInitialized, isLoading, error } = useWebGazer();
  const { selectionState, selectedOption, dwellProgress } = useDwellSelection(gazeState);

  if (error) {
    return <ErrorScreen error={error} />;
  }

  if (isLoading || !isInitialized) {
    return <LoadingScreen />;
  }

  const isYesActive = gazeState === 'LOOKING_AT_YES' && selectionState === 'dwelling';
  const isNoActive = gazeState === 'LOOKING_AT_NO' && selectionState === 'dwelling';
  const isYesSelected = selectedOption === 'YES';
  const isNoSelected = selectedOption === 'NO';

  return (
    <div className="fixed inset-0 flex flex-row overflow-hidden select-none cursor-none">
      {/* YES Zone (Left) */}
      <SelectionZone
        type="YES"
        isActive={isYesActive}
        dwellProgress={isYesActive ? dwellProgress : 0}
        isSelected={isYesSelected}
      />
      
      {/* Neutral Zone (Center) */}
      <NeutralZone widthPercent={NEUTRAL_ZONE_WIDTH_PERCENT} />
      
      {/* NO Zone (Right) */}
      <SelectionZone
        type="NO"
        isActive={isNoActive}
        dwellProgress={isNoActive ? dwellProgress : 0}
        isSelected={isNoSelected}
      />
    </div>
  );
}
