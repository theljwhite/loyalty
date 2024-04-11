//DASHBOARD RELATED ROUTES:

export const ROUTE_DASHBORD_ANALYTICS = "/dashboard/analytics";
export const ROUTE_DASHBOARD_BALANCES = "/dashboard/balances";

export const ROUTE_DASHBOARD_OBJECTIVES = "/dashboard/objectives";
export const ROUTE_DASHBOARD_TIERS = "/dashboard/tiers";

export const DASHBOARD_BASE = `/dashboard/programs`;

export const ROUTE_DASHBOARD_HOME = (loyaltyAddress: string) =>
  `/dashboard/programs/${loyaltyAddress}`;

export const ROUTE_DASHBOARD_OVERVIEW = (loyaltyAddress: string) =>
  DASHBOARD_BASE + `/${loyaltyAddress}/overview`;

export const ROUTE_DASHBOARD_ESCROW_OVERVIEW = (loyaltyAddress: string) =>
  DASHBOARD_BASE + `/${loyaltyAddress}/escrow-overview`;

export const ROUTE_DASHBOARD_ESCROW_SETTINGS = (loyaltyAddress: string) =>
  DASHBOARD_BASE + `/${loyaltyAddress}/escrow-settings`;

export const ROUTE_DASHBOARD_ESCROW_WALLET = (loyaltyAddress: string) =>
  DASHBOARD_BASE + `/${loyaltyAddress}/escrow-wallet`;

export const ROUTE_DASHBOARD_API_KEY = (loyaltyAddress: string) =>
  DASHBOARD_BASE + `/${loyaltyAddress}/api-keys`;

export const ROUTE_DASHBOARD_PATHS = (loyaltyAddress: string) =>
  DASHBOARD_BASE + `/${loyaltyAddress}/paths`;

export const ROUTE_DASHBOARD_DEV_CONSOLE = (loyaltyAddress: string) =>
  DASHBOARD_BASE + `/${loyaltyAddress}/dev-console`;

export const ROUTE_DASHBOARD_USER_SETTINGS = (loyaltyAddress: string) =>
  DASHBOARD_BASE + `/${loyaltyAddress}/user-settings`;

export const ROUTE_DASHBOARD_USER_POINTS = "/dashboard/users/points";
export const ROUTE_DASHBOARD_USER_REWARDS = "/dashboard/users/rewards";
export const ROUTE_DASHBOARD_USER_COMPLETION = "/dashboard/users/completion";

//DOCS
export const ROUTE_DOCS_MAIN = "/docs";
export const ROUTE_DOCS_QUICKSTART = "/docs/quickstart";
export const ROUTE_DOCS_QUICK_POINTS = "/docs/quickstart/Points";
export const ROUTE_DOCS_QUICK_ERC20 = "/docs/quickstart/ERC20";
export const ROUTE_DOCS_QUICK_ERC721 = "/docs/quickstart/ERC721";
export const ROUTE_DOCS_QUICK_ERC1155 = "/docs/quickstart/ERC1155";

//...etc
