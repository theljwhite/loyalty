import { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/server/db";
import { initiateCircleSdk } from "~/configs/circle";
import { parseUUID } from "~/utils/parseUUID";

//TODO - protect route

const getWalletDbRecord = async (
  externalId: string,
): Promise<{ walletId: string; refId: string } | undefined> => {
  try {
    const wallet = await db.wallet.findUnique({
      where: { externalId },
      select: { refId: true, walletId: true },
    });

    if (!wallet || !wallet.walletId || !wallet.refId) return undefined;

    return { walletId: wallet.walletId, refId: wallet.refId };
  } catch (error) {
    return undefined;
  }
};

const updateWalletDbRecord = async (refId: string): Promise<boolean> => {
  try {
    const update = await db.wallet.update({
      where: { refId },
      data: { isAssigned: true },
    });
    if (update.refId === refId) return true;
    return false;
  } catch (error) {
    return false;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { externalId } = req.body;
  const isUUID = parseUUID(externalId);

  if (!isUUID) {
    return res.status(500).json({ error: "Failed to validate id as UUID" });
  }

  try {
    const walletDbRecord = await getWalletDbRecord(externalId);

    if (!walletDbRecord) {
      return res.status(500).json({ error: "Failed to verify wallet record" });
    }
    const circleDeveloperSdk = initiateCircleSdk();
    const response = await circleDeveloperSdk.updateWallet({
      id: walletDbRecord.walletId,
      refId: walletDbRecord.refId,
      name: `${walletDbRecord.refId} Wallet`,
    });

    if (response.data?.wallet?.refId === walletDbRecord.refId) {
      const didDbUpdate = await updateWalletDbRecord(walletDbRecord.refId);
      if (didDbUpdate) {
        return res
          .status(200)
          .json({ walletAddress: response.data.wallet.address });
      }
    }

    return res.status(500).json({ error: "Failed to assign wallet" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to assign wallet" });
  }
}
