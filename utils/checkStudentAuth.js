const jwt = require('jsonwebtoken');
const Student = require('../models/student');

const checkAuth = async (req, res, next) => {
    const bearer = req.headers.authorization;
    console.log(bearer);
    try {
        if (!bearer) { throw 'Отказано в доступе!'; }
        const arr = bearer.split(' ');
        const tokenString = arr[1];
        if (!tokenString) { throw 'Отказано в доступе!'; }
        const decoded = jwt.verify(tokenString, 'whoatemycat?');
        if (!decoded) { throw 'Отказано в доступе!'; }
        const student = await Student.findById(decoded.id).select('-hash');
        if (!student) { throw 'Отказано в доступе!'; }
        res.locals.student = student;
        next();
    } catch (error) {
        res.status(401).json(error);
    }
    
}

module.exports = checkAuth;