import { z } from "zod";
import {
  formatYYYYMMToMonthName,
  getStartDateFromDropOption,
} from "~/constants/timeAndDate";
import { type Ctx } from "~/server/api/trpc";

//I put these in a separate file so that these can better be reused if need be, not only from trpc routers.
//TODO - fix ctx type where it is being passed from trpc protected procedures in routers (events.ts router)

type LoyaltyAnalyticsEventDateRangeInput = {
  loyaltyAddress: string;
  startDate: Date | null;
  endDate: Date;
};

export type DateWithCount = {
  date: string;
  count: number;
};

export type XTitleYData = { x: string; y: number };

export interface HorizontalBarReturnShape<T> {
  raw: T;
  series: HorizontalBarSeries[];
  xCategories: string[];
}

export interface HorizontalBarSeries {
  name: string;
  data: number[];
  color?: string;
}

type ProgEventObjCount = {
  objectiveIndex: number;
  count: number;
};

type ERC20RewardsByMonth = {
  month: `${number}-${number}`;
  total_rewarded: string | null;
  total_withdrawn: string | null;
};

type ERC721RewardsByMonth = {
  month: `${number}-${number}`;
  total_rewarded: number;
  total_withdrawn: number;
};

export const loyaltyAnalyticsEventDateRangeInputSchema = z.object({
  loyaltyAddress: z.string(),
  startDate: z.date(),
  endDate: z.date(),
});

export const countProgEventsInDateRange = async (
  ctx: any,
  input: LoyaltyAnalyticsEventDateRangeInput,
): Promise<DateWithCount[]> => {
  const { loyaltyAddress, startDate: start, endDate } = input;
  const startDate = start ?? getStartDateFromDropOption("Last 3 months");

  const events = await ctx.db.$queryRaw<DateWithCount[]>`
      SELECT
        to_char("timestamp", 'YYYY-MM-DD') AS date,
        COUNT(*) AS count
      FROM
        "ProgressionEvent"
      WHERE
        "loyaltyAddress" = ${loyaltyAddress}
        AND "timestamp" BETWEEN ${startDate} AND ${endDate}
      GROUP BY
        date
      ORDER BY
        date
    `;

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
  };
  const formattedEvents = events.map((e: DateWithCount) => ({
    date: new Date(`${e.date}\n`).toLocaleDateString("en-US", dateOptions),
    count: Number(e.count),
  }));

  return formattedEvents;
};

export const countObjCompletionsInDateRange = async (
  ctx: Ctx,
  input: LoyaltyAnalyticsEventDateRangeInput,
): Promise<XTitleYData[]> => {
  const { loyaltyAddress, startDate: start, endDate } = input;
  const startDate = start ?? getStartDateFromDropOption("Last 3 months");

  const objEvents = await ctx.db.$queryRaw<ProgEventObjCount[]>`
    SELECT 
      "objectiveIndex",
      COUNT(*) AS count 
    FROM
      "ProgressionEvent"
    WHERE 
      "loyaltyAddress" = ${loyaltyAddress}
      AND "timestamp" BETWEEN ${startDate} AND ${endDate}
      AND "objectiveIndex" IS NOT NULL
    GROUP BY 
      "objectiveIndex"
    ORDER BY
      count DESC
    `;

  const formattedObjEvents = objEvents.map((item: ProgEventObjCount) => ({
    x: `Obj ${item.objectiveIndex}`,
    y: Number(item.count),
  }));

  return formattedObjEvents;
};

export const sumERC20EventsInDateRange = async (
  ctx: Ctx,
  input: LoyaltyAnalyticsEventDateRangeInput,
): Promise<ERC20RewardsByMonth[]> => {
  const { loyaltyAddress, startDate: start, endDate } = input;
  const startDate = start ?? getStartDateFromDropOption("Last 3 months");

  const result = await ctx.db.$queryRaw<ERC20RewardsByMonth[]>`
  SELECT
    to_char(date_trunc('month', r."timestamp"), 'YYYY-MM') AS month,
    SUM(CASE WHEN r."eventName" = 'ERC20Rewarded' THEN r."erc20Amount" ELSE 0 END) AS total_rewarded,
    SUM(CASE WHEN w."eventName" = 'ERC20UserWithdraw' THEN w."erc20Amount" ELSE 0 END) AS total_withdrawn
  FROM
    (SELECT "erc20Amount", "timestamp", "eventName", "loyaltyAddress" FROM "RewardEvent"
     WHERE "loyaltyAddress" = ${loyaltyAddress} 
     AND "eventName" = 'ERC20Rewarded'
     AND "timestamp" BETWEEN ${startDate} AND ${endDate}) r
  FULL OUTER JOIN
    (SELECT "erc20Amount", "timestamp", "eventName", "loyaltyAddress" FROM "WalletEscrowEvent"
     WHERE "loyaltyAddress" = ${loyaltyAddress} 
     AND "eventName" = 'ERC20UserWithdraw'
     AND "timestamp" BETWEEN ${startDate} AND ${endDate}) w
  ON date_trunc('month', r."timestamp") = date_trunc('month', w."timestamp")
  WHERE r."loyaltyAddress" = ${loyaltyAddress} OR w."loyaltyAddress" = ${loyaltyAddress}
  GROUP BY month
  ORDER BY month;
`;
  return result;
};

export const countUniqueUserERC20EventsInDateRange = async (
  ctx: Ctx,
  input: LoyaltyAnalyticsEventDateRangeInput,
): Promise<DateWithCount[]> => {
  const { loyaltyAddress, startDate: start, endDate } = input;

  const startDate = start ?? getStartDateFromDropOption("Last 3 months");

  const result = await ctx.db.$queryRaw<DateWithCount[]>`
  SELECT
    to_char("timestamp", 'YYYY-MM-DD') AS date,
    COUNT(DISTINCT "userAddress") AS count
  FROM "RewardEvent"
  WHERE "loyaltyAddress" = ${loyaltyAddress}
    AND "eventName" = 'ERC20Rewarded'
    AND "timestamp" BETWEEN ${startDate} AND ${endDate}
  GROUP BY
    date
  ORDER BY
    date
  `;

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
  };
  const formattedEvents = result.map((e: DateWithCount) => ({
    date: new Date(`${e.date}\n`).toLocaleDateString("en-US", dateOptions),
    count: Number(e.count),
  }));

  return formattedEvents;
};

export const countERC721EventsInDateRange = async (
  ctx: Ctx,
  input: LoyaltyAnalyticsEventDateRangeInput,
): Promise<ERC721RewardsByMonth[]> => {
  const { loyaltyAddress, startDate: start, endDate } = input;
  const startDate = start ?? getStartDateFromDropOption("Last 3 months");

  const result = await ctx.db.$queryRaw<ERC721RewardsByMonth[]>`
  SELECT
    to_char(date_trunc('month', r."timestamp"), 'YYYY-MM') AS month,
    COUNT(CASE WHEN r."eventName" = 'ERC721Rewarded' THEN 1 ELSE NULL END) AS total_rewarded_tokens,
    COUNT(CASE WHEN w."eventName" = 'ERC721UserWithdraw' THEN 1 ELSE NULL END) AS total_withdrawn_tokens
  FROM
    (SELECT "tokenId", "timestamp", "eventName", "loyaltyAddress" FROM "RewardEvent"
     WHERE "loyaltyAddress" = ${loyaltyAddress} 
     AND "eventName" = 'ERC721Rewarded'
     AND "timestamp" BETWEEN ${startDate} AND ${endDate}) r
  FULL OUTER JOIN
    (SELECT "tokenId", "timestamp", "eventName", "loyaltyAddress" FROM "WalletEscrowEvent"
     WHERE "loyaltyAddress" = ${loyaltyAddress} 
     AND "eventName" = 'ERC721UserWithdraw'
     AND "timestamp" BETWEEN ${startDate} AND ${endDate}) w
  ON date_trunc('month', r."timestamp") = date_trunc('month', w."timestamp")
  WHERE r."loyaltyAddress" = ${loyaltyAddress} OR w."loyaltyAddress" = ${loyaltyAddress}
  GROUP BY month
  ORDER BY month;
  `;

  return result;
};

export const countDistinctERC1155Rewarded = async (
  ctx: Ctx,
  input: { loyaltyAddress: string },
): Promise<{ tokenId: string; count: number }[]> => {
  const result = await ctx.db.$queryRaw<{ tokenId: string; count: number }[]>`
  SELECT 
    "tokenId",
    COUNT(*) AS count
    FROM "RewardEvent"
    WHERE "loyaltyAddress" = ${input.loyaltyAddress}
      AND "eventName" = 'ERC1155Rewarded'
    GROUP BY "tokenId"
    ORDER BY "tokenId" 
  `;

  return result;
};

export const getERC1155EventsForTokenChart = async (
  ctx: Ctx,
  input: LoyaltyAnalyticsEventDateRangeInput,
): Promise<XTitleYData[]> => {
  const result = await countDistinctERC1155Rewarded(ctx, input);
  const series = result.map((item) => ({
    x: `Token Id #${item.tokenId}`,
    y: Number(item.count),
  }));
  return series;
};

export const getERC721EventsForChart = async (
  ctx: Ctx,
  input: LoyaltyAnalyticsEventDateRangeInput,
): Promise<HorizontalBarReturnShape<ERC721RewardsByMonth[]>> => {
  const result = await countERC721EventsInDateRange(ctx, input);

  const xCategories = result.map((item: ERC721RewardsByMonth) =>
    formatYYYYMMToMonthName(item.month),
  );
  const totalRewardedInRange = result.map((item: ERC721RewardsByMonth) =>
    Number(item.total_rewarded),
  );
  const totalWithdrawnInRange = result.map((item: ERC721RewardsByMonth) =>
    Number(item.total_withdrawn),
  );

  const series: HorizontalBarSeries[] = [
    {
      name: "In Escrow",
      data: totalRewardedInRange,
      color: "#FDBA8C",
    },
    {
      name: "Withdrawn",
      data: totalWithdrawnInRange,
      color: "#16BDCA",
    },
  ];
  return {
    raw: result,
    xCategories,
    series,
  };
};

export const getERC20EventsForChart = async (
  ctx: Ctx,
  input: LoyaltyAnalyticsEventDateRangeInput,
): Promise<HorizontalBarReturnShape<ERC20RewardsByMonth[]>> => {
  const result = await sumERC20EventsInDateRange(ctx, input);

  const xCategories: string[] = result.map((item: ERC20RewardsByMonth) =>
    formatYYYYMMToMonthName(item.month),
  );
  const totalRewardedInRange: number[] = result.map(
    (item: ERC20RewardsByMonth) => parseFloat(item.total_rewarded ?? ""),
  );
  const totalWithdrawnInRange: number[] = result.map(
    (item: ERC20RewardsByMonth) => parseFloat(item.total_withdrawn ?? ""),
  );

  const series: HorizontalBarSeries[] = [
    {
      name: "In Escrow",
      data: totalRewardedInRange,
      color: "#FDBA8C",
    },
    {
      name: "Withdrawn",
      data: totalWithdrawnInRange,
      color: "#16BDCA",
    },
  ];

  return {
    raw: result,
    xCategories,
    series,
  };
};
