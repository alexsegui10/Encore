// app/models/evento.model.js
import mongoose from 'mongoose';
import User from './user.model.js';
const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    date: {
      type: Date,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'EUR'
    },
    location: {
      type: String,
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    category: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      unique: true,
      index: true
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled'],
      default: 'draft'
    },
    mainImage: {
      type: String,
      trim: true,
      maxlength: 500
    },
    favouritesCount: {
      type: Number,
      default: 0
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.every(url => typeof url === 'string' && url.length <= 500);
        },
        message: 'Cada URL de imagen debe ser un string de máximo 500 caracteres'
      }
    },
    comments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }]
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

EventSchema.methods.toEventResponse = async function (user) {
  return {
    _id: this._id,
    slug: this.slug,
    title: this.title,
    date: this.date,
    price: this.price,
    currency: this.currency,
    location: this.location,
    description: this.description,
    category: this.category,
    status: this.status,
    mainImage: this.mainImage,
    images: this.images,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    isLiked: user ? user.isFavourite(this._id) : false,
    likesCount: this.favouritesCount,
  }
}

//serializer para carousel
EventSchema.methods.toEventoCarouselResponse = async function () {
  return {
    id: this._id,
    title: this.title,
    date: this.date,
    price: this.price,
    currency: this.currency,
    location: this.location,
    description: this.description,
    category: this.category,
    slug: this.slug,
    status: this.status,
    images: this.images,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

// Método para actualizar el contador de favoritos
EventSchema.methods.updateFavoriteCount = async function () {
  const User = mongoose.model('User');
  const favoriteCount = await User.countDocuments({
    favouriteEvents: { $in: [this._id] }
  });

  this.favouritesCount = favoriteCount;

  return this.save();
}

// Métodos para comments
EventSchema.methods.addComment = function (commentId) {
  if (this.comments.indexOf(commentId) === -1) {
    this.comments.push(commentId);
  }
  return this.save();
};

EventSchema.methods.removeComment = function (commentId) {
  this.comments.pull(commentId);
  return this.save();
};

export default mongoose.model('Event', EventSchema);
