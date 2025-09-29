import Event from '../models/evento.model.js';
import asyncHandler from 'express-async-handler';
import Category from '../models/category.model.js';
// GET /eventos 
export const listEvents = async (req, res, next) => {
  try {
    const items = await Event.find().sort('-date').lean();
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// GET /eventos/:slug
export const getOneEvent = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const doc = await Event.findOne({ slug }).lean();
    if (!doc) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

// POST /eventos
export const createEvent = async (req, res, next) => {
  try {
    const { title, date, price, currency, location, description, category, status } = req.body;

    // Requisitos mínimos
    if (!title || !date || price == null || category == null) {
      return res.status(400).json({ error: 'title, date, price y category son obligatorios' });
    }

    const ev = new Event({
      title,
      date,
      price,
      currency,
      location,
      description,
      category,
      status,
      mainImage: req.body.mainImage || '/images/default-event.jpg',
      images: req.body.images || []
    });

    await ev.save();
    
    // Find the category and add the event to it
    const categoryDoc = await Category.findById(category);
    if (categoryDoc) {
      await categoryDoc.addEvent(ev._id);
    }

    res.status(201).json(ev);
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    next(err);
  }
};

// PUT /eventos/:slug
export const updateEvent = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const doc = await Event.findOne({ slug });
    if (!doc) return res.status(404).json({ error: 'Evento no encontrado' });

    const oldCategory = doc.category;
    
    const allowed = ['title', 'date', 'price', 'currency', 'location', 'description', 'category', 'status', 'mainImage', 'images'];
    for (const k of allowed) {
      if (k in req.body) doc[k] = req.body[k];
    }

    await doc.save();
    
    // If category changed, update the category references
    if (req.body.category && oldCategory && oldCategory.toString() !== req.body.category.toString()) {
      // Remove from old category
      const oldCategoryDoc = await Category.findById(oldCategory);
      if (oldCategoryDoc) {
        await oldCategoryDoc.removeEvent(doc._id);
      }
      
      // Add to new category
      const newCategoryDoc = await Category.findById(req.body.category);
      if (newCategoryDoc) {
        await newCategoryDoc.addEvent(doc._id);
      }
    }
    
    res.json(doc);
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    next(err);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const doc = await Event.findOneAndDelete({ slug });
    if (!doc) return res.status(404).json({ error: 'Evento no encontrado' });
    
    // Remove the event from its category
    if (doc.category) {
      const categoryDoc = await Category.findById(doc.category);
      if (categoryDoc) {
        await categoryDoc.removeEvent(doc._id);
      }
    }
    
    res.json({ message: 'Evento eliminado', slug });
  } catch (err) {
    next(err);
  }
};

const GetProductsByCategory = asyncHandler(async (req, res) => {

  const slug = req.params;

  const category = await Category.findOne(slug).exec();

  if (!category) {
    res.status(400).json({ message: "Categoria no encontrada" });
  }

  return await res.status(200).json({
    products: await Promise.all(category.products.map(async eventId => {
      const productObj = await Event.findById(eventId).exec();
      return await productObj.toProductResponse(user);
    })),
  })
});