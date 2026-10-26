// SVG botanical and topographic decorative elements for TERRA

export function TopographicLines({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 300" fill="none" preserveAspectRatio="xMidYMid slice">
      <g stroke="#52634A" strokeWidth="0.6" fill="none" opacity="0.15">
        <path d="M0 150 Q100 110 200 150 T400 150" />
        <path d="M0 130 Q100 90 200 130 T400 130" />
        <path d="M0 170 Q100 130 200 170 T400 170" />
        <path d="M0 110 Q100 70 200 110 T400 110" />
        <path d="M0 190 Q100 150 200 190 T400 190" />
        <path d="M0 90 Q100 50 200 90 T400 90" />
        <path d="M0 210 Q100 170 200 210 T400 210" />
        <path d="M0 70 Q100 30 200 70 T400 70" />
        <path d="M0 230 Q100 190 200 230 T400 230" />
        <ellipse cx="200" cy="150" rx="60" ry="40" />
        <ellipse cx="200" cy="150" rx="80" ry="55" />
        <ellipse cx="200" cy="150" rx="100" ry="70" />
        <ellipse cx="200" cy="150" rx="120" ry="85" />
        <ellipse cx="200" cy="150" rx="140" ry="100" />
      </g>
    </svg>
  );
}

export function LeafIcon({ className = '', size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6" />
    </svg>
  );
}

export function CompassIcon({ className = '', size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88" fill="currentColor" opacity="0.3" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
    </svg>
  );
}

export function LeafAndCompass({ size = 28 }: { size?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <LeafIcon size={size} className="text-olive" />
      <CompassIcon size={size * 0.7} className="text-terracotta" />
    </div>
  );
}

export function BotanicalBranch({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 200" fill="none" preserveAspectRatio="xMidYMid meet">
      <g stroke="#52634A" strokeWidth="1" fill="none" opacity="0.25">
        <path d="M60 200 Q55 160 60 120 Q65 80 58 40 Q55 20 60 0" strokeWidth="1.5" />
        <path d="M60 170 Q45 165 35 155" />
        <path d="M35 155 Q30 148 35 142 Q42 145 35 155" fill="#C5D0B8" opacity="0.4" />
        <path d="M60 150 Q75 145 85 135" />
        <path d="M85 135 Q90 128 85 122 Q78 125 85 135" fill="#C5D0B8" opacity="0.4" />
        <path d="M60 120 Q45 115 35 105" />
        <path d="M35 105 Q30 98 35 92 Q42 95 35 105" fill="#C5D0B8" opacity="0.4" />
        <path d="M60 90 Q75 85 85 75" />
        <path d="M85 75 Q90 68 85 62 Q78 65 85 75" fill="#C5D0B8" opacity="0.4" />
        <path d="M60 60 Q50 55 42 48" />
        <path d="M42 48 Q38 42 42 37 Q48 40 42 48" fill="#C5D0B8" opacity="0.4" />
        <path d="M58 35 Q65 30 70 25" />
        <path d="M70 25 Q73 20 70 16 Q65 19 70 25" fill="#C5D0B8" opacity="0.4" />
      </g>
    </svg>
  );
}

export function ContourPattern({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 600 400" fill="none" preserveAspectRatio="xMidYMid slice">
      <g stroke="#52634A" strokeWidth="0.5" fill="none" opacity="0.1">
        <path d="M0 200 Q150 150 300 200 T600 200" />
        <path d="M0 180 Q150 130 300 180 T600 180" />
        <path d="M0 220 Q150 170 300 220 T600 220" />
        <path d="M0 160 Q150 110 300 160 T600 160" />
        <path d="M0 240 Q150 190 300 240 T600 240" />
        <path d="M0 140 Q150 90 300 140 T600 140" />
        <path d="M0 260 Q150 210 300 260 T600 260" />
        <path d="M0 120 Q150 70 300 120 T600 120" />
        <path d="M0 280 Q150 230 300 280 T600 280" />
        <circle cx="300" cy="200" r="50" />
        <circle cx="300" cy="200" r="75" />
        <circle cx="300" cy="200" r="100" />
        <circle cx="300" cy="200" r="125" />
        <circle cx="300" cy="200" r="150" />
        <circle cx="450" cy="120" r="30" />
        <circle cx="450" cy="120" r="50" />
        <circle cx="450" cy="120" r="70" />
        <circle cx="150" cy="280" r="25" />
        <circle cx="150" cy="280" r="40" />
      </g>
    </svg>
  );
}

export function FlowingPath({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 600 100" fill="none" preserveAspectRatio="none">
      <path
        d="M0 50 Q100 20 200 50 T400 50 T600 50"
        stroke="#52634A"
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="4 4"
        opacity="0.3"
        className="animate-draw"
      />
    </svg>
  );
}

export function DashedRoute({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 4" fill="none" preserveAspectRatio="none">
      <line x1="0" y1="2" x2="100" y2="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
    </svg>
  );
}

export function SmallLeaf({ className = '', size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 15A4.5 4.5 0 0 1 7.3 6.5C10.5 6 11.5 5.7 12.5 4c.5 1 1 2.5 1 4.5 0 3-2.8 5.5-5.5 5.5Z" />
      <path d="M2 14c0-1.5 1-2.8 3-3.2" />
    </svg>
  );
}
