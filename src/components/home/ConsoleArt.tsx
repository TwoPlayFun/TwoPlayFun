/*
 * Hero illustration: a grey 90s-style console under a small CRT. The 1P port
 * has a cable in it; the 2P port waits with a blinking light. Drawn for this
 * site, no real hardware is depicted.
 */
export function ConsoleArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 560 470" className={className} role="img" aria-label="A grey game console under a small TV. Port 1 is plugged in, port 2 is waiting.">
      <defs>
        <linearGradient id="tv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3f2ee" />
          <stop offset="1" stopColor="#cfcdc6" />
        </linearGradient>
        <linearGradient id="top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#efeee9" />
          <stop offset="1" stopColor="#dad8d1" />
        </linearGradient>
        <linearGradient id="front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9c7c0" />
          <stop offset="1" stopColor="#aeaca5" />
        </linearGradient>
        <radialGradient id="glass" cx="0.5" cy="0.42" r="0.75">
          <stop offset="0" stopColor="#2a2f3a" />
          <stop offset="0.7" stopColor="#15171c" />
          <stop offset="1" stopColor="#0b0c0f" />
        </radialGradient>
        <pattern id="scan" width="4" height="3" patternUnits="userSpaceOnUse">
          <rect width="4" height="1" fill="rgba(255,255,255,0.05)" />
        </pattern>
        <pattern id="dith" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="2" height="2" fill="rgba(0,0,0,0.08)" />
          <rect x="2" y="2" width="2" height="2" fill="rgba(0,0,0,0.08)" />
        </pattern>
        <clipPath id="screenClip">
          <rect x="84" y="44" width="392" height="214" rx="16" />
        </clipPath>
      </defs>

      {/* shadow */}
      <ellipse cx="280" cy="452" rx="250" ry="12" fill="rgba(30,31,37,0.18)" />

      {/* TV */}
      <rect x="44" y="12" width="472" height="282" rx="26" fill="url(#tv)" stroke="#8f8d86" strokeWidth="2" />
      <rect x="44" y="12" width="472" height="282" rx="26" fill="url(#dith)" />
      <rect x="70" y="32" width="420" height="238" rx="20" fill="#2a2c33" />
      <rect x="84" y="44" width="392" height="214" rx="16" fill="url(#glass)" />
      <g clipPath="url(#screenClip)">
        {/* perspective floor */}
        {[-6, -4, -2, 0, 2, 4, 6].map((i) => (
          <line key={i} x1={280 + i * 6} y1="170" x2={280 + i * 70} y2="258" stroke="rgba(214,230,220,0.22)" />
        ))}
        {[176, 186, 200, 220, 246].map((y) => (
          <line key={y} x1="84" y1={y} x2="476" y2={y} stroke="rgba(214,230,220,0.18)" />
        ))}
        {/* low-poly ETH crystal */}
        <g>
          <animateTransform attributeName="transform" type="translate" values="0 0; 0 -6; 0 0" dur="2.6s" repeatCount="indefinite" />
          <path d="M190 78 L168 116 L190 124 Z" fill="#e9ecf3" />
          <path d="M190 78 L212 116 L190 124 Z" fill="#9aa3bd" />
          <path d="M168 116 L190 124 L190 156 Z" fill="#7d86a3" />
          <path d="M212 116 L190 124 L190 156 Z" fill="#4b5370" />
        </g>
        {/* low-poly coin */}
        <g>
          <animateTransform attributeName="transform" type="translate" values="0 -5; 0 2; 0 -5" dur="2.2s" repeatCount="indefinite" />
          <path d="M350 92 L374 104 L374 136 L350 148 L326 136 L326 104 Z" fill="#d9a441" />
          <path d="M350 92 L326 104 L326 136 L350 120 Z" fill="#f2cf7c" />
          <path d="M350 120 L374 136 L350 148 Z" fill="#9c6f1c" />
          <rect x="346" y="106" width="8" height="28" fill="#6e4c10" />
        </g>
        <text x="280" y="122" fill="#d6e6dc" fontSize="22" style={{ fontFamily: "var(--font-pixel), monospace" }} textAnchor="middle">
          +
        </text>
        <text x="280" y="206" fill="#d6e6dc" fontSize="15" style={{ fontFamily: "var(--font-pixel), monospace" }} textAnchor="middle">
          PLAYER 2
        </text>
        <text x="280" y="230" fill="#9df0b4" fontSize="12" style={{ fontFamily: "var(--font-pixel), monospace" }} textAnchor="middle">
          PRESS START
          <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1s" repeatCount="indefinite" />
        </text>
        <rect x="84" y="44" width="392" height="214" fill="url(#scan)" />
      </g>
      {/* TV controls */}
      <circle cx="470" cy="282" r="4" fill="#2fae57" />
      <rect x="96" y="278" width="60" height="4" rx="2" fill="#a9a7a0" />
      {/* TV feet */}
      <rect x="150" y="294" width="60" height="10" rx="3" fill="#a9a7a0" />
      <rect x="350" y="294" width="60" height="10" rx="3" fill="#a9a7a0" />

      {/* console: top face */}
      <path d="M96 318 L464 318 L500 352 L60 352 Z" fill="url(#top)" stroke="#8f8d86" strokeWidth="2" strokeLinejoin="round" />
      {/* disc lid */}
      <ellipse cx="226" cy="335" rx="96" ry="12" fill="#e4e2dc" stroke="#a9a7a0" strokeWidth="2" />
      <ellipse cx="226" cy="335" rx="20" ry="3" fill="#c2c0b9" />
      {/* buttons on top */}
      <ellipse cx="380" cy="334" rx="16" ry="5" fill="#b9b7b0" stroke="#8f8d86" />
      <ellipse cx="424" cy="334" rx="12" ry="4" fill="#b9b7b0" stroke="#8f8d86" />
      <circle cx="452" cy="333" r="3" fill="#2fae57" />
      {/* front face */}
      <path d="M60 352 L500 352 L500 420 Q500 432 488 432 L72 432 Q60 432 60 420 Z" fill="url(#front)" stroke="#8f8d86" strokeWidth="2" strokeLinejoin="round" />
      <path d="M60 352 L500 352 L500 420 Q500 432 488 432 L72 432 Q60 432 60 420 Z" fill="url(#dith)" />
      {/* vents */}
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={330 + i * 12} y="370" width="5" height="40" rx="2" fill="#9a988f" />
      ))}
      {/* ports */}
      <g>
        <rect x="96" y="372" width="64" height="34" rx="6" fill="#3a3d46" stroke="#1e1f25" strokeWidth="2" />
        <rect x="108" y="382" width="40" height="14" rx="3" fill="#15171c" />
        <text x="128" y="424" fill="#474952" fontSize="11" style={{ fontFamily: "var(--font-pixel), monospace" }} textAnchor="middle">
          1P
        </text>
        <circle cx="172" cy="380" r="4" fill="#2fae57" />
      </g>
      <g>
        <rect x="200" y="372" width="64" height="34" rx="6" fill="#3a3d46" stroke="#1e1f25" strokeWidth="2" />
        <rect x="212" y="382" width="40" height="14" rx="3" fill="#15171c" />
        <text x="232" y="424" fill="#474952" fontSize="11" style={{ fontFamily: "var(--font-pixel), monospace" }} textAnchor="middle">
          2P
        </text>
        <circle cx="276" cy="380" r="4" fill="#cc3f35">
          <animate attributeName="opacity" values="1;1;0.15;0.15" keyTimes="0;0.5;0.5;1" dur="1.2s" repeatCount="indefinite" />
        </circle>
      </g>
      {/* cable from 1P */}
      <rect x="114" y="378" width="28" height="22" rx="3" fill="#ecebe6" stroke="#8f8d86" strokeWidth="2" />
      <path d="M128 400 C128 446 70 430 40 460 C24 476 10 470 0 466" fill="none" stroke="#2b2d34" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
