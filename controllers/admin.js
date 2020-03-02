const jwt = require('jsonwebtoken');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const Admin = require('../models/admin');
const Company = require('../models/company');
const Teacher = require('../models/teacher');
const Slot = require('../models/slot');

module.exports = {

	login: async (req, res) => {
		const { email, password } = req.body;
        try {
            if (!email || !password) { throw 'Заполните все необходимые поля!'; }
            const admins = await Admin.find({ email });
            if (admins.length === 0) { throw 'Администратор с такой почтой не найден!'; }
            const admin = admins[0];
            const result = await bcrypt.compareSync(password, admin.hash);
            if (!result) { throw 'Неправильный пароль!'; }
            const token = await jwt.sign({ id: admin._id }, 'whoatemycat?', { expiresIn: 60*60 });
            res.status(200).json(token);
        } catch(err) {
            res.status(400).json(err);
        }
    },

    getProfile: async (req, res) => {
        const admin = res.locals.admin;
        try {
            if (!admin) { throw 'Отказано в доступе!'; }
            res.status(200).json(admin);
        } catch(err) {
            res.status(401).json(err);
        }
    },

    updateProfile: async (req, res) => {
        const admin = res.locals.admin;
        const { name, phone, email } = req.body;
        try {
            if (!admin) { throw 'Отказано в доступе!'; }
            const doc = {
                name: name === '' ? admin.name : name,
                phone: phone === '' ? admin.phone : phone,
                email: email === '' ? admin.email : email
            };
            const result = await Admin.findByIdAndUpdate(admin._id, doc, { new: true });
            if (!result) { throw 'Не удалось сохранить изменения!'; }
            res.status(200).json(result);
        } catch(err) {
            res.status(401).json(err);
        }
    },

    updatePassword: async (req, res) => {
        const adminId = res.locals.admin._id;
        const { oldPassword, newPassword } = req.body;
        try {
            if (!adminId) { throw 'Отказано в доступе!'; }
            if (!oldPassword || ! newPassword) { throw 'Заполните поля!'; }
            if (oldPassword === newPassword) { throw 'Новый пароль не должен совпадать со старым!'; }
            const admin = await Admin.findById(adminId);
            if (!admin) { throw 'Отказано в доступе!'; }
            const result = await bcrypt.compareSync(oldPassword, admin.hash);
            if (!result) { throw 'Неправильный пароль!'; }
            const salt = await bcrypt.genSaltSync(10);
            admin.hash = await bcrypt.hashSync(newPassword, salt);
            await admin.save();
            res.status(200).json('Ваш пароль успешно изменен!');
        } catch(err) {
            res.status(401).json(err);
        }
    }
    
};
































// const jwt = require('jsonwebtoken');
// const validator = require('validator');
// const bcrypt = require('bcryptjs');
// const Admin = require('../models/admin');
// const Company = require('../models/company');
// const Teacher = require('../models/teacher');
// const Slot = require('../models/slot');

// module.exports = {

//     login: async (req, res) => {
//         const { email, password } = req.body;
//         try {
//             if (!email || !password) { throw 'Заполните все необходимые поля!'; }
//             const admins = await Admin.find({ email });
//             if (admins.length === 0) { throw 'Администратор с такой почтой не найден!'; }
//             const admin = admins[0];
//             const result = await bcrypt.compareSync(password, admin.hash);
//             if (!result) { throw 'Неправильный пароль!'; }
//             const token = await jwt.sign({ id: admin._id }, 'whoatemycat?', { expiresIn: 60*60 });
//             res.status(200).json(token);
//         } catch(err) {
//             res.status(400).json(err);
//         }
//     },

//     getProfile: async (req, res) => {
//         const admin = res.locals.admin;
//         try {
//             if (!admin) { throw 'Отказано в доступе!'; }
//             const company = await Company.
//                 findById(admin.company).
//                 select(['-uuid']).
//                 populate({ path: 'students', select: '-hash' }).
//                 // populate({ path: 'teachers', select: '-hash' }).
//                 populate({
//                     path: 'admins',
//                     match: { company: { $eq: admin.company } },
//                     select: '-hash'
//                 });
//             if (!company) { throw 'Компания не найдена!'; }
//             const teachers = await Teacher.find({ company: company._id }).select(['-hash']).populate('slots');
//             company.teachers = teachers;
//             res.status(200).json(company);
//         } catch(err) {
//             res.status(401).json(err);
//         }
//     },

//     updateProfile: async (req, res) => {
//         const admin = res.locals.admin;
//         const { name, phone, email } = req.body;
//         try {
//             if (!admin) { throw 'Отказано в доступе!'; }
//             const doc = {
//                 name: name === '' ? admin.name : name,
//                 phone: phone === '' ? admin.phone : phone,
//                 email: email === '' ? admin.email : email
//             };
//             const result = await Admin.findByIdAndUpdate(admin._id, doc, { new: true });
//             if (!result) { throw 'Не удалось сохранить изменения!'; }
//             res.status(200).json(result);
//         } catch(err) {
//             res.status(401).json(err);
//         }
//     },

//     updatePassword: async (req, res) => {
//         const adminId = res.locals.admin._id;
//         const { oldPassword, newPassword } = req.body;
//         try {
//             if (!adminId) { throw 'Отказано в доступе!'; }
//             if (!oldPassword || ! newPassword) { throw 'Заполните поля!'; }
//             if (oldPassword === newPassword) { throw 'Новый пароль не должен совпадать со старым!'; }
//             const admin = await Admin.findById(adminId);
//             if (!admin) { throw 'Отказано в доступе!'; }
//             const result = await bcrypt.compareSync(oldPassword, admin.hash);
//             if (!result) { throw 'Неправильный пароль!'; }
//             const salt = await bcrypt.genSaltSync(10);
//             admin.hash = await bcrypt.hashSync(newPassword, salt);
//             await admin.save();
//             res.status(200).json('Ваш пароль успешно изменен!');
//         } catch(err) {
//             res.status(401).json(err);
//         }
//     }
    
// };