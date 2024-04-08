import forge from "node-forge";

//this is for experimentation purposes, may be deleted and not utilized.

export const generateRSAKeyPair = (): {
  publicKeyPem: string;
  privateKeyPem: string;
} => {
  const rsaKeyPair = forge.pki.rsa.generateKeyPair({ bits: 4096 });
  const publicKeyPem = forge.pki.publicKeyToPem(rsaKeyPair.publicKey);
  const privateKeyPem = forge.pki.privateKeyToPem(rsaKeyPair.privateKey);
  return { publicKeyPem, privateKeyPem };
};

export const generateEntitySecretCiphertextAndSign = (
  publicKeyPem: string,
  privateKeyPem: string,
  entitySecret: string,
): {
  entityCipherText: string;
  signature: string;
} | null => {
  try {
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const secretToBytes = forge.util.hexToBytes(entitySecret);
    const encryptedData = publicKey.encrypt(secretToBytes, "RSA-OAEP", {
      md: forge.md.sha256.create(),
      mgf1: { md: forge.md.sha256.create() },
    });
    const entityCipherText = forge.util.encode64(encryptedData);

    const md = forge.md.sha256.create();
    md.update(encryptedData, "utf8");
    const signature = privateKey.sign(md);

    if (encryptedData && signature) {
      console.log("entity cipher text is -->", entityCipherText);
      console.log("signature from func is -->", signature);
      return { entityCipherText, signature };
    }

    return null;
  } catch (error) {
    console.error("error from func -->", error);
    return null;
  }
};

export const verifySignature = (
  cipherText: string,
  signature: string,
  publicKeyPem: string,
): boolean => {
  console.log("pub key from verify", publicKeyPem);
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const md = forge.md.sha256.create();
  md.update(cipherText, "utf8");
  const verified = publicKey.verify(md.digest().bytes(), signature);
  return verified;
};
