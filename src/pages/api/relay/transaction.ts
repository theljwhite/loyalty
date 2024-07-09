import { type NextApiRequest, type NextApiResponse } from "next";
import { queryRelayTransactionId } from "~/utils/transactionRelayUtils";

//experimental, needs access control

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body;
  const chainId = Number(body.chainId);
  const transactionId = body.transactionId;

  try {
    const transaction = await queryRelayTransactionId(chainId, transactionId);

    if (!transaction) {
      return res.status(500).json({ error: "Failed to fetch transactions" });
    }

    return res.status(200).json({ data: transaction });
  } catch (error) {
    return res.status(500).json({ error: "Network error" });
  }
}
