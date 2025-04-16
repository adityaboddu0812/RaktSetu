const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        console.log('Auth header:', authHeader);

        if (!authHeader) {
            console.log('No Authorization header found');
            return res.status(401).json({ 
                message: 'No authentication token, access denied',
                detail: 'Authorization header is missing'
            });
        }

        // Extract token
        const token = authHeader.replace('Bearer ', '');
        console.log('Token found:', token.substring(0, 20) + '...');
        
        if (!token) {
            console.log('No token found after Bearer prefix');
            return res.status(401).json({ 
                message: 'No authentication token, access denied',
                detail: 'Token is missing from Authorization header'
            });
        }

        try {
            // Verify token
            const verified = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token verified successfully:', {
                userId: verified.userId || verified._id,
                role: verified.role,
                token: token.substring(0, 20) + '...'
            });

            // Add more detailed logging
            console.log('Full token payload:', verified);

            req.user = {
                ...verified,
                userId: verified.userId || verified._id
            };
            
            next();
        } catch (verifyError) {
            console.error('Token verification failed:', verifyError.message);
            console.error('Token verification error details:', {
                name: verifyError.name,
                message: verifyError.message,
                stack: verifyError.stack
            });
            return res.status(401).json({ 
                message: 'Token is not valid',
                detail: verifyError.message
            });
        }
    } catch (err) {
        console.error('Auth middleware error:', err);
        res.status(500).json({ 
            message: 'Internal server error in auth middleware',
            detail: err.message
        });
    }
};

module.exports = auth; 