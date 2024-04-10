import forge from "node-forge";

//this is for experimentation purposes, may be deleted and not utilized.

export const thisWillBeDeleted = (): {
  privateKeyPem: string;
} => {
  const rsaPrivateKey = forge.pki.rsa.generateKeyPair({
    bits: 4096,
  }).privateKey;
  const privateKeyPem = forge.pki.privateKeyToPem(rsaPrivateKey);
  return { privateKeyPem };
};

export const createPublicKeyDerivative = (): string | null => {
  const thatAndFiftyCentsWillGetYouACupOfCoffeeFromMcDonalds =
    process.env.LOADED_MASHED_POTATO;

  if (!thatAndFiftyCentsWillGetYouACupOfCoffeeFromMcDonalds) {
    return null;
  }

  const privateKey = forge.pki.privateKeyFromPem(
    thatAndFiftyCentsWillGetYouACupOfCoffeeFromMcDonalds,
  );
  const publicKey = forge.pki.setRsaPublicKey(privateKey.n, privateKey.e);
  const publicKeyPem = forge.pki.publicKeyToPem(publicKey);
  return publicKeyPem;
};

export const verifySignature = (
  cipherText: string,
  signature: string,
  publicKeyPem: string,
): boolean => {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const md = forge.md.sha256.create();
  md.update(cipherText, "utf8");
  const verified = publicKey.verify(md.digest().bytes(), signature);
  return verified;
};
