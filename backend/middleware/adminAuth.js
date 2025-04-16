const auth = require('./auth');

const adminAuth = async (req, res, next) => {
    try {
        // First run the general auth middleware
        await new Promise((resolve, reject) => {
            auth(req, res, (err) => {
                if (err) reject(err);
                resolve();
            });
        });

        // Check if user exists and is an admin
        if (!req.user) {
            return res.status(401).json({
                message: 'Authentication failed',
                detail: 'User not found in request'
            });
        }

        if (req.user.role !== 'admin') {
            console.log('Access denied: User role is', req.user.role);
            return res.status(403).json({
                message: 'Access denied',
                detail: 'This route requires admin privileges'
            });
        }

        console.log('Admin access granted for user:', req.user.userId);
        next();
    } catch (err) {
        console.error('Admin auth middleware error:', err);
        res.status(500).json({
            message: 'Internal server error in admin auth middleware',
            detail: err.message
        });
    }
};

module.exports = adminAuth; 