import { db } from "~/server/db";
import forge from "node-forge";
import { z } from "zod";
import { getEsHashByCreatorId, sha256Hash } from "./apiUtils";

//this is for experimentation purposes, may be deleted and not utilized.
//at least not from this part of the project (this app).
//priv keys will be managed via HSM or AWS KMS, or other solution.
//this is just for lol's, haha lol's.

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
  entityPrivateKey?: string,
): string | null => {
  //private key will come from AWS KMS or hardware sec module or other solution;
  //or likely none of this will even be managed here (in this app at all)
  const tempPrivKey = process.env.LOADED_MASHED_POTATO ?? ""; //this is hardcoded for now
  try {
    const privateKeyObj = forge.pki.privateKeyFromPem(tempPrivKey);
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

export const validateRecoveryFile = async (
  recoveryFileContent: string,
  creatorId: string,
): Promise<boolean> => {
  try {
    const fileContentShape = z.string().length(216);
    const fileContentParse = fileContentShape.safeParse(recoveryFileContent);

    if (!fileContentParse.success) return false;

    const binary = forge.util.decode64(recoveryFileContent);

    const decryptedData = decryptRecoveryFile(binary);

    if (!decryptedData) return false;

    const pipeIndex = decryptedData.indexOf("|");
    if (pipeIndex === -1) return false;

    const hashedEntitySecret = decryptedData.slice(0, pipeIndex);
    const hashedCreatorId = decryptedData.slice(pipeIndex + 1);

    const base64StoredHash = await getEsHashByCreatorId(creatorId);

    if (!base64StoredHash) return false;

    const decryptedStoredHash = decryptEntitySecretHash(base64StoredHash);
    const creatorIdHash = sha256Hash(creatorId);

    const isSecretValid = hashedEntitySecret === decryptedStoredHash;
    const isCreatorValid = hashedCreatorId === creatorIdHash;

    return isSecretValid && isCreatorValid;
  } catch (error) {
    return false;
  }
};

export const decryptRecoveryFile = (data: string): string => {
  const key = forge.util.decode64(BASE64_POTATO ?? ""); // from HSM or other
  const iv = data.slice(0, 16);
  const encryptedData = data.slice(16);

  const decipher = forge.cipher.createDecipher("AES-CBC", key);
  decipher.start({ iv });
  decipher.update(forge.util.createBuffer(encryptedData));
  decipher.finish();

  return decipher.output.toString();
};

export const storeEncryptedEntitySecretHash = async (
  entitySecretCipherText: string,
  creatorId: string,
  entityPrivateKey: string,
): Promise<string | null> => {
  const decryptedCipherText = decryptCipherText(
    entitySecretCipherText,
    entityPrivateKey,
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
  const pipe = "|";
  const bothHashes = hashedEntitySecret + pipe + hashedCreatorId;

  cipherTwo.start({ iv: ivTwo });
  cipherTwo.update(forge.util.createBuffer(bothHashes));
  cipherTwo.finish();

  const encryptedBothHashes = cipherTwo.output.getBytes();
  const base64Data = forge.util.encode64(ivTwo + encryptedBothHashes);

  const update = await db.user.update({
    where: { id: creatorId },
    data: { es: encryptedHashBase64, esUpdatedAt: new Date() },
  });

  if (update.es) return base64Data;

  return null;
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
  entityPrivateKey: string,
): boolean | null => {
  const decryptedSecret = decryptCipherText(
    entitySecretCipherText,
    entityPrivateKey,
  );

  if (!decryptedSecret) return null;

  const hashedSecret = sha256Hash(decryptedSecret);

  return storedHash === hashedSecret;
};

export const validateCipherTextFromEncryptedHash = (
  storedEncryptedHash: string,
  entitySecretCipherText: string,
  entityPrivateKey: string,
): boolean | null => {
  const decryptedSecret = decryptCipherText(
    entitySecretCipherText,
    entityPrivateKey,
  );
  if (!decryptedSecret) return null;

  const decryptedHash = decryptEntitySecretHash(storedEncryptedHash);
  const hashedSecret = sha256Hash(decryptedSecret);

  return decryptedHash === hashedSecret;
};
