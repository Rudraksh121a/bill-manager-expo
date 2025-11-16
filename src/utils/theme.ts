// Modern Professional Color Palette
export const COLORS = {
    // Primary Colors (Modern Blue)
    primary: '#246BFD',        // Modern Blue
    primaryLight: '#5B8AFF',   // Light Blue  
    primaryDark: '#1A4FCC',    // Dark Blue
    primaryBg: '#F0F5FF',      // Primary Background

    // Secondary Colors
    secondary: '#4BCB89',      // Modern Green
    secondaryLight: '#7DD8A8', // Light Green
    secondaryDark: '#359268',  // Dark Green
    secondaryBg: '#F0FDF5',    // Secondary Background

    // Accent Colors
    accent: '#F47B9A',         // Modern Pink
    accentLight: '#F7A6C1',    // Light Pink
    accentDark: '#E5527A',     // Dark Pink
    accentBg: '#FEF7F7',       // Accent Background

    // Warning & Error
    warning: '#FFB800',        // Modern Orange
    warningBg: '#FFF7E6',      // Warning Background
    danger: '#FF5A5F',         // Modern Red
    dangerBg: '#FFF5F5',       // Danger Background

    // Neutral Colors
    dark: '#0F172A',           // Rich Black
    darkGray: '#334155',       // Dark Gray
    gray: '#64748B',           // Medium Gray
    lightGray: '#94A3B8',      // Light Gray
    veryLightGray: '#E2E8F0',  // Very Light Gray
    
    // Borders & Dividers
    border: '#E2E8F0',         // Modern Border
    borderLight: '#F1F5F9',    // Light Border
    divider: '#CBD5E1',        // Divider

    // Backgrounds
    bg: '#F8FAFC',             // Main Background
    bgLight: '#F1F5F9',        // Light Background
    cardBg: '#FFFFFF',         // Card Background
    white: '#ffffff',          // Pure White

    // Text Colors
    textPrimary: '#0F172A',    // Primary Text
    textSecondary: '#475569',  // Secondary Text
    textTertiary: '#94A3B8',   // Tertiary Text
    textMuted: '#CBD5E1',      // Muted Text
    
    // Interactive
    link: '#246BFD',           // Links
    linkHover: '#1A4FCC',      // Link Hover
};

// Modern Typography System
export const TYPOGRAPHY = {
    // Display Headers
    display: {
        fontSize: 36,
        fontWeight: '800' as const,
        letterSpacing: -0.5,
        lineHeight: 44,
    },
    h1: {
        fontSize: 28,
        fontWeight: '700' as const,
        letterSpacing: -0.3,
        lineHeight: 34,
    },
    h2: {
        fontSize: 24,
        fontWeight: '700' as const,
        letterSpacing: -0.2,
        lineHeight: 30,
    },
    h3: {
        fontSize: 20,
        fontWeight: '600' as const,
        letterSpacing: -0.1,
        lineHeight: 26,
    },
    h4: {
        fontSize: 18,
        fontWeight: '600' as const,
        lineHeight: 24,
    },
    
    // Body Text
    bodyLarge: {
        fontSize: 18,
        fontWeight: '500' as const,
        lineHeight: 26,
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
    
    // Labels & UI Text
    labelLarge: {
        fontSize: 16,
        fontWeight: '600' as const,
        lineHeight: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600' as const,
        lineHeight: 18,
    },
    labelSmall: {
        fontSize: 12,
        fontWeight: '600' as const,
        lineHeight: 16,
    },
    
    // Captions & Small Text
    caption: {
        fontSize: 12,
        fontWeight: '500' as const,
        lineHeight: 16,
    },
    overline: {
        fontSize: 10,
        fontWeight: '600' as const,
        lineHeight: 14,
        letterSpacing: 1.5,
        textTransform: 'uppercase' as const,
    },
    
    // Numbers & Data
    number: {
        fontSize: 24,
        fontWeight: '700' as const,
        lineHeight: 28,
        fontVariant: ['tabular-nums'] as const,
    },
    numberSmall: {
        fontSize: 18,
        fontWeight: '600' as const,
        lineHeight: 22,
        fontVariant: ['tabular-nums'] as const,
    },
};

// Standard Mobile Spacing System
export const SPACING = {
    xs: 4,      // 4px
    sm: 8,      // 8px
    md: 12,     // 12px
    lg: 16,     // 16px
    xl: 20,     // 20px
    xxl: 24,    // 24px
    xxxl: 28,   // 28px (reduced from 32px)
    xxxxl: 32,  // 32px (reduced from 48px)
    
    // Component specific spacing (standard mobile sizes)
    cardPadding: 16,    // Standard card padding
    cardMargin: 12,     // Standard card margin
    sectionSpacing: 20, // Standard section spacing
    screenPadding: 16,  // Standard screen padding
};

// Modern Border Radius System
export const RADIUS = {
    xs: 4,      // Small elements
    sm: 8,      // Buttons, inputs
    md: 12,     // Cards
    lg: 16,     // Large cards
    xl: 20,     // Modals
    xxl: 24,    // Large modals
    full: 9999, // Pills, circular
    
    // Component specific
    button: 12,
    card: 16,
    input: 10,
    modal: 20,
};

// Modern Shadow System
export const SHADOWS = {
    // Card Shadows
    card: {
        shadowColor: '#0F172A',
        shadowOpacity: 0.03,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    cardHover: {
        shadowColor: '#0F172A',
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    
    // Button Shadows
    button: {
        shadowColor: '#246BFD',
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    
    // Modal & Overlay Shadows
    modal: {
        shadowColor: '#0F172A',
        shadowOpacity: 0.15,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
    },
    
    // Legacy Support
    sm: {
        shadowColor: '#0F172A',
        shadowOpacity: 0.03,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    md: {
        shadowColor: '#0F172A',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    lg: {
        shadowColor: '#0F172A',
        shadowOpacity: 0.10,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
    },
};

// Standard Component Style Presets
export const COMPONENT_STYLES = {
    // Standard Card Styles
    card: {
        backgroundColor: COLORS.cardBg,
        borderRadius: RADIUS.card,
        padding: SPACING.cardPadding,
        marginBottom: SPACING.cardMargin,
        ...SHADOWS.card,
    },
    
    // Button Styles
    button: {
        primary: {
            backgroundColor: COLORS.primary,
            borderRadius: RADIUS.button,
            paddingVertical: 12,    // Standard button height
            paddingHorizontal: 20,  // Standard button padding
            ...SHADOWS.button,
        },
        secondary: {
            backgroundColor: COLORS.primaryBg,
            borderRadius: RADIUS.button,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: COLORS.primary,
        },
    },
    
    // Input Styles
    input: {
        backgroundColor: COLORS.cardBg,
        borderRadius: RADIUS.input,
        paddingVertical: 12,    // Standard input padding
        paddingHorizontal: 14,  // Standard input padding
        borderWidth: 1,
        borderColor: COLORS.border,
        fontSize: 16,
        color: COLORS.textPrimary,
    },
    
    // Section Header
    sectionHeader: {
        ...TYPOGRAPHY.h3,
        color: COLORS.textPrimary,
        marginBottom: SPACING.lg,
    },
};

// Icon Sizes
export const ICON_SIZES = {
    xs: 14,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
    xxl: 32,
    
    // Component specific
    tabBar: 24,
    button: 20,
    card: 24,
    header: 28,
};
