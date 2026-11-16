import { generateVerificationToken } from "./token.js";

const result = generateVerificationToken();

console.log("Token length:", result.token.length);
console.log("Hash length:", result.tokenHash.length);
console.log("Token and hash are different:",
    result.token !== result.tokenHash
);