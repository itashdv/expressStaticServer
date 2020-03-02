const mongoose = require('mongoose');

const Schema = mongoose.Schema,
    model = mongoose.model.bind(mongoose),
    ObjectId = mongoose.Schema.Types.ObjectId;

const companySchema = new Schema({
    createdAt: { type: Date, default: new Date() },
    active: { type: Boolean, default: true },
    timezone: { type: String, default: 'Europe/Moscow' },
    name: String,
    uuid: String,
    description: String,
    address: String,
    phone: String,
    email: String,
    admins: [{ type: ObjectId, ref: 'Admin' }],
    teachers: [{ type: ObjectId, ref: 'Teacher' }],
    students: [{ type: ObjectId, ref: 'Student' }],
    slots: [{ type: ObjectId, ref: 'Slot' }]
});

const Company = model('Company', companySchema);

module.exports = Company;