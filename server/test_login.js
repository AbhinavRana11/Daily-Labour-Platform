const testRegister = async () => {
    try {
        console.log("Registering user...");
        const resReg = await fetch("http://localhost:5000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: "testuser",
                email: "testuser@gmail.com",
                password: "password123",
                phone: "1234567890",
                role: "user"
            })
        });
        console.log("Register response status:", resReg.status);
        console.log("Register response data:", await resReg.json());

        console.log("\nTesting login for new user...");
        const resLogin = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "testuser@gmail.com",
                password: "password123",
                role: "user"
            })
        });
        console.log("Login response status:", resLogin.status);
        console.log("Login response data:", await resLogin.json());
    } catch (err) {
        console.error("Test failed:", err.message);
    }
};

testRegister();
