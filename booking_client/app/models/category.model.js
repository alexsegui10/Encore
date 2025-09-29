import mongoose from 'mongoose';


const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500 },
    image: { type: String, trim: true }, // URL de la imagen de la categoría
    slug: { type: String, unique: true, index: true },
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: "Events" }],

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

CategorySchema.pre('save', async function () {
  if (!this.isNew && !this.isModified('title') && !this.isModified('date') && this.slug) return;
  const datePart = this.date ? new Date(this.date).toISOString().slice(0, 10) : '';
  const base = slugify(`${this.title || 'evento'} ${datePart}`) || 'evento';
  const clash = await this.constructor.findOne({ slug: base, _id: { $ne: this._id } }).lean();
  this.slug = clash ? `${base}-${Math.random().toString(36).slice(2, 6)}` : base;
});


//serializer para carousel
CategorySchema.methods.toCategoryCarouselResponse = function () {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    image: this.image || '/images/default-category.jpg',
    slug: this.slug,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

CategorySchema.methods.addEvent = function (event_id) {
  if (this.events.indexOf(event_id) === -1) {
    this.events.push(event_id);
  }
  return this.save();
};

CategorySchema.methods.removeEvent = function (event_id) {
  if (this.events.indexOf(event_id) !== -1) {
    this.events.remove(event_id);
  }
  return this.save();
};


export default mongoose.model('Category', CategorySchema);
