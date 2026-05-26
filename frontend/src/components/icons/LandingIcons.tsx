/**
 * Landing Page Icons — Lucide-style outline (stroke 1.6)
 * Used exclusively in the landing page hero visuals and feature cards
 */

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

const IconWrapper: React.FC<{
  children: React.ReactNode;
  size: number;
  color: string;
  strokeWidth: number;
  style?: React.CSSProperties;
}> = ({ children, size, color, strokeWidth, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "block", flexShrink: 0, ...style }}
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const IcHeartPulse: React.FC<IconProps> = ({
  size = 20,
  color = "currentColor",
  strokeWidth = 1.6,
  style,
}) => (
  <IconWrapper size={size} color={color} strokeWidth={strokeWidth} style={style}>
    <path d="M3.5 12h3l2-5 3 9 2-5 1.5 1H21" />
    <path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"
      opacity="0.45"
    />
  </IconWrapper>
);

export const IcActivity: React.FC<IconProps> = ({
  size = 20,
  color = "currentColor",
  strokeWidth = 1.6,
  style,
}) => (
  <IconWrapper size={size} color={color} strokeWidth={strokeWidth} style={style}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </IconWrapper>
);

export const IcThermometer: React.FC<IconProps> = ({
  size = 20,
  color = "currentColor",
  strokeWidth = 1.6,
  style,
}) => (
  <IconWrapper size={size} color={color} strokeWidth={strokeWidth} style={style}>
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    <path d="M11.5 16a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor" />
  </IconWrapper>
);

export const IcAlertTriangle: React.FC<IconProps> = ({
  size = 20,
  color = "currentColor",
  strokeWidth = 1.6,
  style,
}) => (
  <IconWrapper size={size} color={color} strokeWidth={strokeWidth} style={style}>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </IconWrapper>
);

export const IcBarChart: React.FC<IconProps> = ({
  size = 20,
  color = "currentColor",
  strokeWidth = 1.6,
  style,
}) => (
  <IconWrapper size={size} color={color} strokeWidth={strokeWidth} style={style}>
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
    <line x1="3" y1="20" x2="21" y2="20" />
  </IconWrapper>
);

export const IcBroadcast: React.FC<IconProps> = ({
  size = 20,
  color = "currentColor",
  strokeWidth = 1.6,
  style,
}) => (
  <IconWrapper size={size} color={color} strokeWidth={strokeWidth} style={style}>
    <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
    <path d="M16 8a5 5 0 0 1 0 8" />
    <path d="M8 16a5 5 0 0 1 0-8" />
    <path d="M19 5a9 9 0 0 1 0 14" />
    <path d="M5 19A9 9 0 0 1 5 5" />
  </IconWrapper>
);

export const IcArrowRight: React.FC<IconProps> = ({
  size = 20,
  color = "currentColor",
  strokeWidth = 1.6,
  style,
}) => (
  <IconWrapper size={size} color={color} strokeWidth={strokeWidth} style={style}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </IconWrapper>
);

export const IcPlay: React.FC<IconProps> = ({
  size = 20,
  color = "currentColor",
  strokeWidth = 1.6,
  style,
}) => (
  <IconWrapper size={size} color={color} strokeWidth={strokeWidth} style={style}>
    <polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none" />
  </IconWrapper>
);

export const IcCheck: React.FC<IconProps> = ({
  size = 20,
  color = "currentColor",
  strokeWidth = 1.6,
  style,
}) => (
  <IconWrapper size={size} color={color} strokeWidth={strokeWidth} style={style}>
    <polyline points="20 6 9 17 4 12" />
  </IconWrapper>
);
