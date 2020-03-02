const Slot = require('../models/slot');
const Company = require('../models/company');
const Teacher = require('../models/teacher');

module.exports = {

	create: async (req, res) => {
		const { date, note, company, teacher } = req.body;
        const time = req.body.time.toString();
        try {
            if (!date || !time || !company || !teacher) { throw 'Заполните все необходимые поля!'; }
            const slot = new Slot({ date, time, note, company, teacher });
            const result = await slot.save();
            if (!result) { throw 'Не удалось сохранить занятие!'; }
            const updatedCompany = await Company.findById(result.company);
            updatedCompany.slots.push(result._id);
            await updatedCompany.save();
            const updatedTeacher = await Teacher.findById(result.teacher);
            updatedTeacher.slots.push(result._id);
            await updatedTeacher.save();
            console.log(result);
            setTimeout(() => {
                res.status(200).json(result);
            }, 5000);
        } catch(err) {
            console.log(err);
            res.status(400).json(err);
        }
    }
    
};
















// const Slot = require('../models/slot');
// const Company = require('../models/company');
// const Teacher = require('../models/teacher');

// module.exports = {

//     create: async (req, res) => {
//         const { date, note, company, teacher } = req.body;
//         const time = req.body.time.toString();
//         const slot = new Slot({ date, time, note, company, teacher });
//         const result = await slot.save();
//         try {
//             if (!date || !time || !company || !teacher) { throw 'Заполните все необходимые поля!'; }
//             const slot = new Slot({ date, time, note, company, teacher });
//             const result = await slot.save();
//             if (!result) { throw 'Не удалось сохранить занятие!'; }
//             const updatedCompany = await Company.findById(result.company);
//             updatedCompany.slots.push(result._id);
//             await updatedCompany.save();
//             const updatedTeacher = await Teacher.findById(result.teacher);
//             updatedTeacher.slots.push(result._id);
//             await updatedTeacher.save();
//             console.log(result);
//             setTimeout(() => {
//                 res.status(200).json(result);
//             }, 3000);
//         } catch(err) {
//             console.log(err);
//             res.status(400).json(err);
//         }
//     }
    
// };