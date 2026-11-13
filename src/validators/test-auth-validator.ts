import { registerSchema } from "./auth.validator.js";

// const validUser = {
//     name: "Birendra Singh",
//     email: "BIRENDRA@EXAMPLE.COM",
//     password: "MySecurePassword@123"
// };

const validUser = {
    name: "B",
    email: "invalid-email",
    password: "123"
};

const result = registerSchema.safeParse(validUser);

if (result.success) {
    console.log("Validation successful!");
    console.log(result.data);
} else {
    console.log("Validation failed!");
    console.log(result.error.issues);
}
