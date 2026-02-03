export const theme = {
  dark: true,
  colors: {
    primary: '#38BDF8', // Sky Blue - Vibrant but professional
    primaryContainer: '#0c4a6e', // Deep Blue container
    secondary: '#94A3B8', // Slate 400 - Elegant secondary text
    secondaryContainer: '#1e293b', // Slate 800
    background: '#0F172A', // Slate 900 - Deep Rich Background
    surface: '#1E293B', // Slate 800 - Card Surface
    surfaceVariant: '#334155', // Slate 700 - Slightly Lighter Surface
    error: '#EF4444', // Red 500
    errorContainer: '#7f1d1d', // Red 900
    onPrimary: '#0F172A', // Dark text on primary button
    onPrimaryContainer: '#e0f2fe',
    onSecondary: '#0F172A',
    onSecondaryContainer: '#e2e8f0',
    onSurface: '#F1F5F9', // Slate 100 - Primary Text
    onBackground: '#F1F5F9', // Slate 100 - Text on background
    onSurfaceVariant: '#CBD5E1', // Slate 300 - Secondary Text
    onError: '#ffffff',
    onErrorContainer: '#fecaca',
    outline: '#475569', // Slate 600 - Subtle borders
    outlineVariant: '#334155',
    elevation: {
      level0: 'transparent',
      level1: '#1E293B',
      level2: '#1E293B',
      level3: '#1E293B',
      level4: '#1E293B',
      level5: '#1E293B',
    },
    // Custom premium accents
    accent: '#FBBF24', // Amber 400 - Gold Accent
    success: '#10B981', // Emerald 500
  },
  roundness: 16, // More rounded, modern corners
  animation: {
    scale: 1.0,
  },
};

export type AppTheme = typeof theme;

