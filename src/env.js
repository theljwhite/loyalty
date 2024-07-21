import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z
      .string()
      .url()
      .refine(
        (str) => !str.includes("YOUR_MYSQL_URL_HERE"),
        "You forgot to change the default URL",
      ),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      (str) => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include `https` so it cant be validated as a URL
      process.env.VERCEL ? z.string() : z.string().url(),
    ),
    DISCORD_CLIENT_ID: z.string(),
    DISCORD_CLIENT_SECRET: z.string(),
    MORALIS_API_KEY: z.string(),
    MORALIS_STREAM_SECRET: z.string(),

    OPEN_ZEPP_SEPOLIA_RELAY_ADDRESS: z.string(),
    OPEN_ZEPP_SEPOLIA_API_KEY: z.string(),
    OPEN_ZEPP_SEPOLIA_SECRET_KEY: z.string(),
    OPEN_ZEPP_AMOY_RELAY_ADDRESS: z.string(),
    OPEN_ZEPP_AMOY_API_KEY: z.string(),
    OPEN_ZEPP_AMOY_SECRET_KEY: z.string(),

    CIRCLE_API_KEY: z.string(),
    CIRCLE_ENTITY_SECRET: z.string(),
    CREATOR_JWT_SECRET: z.string(),
    INTERNAL_API_URL: z.string(),
    UPSTASH_URL: z.string(),
    UPSTASH_TOKEN: z.string(),
    UPSTASH_REST_TOKEN: z.string(),
    LOADED_BAKED_POTATO: z.string(),
    LOADED_SWEET_POTATO: z.string(),
    LOADED_MASHED_POTATO: z.string(),

    RELAY_ACCESS_CONTROL_ALLOW_METHODS: z.string(),
    RELAY_ACCESS_CONTROL_ALLOW_HEADERS: z.string(),
    LATEST_CONTRACT_VERSION: z.string(),
  },
  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_ALCHEMY_PROV: z.string(),
    NEXT_PUBLIC_ALCHEMY_AMOY: z.string(),
    NEXT_PUBLIC_ALCHEMY_SEPOLIA: z.string(),
    NEXT_PUBLIC_INFURA_AMOY: z.string(),
    NEXT_PUBLIC_INFURA_SEPOLIA: z.string(),
    NEXT_PUBLIC_WALLET_CONNECT_ID: z.string(),
    NEXT_PUBLIC_MORALIS_API_KEY: z.string(),
    NEXT_PUBLIC_MORALIS_STREAM_ID_ONE: z.string(),
    NEXT_PUBLIC_MORALIS_REWARDS_ID_ONE: z.string(),
    NEXT_PUBLIC_PROJECT_NAME: z.string(),
    NEXT_PUBLIC_DOMAIN_URL: z.string(),
    NEXT_PUBLIC_LATEST_CONTRACT_VERSION: z.string(),
    NEXT_PUBLIC_INTERNAL_API_URL: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,

    NEXT_PUBLIC_ALCHEMY_PROV: process.env.NEXT_PUBLIC_ALCHEMY_PROV,
    NEXT_PUBLIC_ALCHEMY_AMOY: process.env.NEXT_PUBLIC_ALCHEMY_AMOY,
    NEXT_PUBLIC_ALCHEMY_SEPOLIA: process.env.NEXT_PUBLIC_ALCHEMY_SEPOLIA,
    NEXT_PUBLIC_INFURA_AMOY: process.env.NEXT_PUBLIC_INFURA_AMOY,
    NEXT_PUBLIC_INFURA_SEPOLIA: process.env.NEXT_PUBLIC_INFURA_SEPOLIA,

    NEXT_PUBLIC_WALLET_CONNECT_ID: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID,
    MORALIS_API_KEY: process.env.MORALIS_API_KEY,
    MORALIS_STREAM_SECRET: process.env.MORALIS_STREAM_SECRET,

    OPEN_ZEPP_SEPOLIA_RELAY_ADDRESS:
      process.env.OPEN_ZEPP_SEPOLIA_RELAY_ADDRESS,
    OPEN_ZEPP_SEPOLIA_API_KEY: process.env.OPEN_ZEPP_SEPOLIA_API_KEY,
    OPEN_ZEPP_SEPOLIA_SECRET_KEY: process.env.OPEN_ZEPP_SEPOLIA_SECRET_KEY,
    OPEN_ZEPP_AMOY_RELAY_ADDRESS: process.env.OPEN_ZEPP_AMOY_RELAY_ADDRESS,
    OPEN_ZEPP_AMOY_API_KEY: process.env.OPEN_ZEPP_AMOY_API_KEY,
    OPEN_ZEPP_AMOY_SECRET_KEY: process.env.OPEN_ZEPP_AMOY_SECRET_KEY,

    CIRCLE_API_KEY: process.env.CIRCLE_API_KEY,
    CIRCLE_ENTITY_SECRET: process.env.CIRCLE_ENTITY_SECRET,
    CREATOR_JWT_SECRET: process.env.CREATOR_JWT_SECRET,
    INTERNAL_API_URL: process.env.INTERNAL_API_URL,
    UPSTASH_URL: process.env.UPSTASH_URL,
    UPSTASH_TOKEN: process.env.UPSTASH_TOKEN,
    UPSTASH_REST_TOKEN: process.env.UPSTASH_REST_TOKEN,
    LOADED_BAKED_POTATO: process.env.LOADED_BAKED_POTATO,
    LOADED_SWEET_POTATO: process.env.LOADED_SWEET_POTATO,
    LOADED_MASHED_POTATO: process.env.LOADED_MASHED_POTATO,

    RELAY_ACCESS_CONTROL_ALLOW_METHODS:
      process.env.RELAY_ACCESS_CONTROL_ALLOW_METHODS,
    RELAY_ACCESS_CONTROL_ALLOW_HEADERS:
      process.env.RELAY_ACCESS_CONTROL_ALLOW_HEADERS,
    LATEST_CONTRACT_VERSION: process.env.LATEST_CONTRACT_VERSION,

    NEXT_PUBLIC_MORALIS_API_KEY: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
    NEXT_PUBLIC_MORALIS_STREAM_ID_ONE:
      process.env.NEXT_PUBLIC_MORALIS_STREAM_ID_ONE,
    NEXT_PUBLIC_MORALIS_REWARDS_ID_ONE:
      process.env.NEXT_PUBLIC_MORALIS_REWARDS_ID_ONE,
    NEXT_PUBLIC_PROJECT_NAME: process.env.NEXT_PUBLIC_PROJECT_NAME,
    NEXT_PUBLIC_DOMAIN_URL: process.env.NEXT_PUBLIC_DOMAIN_URL,
    NEXT_PUBLIC_LATEST_CONTRACT_VERSION:
      process.env.NEXT_PUBLIC_LATEST_CONTRACT_VERSION,
    NEXT_PUBLIC_INTERNAL_API_URL: process.env.NEXT_PUBLIC_INTERNAL_API_URL,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
