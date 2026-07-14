/**
 * Middleware to allow only specific roles.
 * Usage: router.use(allowRoles('customer'))
 */
export const allowRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: 'Not authorized: missing role' });
        }
        if (roles.includes(req.user.role)) {
            return next();
        }
        return res.status(403).json({ message: `Forbidden: requires ${roles.join(' or ')}` });
    };
};

// Convenience wrappers
export const allowCustomer = allowRoles('customer', 'user');
export const allowWorker = allowRoles('labour');
export const allowAdmin = allowRoles('admin');
