const jwt = require('jsonwebtoken');
const Superuser = require('../models/superuser');

const checkAuth = async (req, res, next) => {
    const bearer = req.headers.authorization;
    try {
        if (!bearer) { throw 'Отказано в доступе!'; }
        const arr = bearer.split(' ');
        const tokenString = arr[1];
        if (!tokenString) { throw 'Отказано в доступе!'; }
        const decoded = jwt.verify(tokenString, 'whoatemycat?');
        if (!decoded) { throw 'Отказано в доступе!'; }
        const superuser = await Superuser.findById(decoded.id).select('-hash');
        if (!superuser) { throw 'Отказано в доступе!'; }
        res.locals.superuser = superuser;
        next();
    } catch (error) {
        res.status(401).json(error);
    }
    
}

module.exports = checkAuth;