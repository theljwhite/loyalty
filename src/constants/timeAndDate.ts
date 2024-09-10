export const ONE_WEEK: number = 7 * 24 * 60 * 60 * 1000;
export const ONE_HOUR: number = 1 * 60 * 60 * 1000;
export const TWO_HOURS: number = 2 * 60 * 60 * 1000;
export const TEN_MIN_MS: number = 600_000;

export enum TimeOptionToSubtrahend {
  "All time" = 0,
  "Last day" = 1,
  "Last 7 days" = 7,
  "Last month" = 1,
  "Last 3 months" = 3,
  "Last 6 months" = 6,
  "Last year" = 1,
}

export const getStartDateFromDropOption = (timeOption: string): Date | null => {
  var date = new Date();

  const subtrahend =
    TimeOptionToSubtrahend[timeOption as keyof typeof TimeOptionToSubtrahend];

  if (!subtrahend) return null;

  if (timeOption.includes("day")) {
    date.setDate(date.getDate() - subtrahend);
  }

  if (timeOption.includes("month")) {
    date.setMonth(date.getMonth() - subtrahend);
  }

  if (timeOption.includes("year")) {
    date.setFullYear(date.getFullYear() - subtrahend);
  }

  return date;
};

export const getElapsedTime = (startDate: Date, endDate: Date): string => {
  let timeDiff = endDate.getTime() - startDate.getTime();

  timeDiff = timeDiff / 1000;

  timeDiff = Math.floor(timeDiff / 60);

  let minutes = timeDiff % 60;
  let minutesAsString = minutes < 10 ? "0" + minutes : minutes;
  timeDiff = Math.floor(timeDiff / 60);
  let hours = timeDiff % 24;

  timeDiff = Math.floor(timeDiff / 24);
  let days = timeDiff;
  let totalHours = hours + days * 24;
  let totalHoursAsString = totalHours < 10 ? "0" + totalHours : totalHours;

  if (totalHoursAsString === "00") {
    return `${minutesAsString} min ago`;
  } else {
    if (days === 0) return `${hours} hrs ago`;
    if (hours === 0) return `${days} days ago`;
    return `${days} days ${hours} hr ago `;
  }
};
