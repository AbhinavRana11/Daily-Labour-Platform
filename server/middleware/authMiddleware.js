import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            console.log("JWT Auth - Token received:", token);
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key_123");
            console.log("JWT Auth - Decoded payload:", decoded);

            req.user = decoded; // { id, role }
            return next();
        } catch (error) {
            console.error("JWT Auth - Verification Error:", error.message);
            return res.status(401).json({ message: "Not authorized, token failed: " + error.message });
        }
    }

    if (!token) {
        console.warn("JWT Auth - No token found in authorization headers");
        return res.status(401).json({ message: "Not authorized, no token" });
    }
};
