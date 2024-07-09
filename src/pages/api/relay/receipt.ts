import { type NextApiRequest, type NextApiResponse } from "next";
import { getRelayTransactionReceipt } from "~/utils/transactionRelayUtils";

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
  const transactionHash = body.transactionHash;

  try {
    const txReceipt = await getRelayTransactionReceipt(
      chainId,
      transactionHash,
    );

    if (!txReceipt) {
      return res.status(500).json({ error: "Failed to fetch receipt" });
    }

    return res.status(200).json({ data: txReceipt });
  } catch (error) {
    return res.status(500).json({ error: "Network error" });
  }
}
