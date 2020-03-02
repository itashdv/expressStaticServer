const mongoose = require('mongoose');

const Schema = mongoose.Schema,
    model = mongoose.model.bind(mongoose),
    ObjectId = mongoose.Schema.Types.ObjectId;

const slotSchema = new Schema({
    createdAt: { type: Date, default: new Date() },
    active: { type: Boolean, default: true },
    date: String,
    time: String,
    note: String,
    company: { type: ObjectId, ref: 'Company' },
    teacher: { type: ObjectId, ref: 'Teacher' },
    student: { type: ObjectId, ref: 'Student' }
});

const Slot = model('Slot', slotSchema);

module.exports = Slot;