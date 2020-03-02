const uuidv1 = require('uuid/v1');
const generator = require('generate-password');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");
const Company = require('../models/company');
const Admin = require('../models/admin');


module.exports = {

	create: async (req, res) => {
		const { name, description, address, phone, email } = req.body;
		const uuid = await uuidv1();
        try {
        	if (!name || !description || !address || !phone || !email) {
        		throw 'Заполните все необходимые поля!';
        	}
			const company = new Company({ name, uuid, description, address, phone, email });
			await company.save();
			const password = await generator.generate({
				length: 8,
				numbers: true,
				symbols: true,
				uppercase: true
			});
			const salt = await bcrypt.genSaltSync(10);
			const admin = new Admin({
				email: company.email,
				phone: company.phone,
				company: company._id,
				hash: await bcrypt.hashSync(password, salt)
			});
			await admin.save();
			company.admins.push(admin._id);
			await company.save();
			const transporter = nodemailer.createTransport({
				host: 'smtp.yandex.com',
				port: 465,
				secure: true,
				auth: { user: 'atuacs@yandex.ru', pass: 'k1nqJw%SR$6UNvCpiut3H6Z5' }
			});
			const info = await transporter.sendMail({
				from: '"Auto Book 👻" <atuacs@yandex.ru>',
				to: admin.email,
				subject: 'Ваша компания зарегистрирована!',
				text: `Администратор: эл.почта ${ admin.email } пароль ${ password }`
			});
			console.log("Message sent: %s", info.messageId);
			res.status(200).json('Компания и администратор, прикрепленный к ней созданы. На их электронную почту было выслано письмо с логинем и паролем!');
        } catch (error) {
            res.status(400).json(error);
        }
    },

    getByAdmin: async (req, res) => {
    	const id = res.locals.admin.company;
    	try {
	    	const company = await Company.findById(id)
	    		.select('-createdAt -uuid -admins -teachers -students -slots');
	    	if (!company) { throw 'Компания не найдена!'; }
	    	if (!company.active) { throw 'Отказано в доступе: компания деактивирована!'; }
	    	res.status(200).json(company);
    	} catch (error) {
    		res.status(400).json(error);
    	}
    },

    getByUuid: async (req, res) => {
    	const uuid = req.params.uuid;
    	try {
    		if (!validator.isUUID(uuid)) { throw 'Неправильный идентификатор компании!'; }
    		const companies = await Company.find({ uuid }).select('-createdAt -admins -teachers -students -slots');
    		const company = companies[0];
    		if (!company) { throw 'Компания не найдена!'; }
    		if (company.active === false) { throw 'Отказано в доступе: Компания деактивирована!'; }
    		res.status(200).json(company);
    	} catch (error) {
    		res.status(400).json(error);
    	}
    },

    getAllCompanies: async (req, res) => {
    	try {
    		const companies = await Company.find().populate('admins');
    		res.status(200).json(companies);
    	} catch (error) {
    		res.status(400).json(error);
    	}
    },

    delete: async (req, res) => {
    	const id = req.body.id;
    	try {
    		const result1 = await Company.deleteOne({ _id: id });
    		const result2 = await Admin.deleteOne({ company: id });
    		const data = { result1, result2 };
    		res.status(200).json(data);
    	} catch (error) {
    		res.status(400).json(error);
    	}
    }
    
}