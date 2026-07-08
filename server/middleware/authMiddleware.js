import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            console.log("Token received:", token);
            // console.log("Secret used:", process.env.JWT_SECRET); 
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key_123");

            req.user = decoded; // { id, role }
            next();
        } catch (error) {
            console.error("JWT Verification Error:", error.message);
            res.status(401).json({ message: "Not authorized, token failed: " + error.message });
        }
    }

    if (!token) {
        res.status(401).json({ message: "Not authorized, no token" });
    }
};
