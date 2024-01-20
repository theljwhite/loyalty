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
        warn: {
          1: "#FBD486",
          2: "#FFFAEB",
          3: "#FEC84B",
        },
        dashboard: {
          primary: "#eeeef0",
          secondary: "#b7b8c2",
          body: "#292929",
          body2: "#212126",
          activeTab: "#2f3037",
          border1: "#D6D6D6",
          lightGray: "#737373",
          lightGray2: "#9394a1",
          lighterText: "#5e5f6e",
          neutral: "#525252",
          menu: "#f8f9fd",
          menuText: "#1A202C",
          menuInner: "#dfe0ea",
          heading: "#495072",
          divider: "#e2e8f0",
          input: "#EDF2F7",
          tooltip: "#718096",
          table1: "#4A5568",
          codeBg: "#E4E9F2",
          codeBorder: "#D8DDE8",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
