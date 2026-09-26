import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#09090b",
        background: "#09090b",
        foreground: "#f4f4f5",
        surface: {
          DEFAULT: "#18181b",
          subtle: "#121215",
          elevated: "#202024",
          muted: "#141417",
        },
        "surface-1": "#121215",
        "surface-2": "#18181b",
        "surface-3": "#202024",
        "surface-4": "#27272a",
        border: {
          DEFAULT: "#27272a",
          subtle: "rgba(255, 255, 255, 0.06)",
          strong: "#3f3f46",
        },
        hairline: "rgba(255, 255, 255, 0.07)",
        "hairline-strong": "rgba(255, 255, 255, 0.14)",
        "hairline-tertiary": "rgba(255, 255, 255, 0.22)",
        primary: {
          DEFAULT: "#ffffff",
          hover: "#e4e4e7",
          focus: "#d4d4d8",
          subtle: "rgba(255, 255, 255, 0.10)",
        },
        "brand-secure": "#71717a",
        ink: {
          DEFAULT: "#f4f4f5",
          muted: "#d4d4d8",
          subtle: "#a1a1aa",
          tertiary: "#71717a",
        },
        priority: {
          urgent: "#ef4444",
          high: "#f97316",
          medium: "#eab308",
          low: "#71717a",
          none: "#52525b",
        },
        semantic: {
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
          info: "#a1a1aa",
        },
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        xxl: "20px",
      },
      fontFamily: {
        heading: [
          "var(--font-heading)",
          '"DM Sans"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "sans-serif",
        ],
        sans: [
          '"Geist"',
          "var(--font-sans)",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
        mono: [
          '"Geist Mono"',
          "var(--font-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      letterSpacing: {
        tighter: "-0.04em",
        tight: "-0.02em",
        normal: "0em",
        wide: "0.02em",
        wider: "0.04em",
      },
      boxShadow: {
        modal: "0 24px 48px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px #23252a",
        popover: "0 12px 32px -8px rgba(0, 0, 0, 0.6), 0 0 0 1px #23252a",
        toast: "0 8px 24px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px #23252a",
      },
    },
  },
  plugins: [],
};

export default config;
