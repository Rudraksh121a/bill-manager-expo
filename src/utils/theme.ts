// Professional Color Palette
export const COLORS = {
    // Primary Colors
    primary: '#0b7bff',        // Main Blue
    primaryLight: '#4f8cff',   // Light Blue
    primaryDark: '#0056b8',    // Dark Blue

    // Secondary Colors
    accent1: '#ff6b9d',        // Pink/Magenta
    accent2: '#00c6ae',        // Teal/Mint
    accent3: '#ffb300',        // Orange/Gold
    accent4: '#7c3aed',        // Purple

    // Neutral Colors
    dark: '#222222',           // Near Black
    darkGray: '#444444',       // Dark Gray
    gray: '#666666',           // Medium Gray
    lightGray: '#888888',      // Light Gray
    border: '#e0e7ef',         // Border Color
    borderLight: '#f0f4fa',    // Light Border Color
    divider: '#e3e8ee',        // Divider

    // Backgrounds
    bg: '#f8f9fa',             // Main Background
    bgLight: '#f0f4fa',        // Light Background
    white: '#ffffff',          // White

    // Status Colors
    success: '#10b981',        // Green
    danger: '#ef4444',         // Red
    warning: '#f59e0b',        // Amber
    info: '#3b82f6',           // Blue

    // Semantic
    text: '#222222',
    textSecondary: '#666666',
    textTertiary: '#888888',
    link: '#0b7bff',
};

// Typography Scale
export const TYPOGRAPHY = {
    h1: {
        fontSize: 32,
        fontWeight: '800' as const,
        letterSpacing: 0.5,
    },
    h2: {
        fontSize: 28,
        fontWeight: '800' as const,
        letterSpacing: 0.3,
    },
    h3: {
        fontSize: 24,
        fontWeight: '700' as const,
        letterSpacing: 0.2,
    },
    h4: {
        fontSize: 20,
        fontWeight: '700' as const,
    },
    body: {
        fontSize: 16,
        fontWeight: '500' as const,
        lineHeight: 24,
    },
    bodySmall: {
        fontSize: 14,
        fontWeight: '500' as const,
        lineHeight: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600' as const,
    },
    caption: {
        fontSize: 12,
        fontWeight: '500' as const,
        lineHeight: 18,
    },
};

// Spacing
export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

// Border Radius
export const RADIUS = {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
};

// Shadow (for elevation effects)
export const SHADOWS = {
    sm: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },
};
