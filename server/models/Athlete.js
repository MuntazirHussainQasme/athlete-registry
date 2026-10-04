const mongoose = require('mongoose');
const { Schema } = mongoose;

const Counter = mongoose.models.Counter || mongoose.model('Counter', new Schema({ _id: String, seq: { type: Number, default: 0 } }));

const athleteSchema = new Schema({
  athleteId: { type: String, unique: true },                       // ATH-0001, shown as a race bib
  name: { type: String, required: [true, 'Name is required'], trim: true },
  fatherName: { type: String, required: [true, "Father's name is required"], trim: true },
  age: { type: Number, required: [true, 'Age is required'], min: [5, 'Age must be at least 5'], max: [80, 'Age must be 80 or less'] },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: [true, 'Gender is required'] },
  sport: { type: Schema.Types.ObjectId, ref: 'Sport', required: [true, 'Sport is required'] },
  federation: { type: Schema.Types.ObjectId, ref: 'Federation', required: [true, 'Federation is required'] },
  city: { type: String, required: [true, 'City is required'], trim: true },
  contact: { type: String, required: [true, 'Contact is required'], match: [/^[0-9+\-\s]{7,15}$/, 'Enter a valid phone number'] },
  email: { type: String, trim: true, lowercase: true, match: [/^\S+@\S+\.\S+$|^$/, 'Enter a valid email'] },
  notes: { type: String, trim: true, maxlength: [500, 'Notes can be up to 500 characters'] },
  status: { type: String, enum: ['Active', 'Inactive', 'Suspended'], default: 'Active' },
  ageCategory: { type: String, enum: ['Junior', 'Senior', 'Masters'] },
}, { timestamps: true });

athleteSchema.pre('validate', async function () {
  if (this.age != null) this.ageCategory = this.age < 18 ? 'Junior' : this.age < 35 ? 'Senior' : 'Masters';
  if (this.isNew && !this.athleteId) {
    const c = await Counter.findByIdAndUpdate('athlete', { $inc: { seq: 1 } }, { new: true, upsert: true });
    this.athleteId = 'ATH-' + String(c.seq).padStart(4, '0');
  }
});

module.exports = mongoose.model('Athlete', athleteSchema);
