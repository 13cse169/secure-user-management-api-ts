import "dotenv/config";
import transporter from "./email.js";

const testEmailConnection = async (): Promise<void> => {
    try {
        await transporter.verify();

        console.log("Email server connected successfully!");
    } catch (error) {
        console.error("Email connection failed:", error);
    }
};

testEmailConnection();