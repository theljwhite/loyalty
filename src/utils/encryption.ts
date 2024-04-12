import forge from "node-forge";

//this is for experimentation purposes, may be deleted and not utilized.

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
