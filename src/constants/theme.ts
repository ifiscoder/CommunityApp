export const theme = {
  dark: true,
  colors: {
    // Primary - Desaturated Sky Blue (better for dark mode per research)
    primary: '#60A5FA', // Blue 400 - Slightly desaturated for WCAG compliance
    primaryContainer: '#1E3A5F', // Deep Blue container with depth

    // Secondary - Softer slate for readability
    secondary: '#94A3B8', // Slate 400 - Elegant secondary text
    secondaryContainer: '#1E293B', // Slate 800

    // Backgrounds - Using dark gray instead of pure black (reduces eye strain)
    background: '#0F172A', // Slate 900 - Deep Rich Background
    surface: '#1E293B', // Slate 800 - Card Surface
    surfaceVariant: '#334155', // Slate 700 - Slightly Lighter Surface
    surfaceDisabled: '#1E293B80', // 50% opacity surface

    // Error States
    error: '#F87171', // Red 400 - Desaturated for dark mode
    errorContainer: '#450a0a', // Red 950 - Deep error bg

    // On Colors - Using off-white instead of pure white (reduces halation)
    onPrimary: '#0F172A', // Dark text on primary button
    onPrimaryContainer: '#DBEAFE', // Blue 100
    onSecondary: '#0F172A',
    onSecondaryContainer: '#E2E8F0', // Slate 200
    onSurface: '#E2E8F0', // Slate 200 - Primary Text (87% white equivalent)
    onBackground: '#E2E8F0', // Slate 200 - Text on background
    onSurfaceVariant: '#CBD5E1', // Slate 300 - Secondary Text
    onError: '#450a0a',
    onErrorContainer: '#FECACA', // Red 200

    // Borders & Outlines
    outline: '#475569', // Slate 600 - Subtle borders
    outlineVariant: '#334155', // Slate 700

    // Elevation surfaces for layering
    elevation: {
      level0: 'transparent',
      level1: '#1A2332',
      level2: '#1E293B',
      level3: '#243041',
      level4: '#283548',
      level5: '#2D3A4F',
    },

    // Semantic accent colors
    accent: '#FBBF24', // Amber 400 - Gold Accent
    success: '#34D399', // Emerald 400 - Desaturated for dark mode
    warning: '#FBBF24', // Amber 400
    info: '#60A5FA', // Blue 400

    // Interactive states
    ripple: 'rgba(96, 165, 250, 0.12)', // Primary with 12% opacity
    overlay: 'rgba(0, 0, 0, 0.5)', // Modal overlay
    backdrop: 'rgba(15, 23, 42, 0.8)', // Semi-transparent background
  },
  roundness: 16, // Modern rounded corners
  animation: {
    scale: 1.0,
    // Standard easing curves
    easing: {
      standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
      accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
    },
    // Standard durations
    duration: {
      shortest: 150,
      short: 200,
      standard: 300,
      long: 500,
    },
  },
  // Typography scale factors
  typography: {
    fontWeightLight: '300',
    fontWeightRegular: '400',
    fontWeightMedium: '500',
    fontWeightSemiBold: '600',
    fontWeightBold: '700',
  },
  // Spacing scale (in dp)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
};

export type AppTheme = typeof theme;
