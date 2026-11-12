export type User = {
    id: string;
    name: string;
    email: string;
    is_email_verified: boolean;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
};

// PostgreSQL BIGINT values can exceed JavaScript's safe integer range. The pg driver normally returns BIGINT as a string, so we'll represent it as a string in TypeScript.