export default function BabyDinoIcon({ className = "w-20 h-20 sm:w-24 sm:h-24" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 120"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 몸체 */}
      <path
        d="M20 80 C20 50 30 30 60 30 C75 30 85 40 90 50 C110 50 115 70 105 90 C90 115 70 115 55 100 C45 90 30 90 20 80 Z"
        fill="#4BB74E"
        stroke="#1F661E"
        strokeWidth="5"
      />
      {/* 목 */}
      <path
        d="M60 30 C55 25 55 15 60 10 C70 5 80 10 85 20 C85 30 85 45 75 55"
        fill="#4BB74E"
        stroke="#1F661E"
        strokeWidth="5"
      />
      {/* 머리 */}
      <path
        d="M75 55 C80 55 95 55 100 65 C103 72 100 82 90 85 C80 88 70 85 68 75 C66 65 70 58 75 55 Z"
        fill="#4BB74E"
        stroke="#1F661E"
        strokeWidth="5"
      />
      {/* 눈 */}
      <circle cx="88" cy="64" r="5" fill="#FFFFFF" />
      <circle cx="88" cy="64" r="2.5" fill="#1F661E" />
      {/* 입 */}
      <path
        d="M82 74 C88 78 96 76 100 70"
        stroke="#1F661E"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      {/* 배 */}
      <path
        d="M55 45 C65 50 80 52 95 55 C90 70 85 80 70 82 C60 83 50 78 45 68"
        fill="#A6F487"
      />
      {/* 다리 */}
      <rect x="35" y="85" width="18" height="25" rx="4" fill="#4BB74E" stroke="#1F661E" strokeWidth="5" />
      <rect x="70" y="85" width="18" height="25" rx="4" fill="#4BB74E" stroke="#1F661E" strokeWidth="5" />
      {/* 꼬리 */}
      <path
        d="M20 80 C5 75 5 70 10 60 C20 45 40 40 50 45"
        fill="#4BB74E"
        stroke="#1F661E"
        strokeWidth="5"
      />
      {/* 배색선 */}
      <path d="M25 67 L40 67" stroke="#1F661E" strokeWidth="5" />
      <path d="M30 75 L45 75" stroke="#1F661E" strokeWidth="5" />
    </svg>
  );
}