import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";

//TODO 4/8 for experimentation right now
//this flow is interupted by,
//not being able to use Prisma on Vercel Edge middleware.
//Going to make util funcs for validation for now in invidiual api routes,
//and wait a week or two before updating my Prisma package (which will allow Vercel middleware)

const redis = new Redis({
  url: process.env.UPSTASH_URL ?? "",
  token: process.env.UPSTASH_REST_TOKEN ?? "",
});

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const reqOrigin = req.headers.get("origin") ?? "";
  const cachedAllowedOrigin = "origin_here_from_cache"; //TODO - get from cache?

  if (!cachedAllowedOrigin) {
    const allowedOrigins = [""]; //TODO - from database whitelisted domains?
    if (allowedOrigins.includes(reqOrigin)) {
      res.headers.append("Access-Control-Allow-Origin", reqOrigin);
    }
  }

  if (cachedAllowedOrigin) {
    res.headers.append("Access-Control-Allow-Origin", reqOrigin);
  }

  res.headers.append("Access-Control-Allow-Credentials", "true");
  res.headers.append(
    "Access-Control-Allowed-Methods",
    process.env.RELAY_ACCESS_CONTROL_ALLOW_METHODS ?? "POST",
  );
  res.headers.append(
    "Access-Control-Allow-Headers",
    process.env.RELAY_ACCESS_CONTROL_ALLOW_HEADERS ?? "",
  );

  const { pathname } = req.nextUrl;
  const isCipherTextRequired = pathname.startsWith("/api/relay");
  const isApiCredentialsRequired = pathname.startsWith("/api/creator");

  const entitySecretHeader = req.headers.get("x-loyalty-entity-secret");
  const apiKeyHeader = req.headers.get("x-loyalty-api-key");
  const versionHeader = req.headers.get("x-loyalty-version");
  const backendAdapterHeader = req.headers.get("x-loyalty-be-adapter");
  const loyaltyContractAddress = req.headers.get("x-loyalty-address");

  // if (
  //   !apiKeyHeader ||
  //   !entitySecretHeader ||
  //   !versionHeader ||
  //   !backendAdapterHeader ||
  //   !loyaltyContractAddress
  // ) {
  //   return NextResponse.json(
  //     { error: "Missing required headers" },
  //     { status: 400 },
  //   );
  // }

  try {
    //TODO - add entity secret ciphertext handling here?
    //once I can use updated Prisma package on edge (or other solution for now).
  } catch (error) {
    console.error("error is -->", error);
    return NextResponse.json(
      { error: "Could not validate credentials" },
      { status: 401 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/relay/:path*"],
};
