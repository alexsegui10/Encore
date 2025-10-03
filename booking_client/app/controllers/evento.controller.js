import Event from '../models/evento.model.js';
import asyncHandler from 'express-async-handler';
import Category from '../models/category.model.js';
// GET /eventos 
export const listEvents = async (req, res, next) => {
  try {
    // Función helper para transformar "undefined" string y valores vacíos
    let transUndefined = (varQuery, otherResult) => {
        return varQuery != "undefined" && varQuery ? varQuery : otherResult;
    };

    // Extraer y procesar parámetros con valores por defecto
    let limit = transUndefined(req.query.limit, 4);
    let offset = transUndefined(req.query.offset, 0);
    let category = transUndefined(req.query.category, "");
    let name = transUndefined(req.query.name, "");
    let price_min = transUndefined(req.query.price_min, 0);
    let price_max = transUndefined(req.query.price_max, Number.MAX_SAFE_INTEGER);
    
    // Crear regex para búsqueda de nombre/título
    let nameReg = new RegExp(name, 'i');

    console.log('Query params processed:', {
      limit, offset, category, name, price_min, price_max
    });

    // Construir query base - SIEMPRE incluye filtros de precio y nombre
    let query = {
        title: { $regex: nameReg },
        $and: [
            { price: { $gte: parseFloat(price_min) } }, 
            { price: { $lte: parseFloat(price_max) } }
        ],
    };

    // Agregar filtro de categoría si está presente
    if (category != "") {
        query.category = category;
    }

    console.log('MongoDB query:', JSON.stringify(query, null, 2));

    // Ejecutar query con paginación
    const events = await Event.find(query)
        .limit(Number(limit))
        .skip(Number(offset))
        .sort('-date')
        .lean();
    
    // Obtener conteo total con los mismos filtros
    const event_count = await Event.find(query).countDocuments();

    console.log(`Found ${events.length} events, total: ${event_count}`);

    if (!events) {
        return res.status(404).json({ msg: "No se encontraron eventos" });
    }

    return res.status(200).json({
        events: events,
        event_count: event_count,
        filters_applied: {
            category,
            price_min: parseFloat(price_min),
            price_max: parseFloat(price_max),
            name,
            limit: Number(limit),
            offset: Number(offset)
        }
    });
  } catch (err) {
    console.error('Error in listEvents:', err);
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

export const GetProductsByCategory = asyncHandler(async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug }).exec();

    if (!category) {
      return res.status(404).json({ message: "Categoria no encontrada" });
    }

    // Obtener todos los eventos de esta categoría
    const events = await Event.find({ category: category._id }).sort('-date').lean();

    return res.status(200).json(events);
  } catch (err) {
    console.error('Error in GetProductsByCategory:', err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Ruta temporal para testing - verificar datos
export const testEventData = async (req, res, next) => {
  try {
    console.log('=== TESTING EVENT DATA ===');
    
    // Obtener todos los eventos
    const allEvents = await Event.find().lean();
    console.log(`Total events found: ${allEvents.length}`);
    
    // Verificar tipos de datos
    allEvents.forEach((event, index) => {
      console.log(`Event ${index + 1}:`, {
        title: event.title,
        price: event.price,
        priceType: typeof event.price,
        category: event.category,
        categoryType: typeof event.category
      });
    });
    
    // Test query específica con precio
    const priceTestQuery = {
      $and: [
        { price: { $gte: 1 } }, 
        { price: { $lte: 1000 } }
      ]
    };
    
    const priceTestResults = await Event.find(priceTestQuery).lean();
    console.log(`Events with price between 1-1000: ${priceTestResults.length}`);
    
    priceTestResults.forEach(event => {
      console.log(`- ${event.title}: ${event.price} (${typeof event.price})`);
    });
    
    res.json({
      message: 'Check console for detailed output',
      totalEvents: allEvents.length,
      priceRangeResults: priceTestResults.length,
      sampleEvents: allEvents.slice(0, 3).map(e => ({
        title: e.title,
        price: e.price,
        priceType: typeof e.price
      }))
    });
    
  } catch (err) {
    console.error('Error in testEventData:', err);
    next(err);
  }
};