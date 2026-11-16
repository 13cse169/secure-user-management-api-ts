import transporter from "../config/email.js";

const escapeHtml = (value: string): string => {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

export const sendVerificationEmail = async (
    email: string,
    name: string,
    token: string
): Promise<void> => {
    const verificationLink =
        `${process.env.APP_BASE_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`;

    await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: "Verify your email address",
        text: `Hello ${name},

            Please verify your email address by opening this link:

            ${verificationLink}

            This link expires in 15 minutes.

            If you did not create this account, you can ignore this email.`,

        html: `
            <div>
                <h2>Email Verification</h2>

                <p>Hello ${escapeHtml(name)},</p>

                <p>Thank you for registering with us.</p>

                <p>Please click the button below to verify your email address.</p>

                <a href="${verificationLink}"
                style="display:inline-block;padding:12px 20px;
                        background-color:#2563eb;color:white;
                        text-decoration:none;border-radius:5px;">
                Verify Email
                </a>

                <p>This verification link expires in 15 minutes.</p>

                <p>If you did not create this account, you can ignore this email.</p>
            </div>
        `
    });
};