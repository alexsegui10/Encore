const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 500 },
    slug: { type: String, unique: true, index: true },
  },
  { timestamps: true }
);

// slugify simple sin dependencias
function slugify(text) {
  return String(text || '')
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}


CategorySchema.pre('save', async function () {
  if (!this.isModified('name') && this.slug) return;

  const base = slugify(this.name || 'categoria');
  let candidate = base || 'categoria';

  const clash = await this.constructor.findOne({ slug: candidate, _id: { $ne: this._id } }).lean();
  this.slug = clash ? `${base}-${Math.random().toString(36).slice(2, 6)}` : candidate;
});

module.exports = mongoose.model('Category', CategorySchema);
