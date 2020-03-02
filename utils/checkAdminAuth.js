const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

const checkAuth = async (req, res, next) => {
    const bearer = req.headers.authorization;
    try {
        if (!bearer) { throw 'Отказано в доступе!'; }
        // res.status(200).json(bearer);
        const arr = bearer.split(' ');
        const tokenString = arr[1];
        if (!tokenString) { throw 'Отказано в доступе!'; }
        const decoded = jwt.verify(tokenString, 'whoatemycat?');
        if (!decoded) { throw 'Отказано в доступе!'; }
        const admin = await Admin.findById(decoded.id).select('-hash');
        if (!admin) { throw 'Отказано в доступе!'; }
        res.locals.admin = admin;
        next();
    } catch (error) {
        res.status(401).json(error);
    }
    
}

module.exports = checkAuth;