import forge from "node-forge";
import { sha256Hash } from "./apiUtils";

//this is for experimentation purposes, may be deleted and not utilized.
//at least not from this part of the project (this app).

const BASE64_POTATO = process.env.LOADED_BAKED_POTATO; //use a different potato in future

export const generateRSAKeyPair = (): {
  publicKeyPem: string;
  privateKeyPem: string;
} => {
  const keys = forge.pki.rsa.generateKeyPair({
    bits: 4096,
  });
  const publicKeyPem = forge.pki.publicKeyToPem(keys.publicKey);
  const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
  return { publicKeyPem, privateKeyPem };
};

export const decryptCipherText = (
  entitySecretCipherText: string,
  privateKey: string,
): string | null => {
  try {
    const privateKeyObj = forge.pki.privateKeyFromPem(privateKey);
    const cipherTextBytes = forge.util.decode64(entitySecretCipherText);

    const decrypted = privateKeyObj.decrypt(cipherTextBytes, "RSA-OAEP", {
      md: forge.md.sha256.create(),
      mgf1: { md: forge.md.sha256.create() },
    });
    return decrypted;
  } catch (error) {
    return null;
  }
};

export const storeEntitySecretHash = async (
  entitySecretCipherText: string,
  privateKey: string,
): Promise<string> => {
  const decryptedCipherText = decryptCipherText(
    entitySecretCipherText,
    privateKey,
  );
  if (!decryptedCipherText) return "";

  const hashedEntitySecret = sha256Hash(decryptedCipherText);
  const base64Hash = forge.util.encode64(hashedEntitySecret);
  /*
  const update = await db.user.update({
    where: {id: creatorId}, 
    data: {esHash: base64Hash }
  })

  if (update.esHash) return update.esHash;
  */
  return "";
};

export const storeEncryptedEntitySecretHash = async (
  entitySecretCipherText: string,
  creatorId: string,
  privateKey: string,
): Promise<string | null> => {
  const decryptedCipherText = decryptCipherText(
    entitySecretCipherText,
    privateKey,
  );
  if (!decryptedCipherText) return null;

  const hashedEntitySecret = sha256Hash(decryptedCipherText);
  const hashedCreatorId = sha256Hash(creatorId);

  const key = forge.util.decode64(BASE64_POTATO ?? "");
  const cipher = forge.cipher.createCipher("AES-CBC", key);
  const iv = forge.random.getBytesSync(16);

  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(hashedEntitySecret));
  cipher.finish();

  const encrypted = cipher.output.getBytes();
  const encryptedIv = iv + encrypted;
  const encryptedHashBase64 = forge.util.encode64(encryptedIv);

  const cipherTwo = forge.cipher.createCipher("AES-CBC", key);
  const ivTwo = forge.random.getBytesSync(16);
  const bothHashes = hashedEntitySecret + hashedCreatorId;

  cipherTwo.start({ iv: ivTwo });
  cipherTwo.update(forge.util.createBuffer(bothHashes));
  cipherTwo.finish();

  const encryptedBothHashes = cipherTwo.output.getBytes();
  const base64Data = forge.util.encode64(ivTwo + encryptedBothHashes);

  /*
  const update = await db.user.update({
    where: {apiKey: apiKey}, 
    data: {esHash: forge.util.encode64(encryptedHashBase64) }
  })
  */

  // if (update.esHash) return base64Data

  return base64Data;
};

export const decryptEntitySecretHash = (encryptedHash: string): string => {
  const key = forge.util.decode64(BASE64_POTATO ?? "");
  const hashFromBase64 = forge.util.decode64(encryptedHash);
  const iv = hashFromBase64.slice(0, 16);
  const encrypted = hashFromBase64.slice(16);
  const decipher = forge.cipher.createDecipher("AES-CBC", key);

  decipher.start({ iv });
  decipher.update(forge.util.createBuffer(encrypted));
  decipher.finish();
  return decipher.output.toString();
};

export const validateEntitySecretCipherText = (
  storedHash: string,
  entitySecretCipherText: string,
  privateKey: string,
): boolean => {
  const decryptedSecret = decryptCipherText(entitySecretCipherText, privateKey);

  if (!decryptedSecret) return false;

  const hashedSecret = sha256Hash(decryptedSecret);

  return storedHash === hashedSecret;
};

export const validateCipherTextFromEncryptedHash = (
  storedEncryptedHash: string,
  entitySecretCipherText: string,
  privateKey: string,
): boolean => {
  const decryptedSecret = decryptCipherText(entitySecretCipherText, privateKey);
  if (!decryptedSecret) return false;

  const decryptedHash = decryptEntitySecretHash(storedEncryptedHash);

  const hashedSecret = sha256Hash(decryptedHash);

  return decryptedHash === hashedSecret;
};

// export const validateRecoveryFile = (
//   base64Data: string,
//   privateKey: string,
//   creatorId: string,
// ): boolean => {

//   /*

//   const user = await db.user.findUnique({
//     where: {id: creatorId},
//     select: {esHash: true}
//   })

//   if (!user || !user.esHash) return false;

//   */

//   const encryptedData = forge.util.decode64(base64Data);

// //TODO - finish

// }
