import jwt from "jsonwebtoken";
import {
    generateAccessToken,
    generateRefreshToken
} from "../../services/jwt.service.js";

const testJwt = (): void => {
    
    const userId = "1";
    const sessionId = "1";

    // Generate both tokens
    const accessToken = generateAccessToken(userId, sessionId);
    const refreshToken = generateRefreshToken(userId, sessionId);

    // Decode tokens to inspect their payloads
    const accessPayload = jwt.decode(accessToken);
    const refreshPayload = jwt.decode(refreshToken);

    console.log("Access token generated:", !!accessToken);
    console.log("Refresh token generated:", !!refreshToken);

    console.log("Access token payload:", accessPayload);
    console.log("Refresh token payload:", refreshPayload);
};

testJwt();