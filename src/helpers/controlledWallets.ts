import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import forge from "node-forge";

const fetchPublicKey = async (): Promise<string> => {
  try {
    const circleDeveloperSdk = initiateDeveloperControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY ?? "",
      entitySecret: process.env.CIRCLE_ENTITY_SECRET ?? "",
    });

    const response = await circleDeveloperSdk.getPublicKey();
    return response.data?.publicKey ?? "";
  } catch (error) {
    console.error("Error fetching public key", error);
    return "";
  }
};

export const generateCipherText = async (): Promise<string> => {
  const keyResult = await fetchPublicKey();

  const entitySecret = forge.util.hexToBytes(
    process.env.CIRCLE_ENTITY_SECRET ?? "",
  );
  const publicKey = forge.pki.publicKeyFromPem(keyResult);
  const encryptedData = publicKey.encrypt(entitySecret, "RSA-OAEP", {
    md: forge.md.sha256.create(),
    mgf1: forge.md.sha256.create(),
  });

  const cipherText = forge.util.encode64(encryptedData);
  console.log("cipher text -->", cipherText);
  return cipherText;
};
