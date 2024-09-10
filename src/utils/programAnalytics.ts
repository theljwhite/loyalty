import { z } from "zod";
import { getStartDateFromDropOption } from "~/constants/timeAndDate";

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

type ProgEventObjCount = {
  objectiveIndex: number;
  count: number;
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
  let { loyaltyAddress, startDate, endDate } = input;

  if (!startDate) {
    startDate = getStartDateFromDropOption("Last 3 months");
  }

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
  const formattedEvents = events.map((e: { date: string; count: number }) => ({
    date: new Date(`${e.date}\n`).toLocaleDateString("en-US", dateOptions),
    count: Number(e.count),
  }));

  return formattedEvents;
};

export const countObjCompletionsInDateRange = async (
  ctx: any,
  input: LoyaltyAnalyticsEventDateRangeInput,
): Promise<XTitleYData[]> => {
  let { loyaltyAddress, startDate, endDate } = input;

  if (!startDate) {
    startDate = getStartDateFromDropOption("Last 3 months");
  }

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
