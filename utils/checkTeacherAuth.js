const jwt = require('jsonwebtoken');
const Teacher = require('../models/teacher');

const checkAuth = async (req, res, next) => {
    const bearer = req.headers.authorization;
    try {
        if (!bearer) { throw 'Отказано в доступе!'; }
        const arr = bearer.split(' ');
        const tokenString = arr[1];
        if (!tokenString) { throw 'Отказано в доступе!'; }
        const decoded = jwt.verify(tokenString, 'whoatemycat?');
        if (!decoded) { throw 'Отказано в доступе!'; }
        const teacher = await Teacher.findById(decoded.id).select('-hash');
        if (!teacher) { throw 'Отказано в доступе!'; }
        res.locals.teacher = teacher;
        next();
    } catch (error) {
        res.status(401).json(error);
    }
    
}

module.exports = checkAuth;