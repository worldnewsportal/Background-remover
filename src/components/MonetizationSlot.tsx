import { AD_CONFIG } from '../config';

interface MonetizationSlotProps {
  slotKey: keyof typeof AD_CONFIG.slots;
  label: string;
  compact?: boolean;
}

export function MonetizationSlot({ slotKey, label, compact = false }: MonetizationSlotProps) {
  if (!AD_CONFIG.enabled) return null;
  const slot = AD_CONFIG.slots[slotKey];
  if (!slot?.enabled) return null;

  const hasLiveAdsense = Boolean(AD_CONFIG.adsenseClientId && slot.adsenseSlotId);

  return (
    <aside
      aria-label={label}
      data-ad-slot={slot.id}
      className={`mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 ${
        compact ? 'my-3' : 'my-6'
      }`}
    >
      <div
        className={`flex items-center justify-center rounded-xl border border-dashed border-[#D1D5DB] bg-[#F3F4F6]/70 px-4 text-center text-xs text-[#6B7280] ${
          compact ? 'min-h-[56px] py-2' : 'min-h-[90px] py-4'
        }`}
      >
        {hasLiveAdsense ? (
          <ins
            className="adsbygoogle block w-full"
            style={{ display: 'block' }}
            data-ad-client={AD_CONFIG.adsenseClientId}
            data-ad-slot={slot.adsenseSlotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <span>{label}</span>
        )}
      </div>
    </aside>
  );
}
