interface NeutralZoneProps {
  widthPercent: number;
}

export function NeutralZone({ widthPercent }: NeutralZoneProps) {
  return (
    <div
      className="neutral-zone h-full flex items-center justify-center"
      style={{ width: `${widthPercent}%` }}
    >
      <div className="w-px h-3/4 bg-white/10" />
    </div>
  );
}
