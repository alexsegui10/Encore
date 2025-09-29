import Event from '../models/evento.model.js'; 

// GET /eventos 
export const list = async (req, res, next) => {
  try {
    const items = await Event.find().sort('-date').lean();
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// GET /eventos/:slug
export const getOne = async (req, res, next) => {
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
export const create = async (req, res, next) => {
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
    res.status(201).json(ev);
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    next(err);
  }
};

// PUT /eventos/:slug
export const update = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const doc = await Event.findOne({ slug });
    if (!doc) return res.status(404).json({ error: 'Evento no encontrado' });

    const allowed = ['title', 'date', 'price', 'currency', 'location', 'description', 'category', 'status', 'mainImage', 'images'];
    for (const k of allowed) {
      if (k in req.body) doc[k] = req.body[k];
    }

    await doc.save();
    res.json(doc);
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const doc = await Event.findOneAndDelete({ slug });
    if (!doc) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json({ message: 'Evento eliminado', slug });
  } catch (err) {
    next(err);
  }
};
