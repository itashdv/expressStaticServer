const jwt = require('jsonwebtoken');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const Superuser = require('../models/superuser');

// const Admin = require('../models/admin');
// const Company = require('../models/company');
// const Teacher = require('../models/teacher');
// const Slot = require('../models/slot');

module.exports = {

    login: async (req, res) => {
        const { email, password } = req.body;
        try {
            if (!email || !password) { throw 'Заполните все необходимые поля!'; }
            const superusers = await Superuser.find({ email });
            if (superusers.length === 0) { throw 'Суперпользователь с такой почтой не найден!'; }
            const superuser = superusers[0];
            const result = await bcrypt.compareSync(password, superuser.hash);
            if (!result) { throw 'Неправильный пароль!'; }
            const token = await jwt.sign({ id: superuser._id }, 'whoatemycat?', { expiresIn: 60*60 });
            res.status(200).json(token);
        } catch(err) {
            res.status(400).json(err);
        }
    },

    getMyProfile: async (req, res) => {
        const profile = res.locals.superuser;
        try {
            if (!profile) { throw 'Отказано в доступе!'; }
            res.status(200).json(profile);
        } catch(err) {
            res.status(400).json(err);
        }
    },

    // create: async (req, res) => {
    //     const salt = await bcrypt.genSaltSync(10);
    //     const password1 = await bcrypt.hashSync('lsj*&KH9adjl', salt);
    //     const password2 = await bcrypt.hashSync('dfkjhKJ(87', salt);
    //     const user1 = {
    //         name: 'Донгак Айташ',
    //         email: 'itashcb@gmail.com',
    //         phone: '+8550964070349',
    //         hash: password1
    //     };
    //     const user2 = {
    //         name: 'Николай Козлов',
    //         email: 'greensms@mail.ru',
    //         phone: '+79510040605',
    //         hash: password2
    //     };
    //     try {
    //         const newUser1 = new Superuser(user1);
    //         const result1 = await newUser1.save();
    //         const newUser2= new Superuser(user2);
    //         const result2 = await newUser2.save();
    //         if (!result1) { throw 'Произошла ошибка!'; }
    //         if (!result2) { throw 'Произошла ошибка!'; }
    //         const responseData = [result1, result2];
    //         res.status(200).json(responseData);
    //     } catch(err) {
    //         res.status(400).json(err);
    //     }
    // }
    
};