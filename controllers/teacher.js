const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Teacher = require('../models/teacher');
const Company = require('../models/company');
const Slot = require('../models/slot');


module.exports = {

  login: async (req, res) => {
    const { email, password } = req.body;
    try {
      if (!email || !password) { throw 'Заполните все необходимые поля!'; }
      const teachers = await Teacher.find({ email });
      if (teachers.length === 0) { throw 'Инструктор с такой почтой не найден!'; }
      const teacher = teachers[0];
      const result = await bcrypt.compareSync(password, teacher.hash);
      if (!result) { throw 'Неправильный пароль!'; }
      const token = await jwt.sign({ id: teacher._id }, 'whoatemycat?', { expiresIn: 60*60 });
      res.status(200).json(token);
    } catch(err) {
      res.status(400).json(err);
    }
  },

  getMyProfile: async (req, res) => {
    const id = res.locals.teacher._id;
    try {
      const teacher = await Teacher.findById(id).select('-createdAt -hash');
      if (!teacher) { throw 'Отказано в доступе!'; }
      const slots = await Slot.find({ teacher: teacher._id }).populate('student');
      teacher.slots = slots;
      res.status(200).json(teacher);
    } catch (error) {
      res.status(400).json(error);
    }

  },

  updateMyProfile: async (req, res) => {
    const id = res.locals.teacher._id;
    const { name, phone, email, img } = req.body;
    try {
      const teacher = await Teacher.findById(id).select('-hash -createdAt -slots');
      if (!teacher) throw 'Инструктор не найден!';
      if (name) { teacher.name = name; }
      if (phone) { teacher.phone = phone; }
      if (email) { teacher.email = email; }
      if (img) { teacher.img = img; }
      const result = await teacher.save();
      if (!result) throw 'Не удалось сохранить изменения!';
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json(error);
    }
  },

  changeMyPassword: async (req, res) => {
    const id = res.locals.teacher._id;
    const { password1, password2 } = req.body;
    try {
      if (!password1 || !password2) throw 'Введите пароль и подтверждение!';
      if (password1 !== password2) throw 'Пароли не совпадают!';
      const teacher = await Teacher.findById(id);
      if (!teacher) throw 'Инструктор не найден!';
      const salt = await bcrypt.genSaltSync(10);
      teacher.hash = await bcrypt.hashSync(password1, salt);
      const result = await teacher.save();
      if (!result) { throw 'Не удалось изменить пароль!'; }
      res.status(200).json('Пароль успешно изменен!');
    } catch (error) {
      res.status(400).json(err);
    }
  },

  create: async (req, res) => {
    const admin = res.locals.admin;
    const { name, email, phone, password, password2 } = req.body;
    try {
      if (!admin) { throw 'Отказано в доступе!'; }
      if (!name || !email || !phone || !password || !password2) {
        throw 'Заполните все поля!';
      }
      if (password !== password2) { throw 'Пароли не совпадают!'; }
      const salt = await bcrypt.genSaltSync(10);
      const newTeacher = new Teacher({
        name: name,
        email: email,
        phone: phone,
        company: admin.company,
        hash: await bcrypt.hashSync(password, salt)
      });
      const result = await newTeacher.save();
      if (!result) { throw 'Не удалось добавить инструктора!' };
      delete result.hash;
      const company = await Company.findById(result.company);
      if (!company) {
        await Teacher.findByIdAndDelete(result._id);
        throw 'Не удалось добавить инструктора!';
      }
      company.teachers.push(result._id);
      await company.save();
      res.status(200).json(result);
    } catch(err) {
      res.status(400).json(err);
    }
  },

  updateProfile: async (req, res) => {
    const { id, name, phone, email } = req.body;
    try {
      if (!id) { throw 'ID необходим для обновления!'; }
      const teacher = await Teacher.findById(id).select(['-hash']);
      if (!teacher) { throw 'Отказано в доступе!'; }
      teacher.name = name === '' ? teacher.name : name;
      teacher.phone = phone === '' ? teacher.phone : phone;
      teacher.email = email === '' ? teacher.email : email;
      const result = await teacher.save({ new: true });
      if (!result) { throw 'Не удалось сохранить изменения!'; }
      res.status(200).json(result);
    } catch(err) {
      res.status(401).json(err);
    }
  },

  resetPassword: async (req, res) => {
    const { id, password, password2 } = req.body;
    try {
      if (!id) { throw 'Укажите ID!'; }
      if (password !== password2) { throw 'Пароли не совпадают!'; }
      const teacher = await Teacher.findById(id);
      if (!teacher) { throw 'Инструктор не найден!'; }
      const salt = await bcrypt.genSaltSync(10);
      teacher.hash = await bcrypt.hashSync(password, salt);
      const result = await teacher.save();
      if (!result) { throw 'Не удалось сбросить пароль!'; }
      res.status(200).json('Пароль успешно изменен!');
    } catch(err) {
      res.status(401).json(err);
    }
  },

  getByAdmin: async (req, res) => {
    const admin = res.locals.admin;
    try {
      const company = admin.company;
      const teachers = await Teacher.find({ company })
        .select('-createdAt -company -hash').populate('slots');
      if (!teachers) { throw 'Не удалось получить список инструкторов!'; }
      res.status(200).json(teachers);
    } catch (error) {
      res.status(400).json(error);
    }
  }

};
