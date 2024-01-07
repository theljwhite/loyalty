import React from "react";
import { useRouter } from "next/router";
import LandingNav from "./LandingNav";

export default function Nav() {
  const router = useRouter();

  if (router.pathname === "/") {
    return <LandingNav />;
  }
}
