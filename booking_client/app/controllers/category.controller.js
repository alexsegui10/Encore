import Category from '../models/category.model.js';

// GET /categorias
export const list = async (req, res, next) => {
  try {
    const offset = parseInt(req.query.offset, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 4;
    const items = await Category.find()
      .sort('name')
      .skip(offset)
      .limit(limit)
      .lean();
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// GET /categorias/:slug
export const getOne = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const doc = await Category.findOne({ slug }).lean();
    if (!doc) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

// POST /categorias
export const create = async (req, res, next) => {
  try {
    const { name, description, image } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name es obligatorio' });
    }

    const cat = new Category({ name, description, image });
    await cat.save();
    res.status(201).json(cat);
  } catch (err) {
    if (err.code === 11000) {
      // p.ej. slug duplicado
      return res.status(409).json({ error: 'La categoría ya existe (slug duplicado)' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

// PUT /categorias/:slug
export const update = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const doc = await Category.findOne({ slug });
    if (!doc) return res.status(404).json({ error: 'Categoría no encontrada' });

    const allowed = ['name', 'description', 'image'];
    for (const k of allowed) {
      if (k in req.body) doc[k] = req.body[k];
    }

    await doc.save(); // esto re-generará el slug si cambia 'name' (por el pre-save del modelo)
    res.json(doc);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'La categoría ya existe (slug duplicado)' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

// DELETE /categorias/:slug
export const remove = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const doc = await Category.findOneAndDelete({ slug });
    if (!doc) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json({ message: 'Categoría eliminada', slug });
  } catch (err) {
    next(err);
  }
};

// GET /categories_select_filter
export const findCategoriesSelect = async (req, res, next) => {
  try {
    const items = await Category.find()
      .select('_id name slug')
      .sort('name')
      .lean();
    res.json({ categories: items });
  } catch (err) {
    next(err);
  }
};

