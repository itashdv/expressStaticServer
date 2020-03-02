const uuidv1 = require('uuid/v1');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");
const Company = require('../models/company');
const Student = require('../models/student');
const Teacher = require('../models/teacher');
const Slot = require('../models/slot');


module.exports = {

	create: async (req, res) => {
		const { name, email, phone, password, password2 } = req.body;
		const bearer = req.headers.authorization;
        try {
        	if (!bearer) { throw 'Отказано в доступе!'; }
        	const arr = bearer.split(' ');
        	const uuid = arr[1];
        	if (!uuid) { throw 'Отказано в доступе!'; }
        	if (!validator.isUUID(uuid)) { throw 'Отказано в доступе!'; }
        	if (!name || !email || !phone || !password || !password2) {
        		throw 'Заполните все необходимые поля!';
        	}
        	if (password !== password2) { throw 'Пароли не совпадают!'; }
        	const students = await Student.find({ email });
        	if (students.length !== 0) {
        		throw 'Пользователь с такой почтой уже существует!';
        	}
        	// sending email confirmation before registering..
        	const token = await jwt.sign({ name, email, phone, password, uuid }, 'whoatemycat?', { expiresIn: 60*15 });
        	const transporter = nodemailer.createTransport({
        		host: 'smtp.yandex.com',
				port: 465,
				secure: true,
				auth: { user: 'atuacs@yandex.ru', pass: 'k1nqJw%SR$6UNvCpiut3H6Z5' }
        	});
        	const info = await transporter.sendMail({
				from: '"Auto Book 👻" <atuacs@yandex.ru>',
				to: email,
				subject: 'Завершите регистрацию!',
				text: `Чтобы закончить регистрацию перейдите по ссылке ниже. Ссылка действительна в течение 15-ти минут! Это письмо сгенерировано автоматически. На него не следует отвечать.`,
				html: `<a href="https://secret-taiga-38838.herokuapp.com/students/emailconfirm/${ token }">Подтвердить адрес</a>`
			});
			res.status(200).json('Мы отправили письмо на адрес Вашей электронной почты. Для завершения регистрации перейдите по ссылке в письме. Ссылка действительна 15 минут!');
        } catch(err) {
          res.status(400).json(err);
        }
    },
	
	login: async (req, res) => {
    const { email, password } = req.body;
    try {
      if (!email || !password) { throw 'Заполните все необходимые поля!'; }
      const students = await Student.find({ email });
      if (students.length === 0) { throw 'Ученик с такой почтой не найден!'; }
      const student = students[0];
      const result = await bcrypt.compareSync(password, student.hash);
      if (!result) { throw 'Неправильный пароль!'; }
      const token = await jwt.sign({ id: student._id }, 'whoatemycat?', { expiresIn: 60*60 });
      res.status(200).json(token);
    } catch(err) {
      res.status(400).json(err);
    }
  },

  finishCreate: async (req, res, student) => {
  	const { name, email, phone, password, uuid } = student;
  	try {
  		const docs = await Company.find({ uuid });
    	if (docs.length === 0) { throw 'Отказано в доступе!'; }
    	const company = docs[0];
    	const salt = await bcrypt.genSaltSync(10);
    	const student = new Student({
    		name: name,
    		email: email,
    		phone: phone,
    		company: company._id,
    		hash: bcrypt.hashSync(password, salt)
    	});
    	const result = await student.save();
    	if (!result) { throw 'Произошла ошибка!'; }
      company.students.push(student._id);
      await company.save();
      res.status(200).send('Вы успешно зарегистрированы! <a href="http://localhost:3000/login">Войти</a>');
  	} catch(err) {
  		res.status(400).json(err);
  	}
  },

  getMyProfile: async (req, res) => {
    const id = res.locals.student._id;
    try {
      const student = await Student.findById(id).select('-createdAt -hash');
      if (!student) { throw 'Отказано в доступе!'; }
      const slots = await Slot.find({ student: student._id }).populate('teacher');
      student.slots = slots;
      res.status(200).json(student);
    } catch (error) {
      res.status(400).json(error);
    }

  },

  updateMyProfile: async (req, res) => {
    const id = res.locals.student._id;
    const { name, phone, email, img } = req.body;
    try {
      const student = await Student.findById(id).select('-hash -createdAt -slots');
      if (!student) throw 'Ученик не найден!';
      if (name) { student.name = name; }
      if (phone) { student.phone = phone; }
      if (email) { student.email = email; }
      if (img) { student.img = img; }
      const result = await student.save();
      if (!result) throw 'Не удалось сохранить изменения!';
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json(error);
    }
  },

  changeMyPassword: async (req, res) => {
    const id = res.locals.student._id;
    const { password1, password2 } = req.body;
    try {
      if (!password1 || !password2) throw 'Введите пароль и подтверждение!';
      if (password1 !== password2) throw 'Пароли не совпадают!';
      const student = await Student.findById(id);
      if (!student) throw 'Ученик не найден!';
      const salt = await bcrypt.genSaltSync(10);
      student.hash = await bcrypt.hashSync(password1, salt);
      const result = await student.save();
      if (!result) { throw 'Не удалось изменить пароль!'; }
      res.status(200).json('Пароль успешно изменен!');
    } catch (error) {
      res.status(400).json(err);
    }
  },

  getByAdmin: async (req, res) => {
    const admin = res.locals.admin;
    try {
      const company = admin.company;
      const students = await Student.find({ company }).select('-createdAt -company -hash');
      if (!students) { throw 'Не удалось получить список учеников!'; }
      res.status(200).json(students);
    } catch (error) {
      res.status(400).json(error);
    }
  },

  getSchedule: async (req, res) => {
    const companyId = res.locals.student.company;
    setTimeout(() => {
      res.json(companyId);
    }, 3000);
  },

  getData: async (req, res) => {
    const id = res.locals.student._id;
    try {
      const student = await Student.findById(id).select('-createdAt -hash slots');
      if (!student) { throw 'Отказано в доступе!'; }
      const company = await Company.findById(student.company);
      if (!company) { throw 'Отказано в доступе!'; }
      const teachers = await Teacher.find({ company: student.company }).select('-createdAt -hash').populate('slots');
      const appointments = await Slot.find({ student: student._id }).populate('teacher');
      const data = {
        profile: student,
        company: company,
        teachers: teachers,
        appointments: appointments
      };
      res.status(200).json(data);
    } catch (error) {
      res.status(400).json(error);
    }

  }
    
};