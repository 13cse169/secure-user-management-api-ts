import { createHash, randomBytes } from "node:crypto";

export const generateVerificationToken = () => {
    // Generate 32 cryptographically secure random bytes
    const token = randomBytes(32).toString("hex");

    // Generate SHA-256 hash of the token
    const tokenHash = createHash("sha256").update(token).digest("hex");

    return {
        token,
        tokenHash
    };
};