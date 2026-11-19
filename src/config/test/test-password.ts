import argon2 from "argon2";

const testPassword = async (): Promise<void> => {
    const password = "MySecureTestPassword123";

    const passwordHash = await argon2.hash(password, {
        type: argon2.argon2id
    });

    const correctPassword = await argon2.verify(
        passwordHash,
        password
    );

    const wrongPassword = await argon2.verify(
        passwordHash,
        "WrongTestPassword123"
    );

    console.log("Correct password:", correctPassword);
    console.log("Wrong password:", wrongPassword);
};

testPassword();