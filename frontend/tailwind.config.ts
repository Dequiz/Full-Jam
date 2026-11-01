import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      colors: {
        "accent-color": "#395CEB",
        "active-status-bg": "#E8F5E9",
        "active-status-text": "#005A05",
        "pending-status-bg": "#FFF4E5",
        "pending-status-text": "#6B4F00",
        "destructive-color": "#A00000",
        "secondary-text": "#464D59",
        "input-stroke": "#C9D1E5",
        "nav-text": "#FFFFFF",
        "active-option-nav": "#A0B3FF",
        "active-option-text": "#292929",
        "secondary-background": "#EDEDED",
      },
    },
  },
} satisfies Config;
