// app/models/evento.model.js
import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    date: { type: Date, required: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'EUR' },
    location: { type: String, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    slug: { type: String, unique: true, index: true },
    status: { type: String, enum: ['draft', 'published', 'cancelled'], default: 'draft' },
  },
  { timestamps: true }
);

function slugify(text) {
  return String(text || '')
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

EventSchema.pre('save', async function () {
  if (!this.isNew && !this.isModified('title') && !this.isModified('date') && this.slug) return;
  const datePart = this.date ? new Date(this.date).toISOString().slice(0, 10) : '';
  const base = slugify(`${this.title || 'evento'} ${datePart}`) || 'evento';
  const clash = await this.constructor.findOne({ slug: base, _id: { $ne: this._id } }).lean();
  this.slug = clash ? `${base}-${Math.random().toString(36).slice(2, 6)}` : base;
});

EventSchema.pre('validate', function (next) {
  if (this.price == null || this.price < 0) return next(new Error('price debe ser >= 0'));
  next();
});

export default mongoose.model('Event', EventSchema);
