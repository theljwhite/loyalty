import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        lunch: ["Lunchtype22-Regular, sans-serif"],
      },
      colors: {
        transparent: "transparent",
        inherit: "inherit",
        current: "currentColor",
        "real-white": "#ffffff",
        "real-black": "#000000",
        primary: {
          1: "#5639CC",
          2: "#704cfc",
        },
        secondary: {
          1: "#604cfc",
        },
        neutral: {
          1: "#f3f4f6",
          2: "#F5F5F5",
          3: "#B2B2B2",
          4: "#EBEBEB",
          5: "#212121",
          6: "#161618",
          7: "#1E1E1E",
          8: "#232326",
          9: "#28282c",
          10: "#2e2e32",
          11: "#34343a",
          12: "#3d3d3d",
          13: "#5E7076",
          14: "#9D9D9D",
          15: "#6A6A6A",
          16: "#E5E5E5",
          17: "#CDCDCD",
          18: "#8E8E8E",
          19: "#A1A1A1",
          20: "#292929",
        },
        success: {
          1: "#10b981",
        },
        error: {
          1: "#be123c",
        },
        dashboard: {
          primary: "#eeeef0",
          secondary: "#b7b8c2",
          body: "#292929",
          body2: "#212126",
          activeTab: "#2f3037",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
