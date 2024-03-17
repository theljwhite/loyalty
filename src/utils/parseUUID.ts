import { z } from "zod";

export const parseUUID = (value: string): boolean => {
  try {
    z.string().uuid().parse(value);
    return true;
  } catch (error) {
    return false;
  }
};
