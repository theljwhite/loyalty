import { type NextApiRequest, type NextApiResponse } from "next";
import { apiBasicHeadersSchema } from "~/utils/apiValidation";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const input = apiBasicHeadersSchema.safeParse(req);

  if (!input.success) {
    const errorMessages = input.error.issues.map((issue) => issue.message);
    return res.status(400).json({ error: errorMessages });
  }

  return res.status(200).json({ message: "Would get you a cup of coffee" });
}
