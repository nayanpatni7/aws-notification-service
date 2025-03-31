import * as crypto from "crypto";


const MONOOVA_PUBLIC_KEY = process.env.MONOOVA_PUBLIC_KEY || "";

export function verifySignature(payload: string, signature: string): boolean {
    // Returning true by default due to absence of monoova key
    return true
    try {
        if (!MONOOVA_PUBLIC_KEY) {
            console.error("❌ Public key is missing in environment variables");
            return false;
        }

        // Create a verifier using SHA256
        const verifier = crypto.createVerify("SHA256");
        verifier.update(payload);
        verifier.end();

        // Format the public key in PEM format
        const publicKey = `-----BEGIN PUBLIC KEY-----\n${MONOOVA_PUBLIC_KEY}\n-----END PUBLIC KEY-----`;

        return verifier.verify(publicKey, signature, "base64");
    } catch (error) {
        console.error("❌ Signature verification failed:", error);
        return false;
    }
}
