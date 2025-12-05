import Cart from '../models/cart.model.js';
import Event from '../models/evento.model.js';

export const getCart = async (req, res) => {
  try {
    const userId = req.userId;
    let cart = await Cart.findOne({ userId, status: 'active' }).populate('items.event');

    if (!cart) {
      cart = await Cart.create({ userId, items: [], total: 0, status: 'active' });
    } else {
      // Recalculate total to ensure it's up-to-date
      cart.calculateTotal();
      await cart.save();
    }

    return res.status(200).json({ cart: cart.toCartResponse() });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { eventId, quantity = 1 } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    let cart = await Cart.findOne({ userId, status: 'active' });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [],
        total: 0,
        status: 'active'
      });
    }

    const existingItemIndex = cart.items.findIndex(
      item => item.event && item.event.toString() === eventId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        itemType: 'event',
        event: eventId,
        quantity,
        price: event.price
      });
    }

    cart.calculateTotal();
    await cart.save();
    await cart.populate('items.event');

    return res.status(200).json({ cart: cart.toCartResponse() });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({ message: error.message });
  }
};

export const addProductToCart = async (req, res) => {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const userId = req.userId;
      const { productId, quantity = 1, product } = req.body;

      if (!product) {
        return res.status(400).json({ message: 'Producto no proporcionado' });
      }

      if (!product.name) {
        return res.status(400).json({ message: 'Falta nombre del producto' });
      }

      if (product.price === undefined || product.price === null) {
        return res.status(400).json({ message: 'Falta precio del producto' });
      }

      // Buscar el carrito de nuevo en cada intento para tener la versión más reciente
      let cart = await Cart.findOne({ userId, status: 'active' });

      if (!cart) {
        cart = new Cart({
          userId,
          items: [],
          total: 0,
          status: 'active'
        });
      }

      const existingItemIndex = cart.items.findIndex(
        item => item.itemType === 'product' && item.product && item.product.id === productId
      );

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        cart.items.push({
          itemType: 'product',
          product: {
            id: productId,
            name: product.name,
            price: product.price,
            description: product.description,
            image: product.image
          },
          quantity,
          price: product.price
        });
      }

      cart.calculateTotal();
      await cart.save();

      return res.status(200).json({ cart: cart.toCartResponse() });
    } catch (error) {
      if (error.name === 'VersionError' && attempt < maxRetries - 1) {
        attempt++;
        await new Promise(resolve => setTimeout(resolve, 50 * attempt));
        continue;
      }
      
      console.error('Error adding product to cart:', error);
      return res.status(500).json({ message: error.message });
    }
  }

  return res.status(500).json({ message: 'No se pudo añadir el producto después de varios intentos' });
};

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId } = req.params;
    const { quantity, itemType } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: 'La cantidad debe ser al menos 1' });
    }

    const cart = await Cart.findOne({ userId, status: 'active' });
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    let item;
    if (itemType === 'event') {
      item = cart.items.find(item => item.itemType === 'event' && item.event && item.event.toString() === itemId);
    } else if (itemType === 'product') {
      item = cart.items.find(item => item.itemType === 'product' && item.product && item.product.id === itemId);
    }

    if (!item) {
      return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
    }

    item.quantity = quantity;
    cart.calculateTotal();
    await cart.save();
    await cart.populate('items.event');

    return res.status(200).json({ cart: cart.toCartResponse() });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId } = req.params;
    const { itemType } = req.query;

    const cart = await Cart.findOne({ userId, status: 'active' });
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    if (itemType === 'event') {
      cart.items = cart.items.filter(item =>
        !(item.itemType === 'event' && item.event && item.event.toString() === itemId)
      );
    } else if (itemType === 'product') {
      cart.items = cart.items.filter(item =>
        !(item.itemType === 'product' && item.product && item.product.id === itemId)
      );
    }

    cart.calculateTotal();
    await cart.save();
    await cart.populate('items.event');

    return res.status(200).json({ cart: cart.toCartResponse() });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.userId;

    const cart = await Cart.findOne({ userId, status: 'active' });
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    await Cart.deleteOne({ _id: cart._id });

    const newCart = await Cart.create({ userId, items: [], total: 0, status: 'active' });

    return res.status(200).json({ cart: newCart.toCartResponse() });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getCartForCheckout = async (req, res) => {
  try {
    const userId = req.userId;
    const cart = await Cart.findOne({ userId, status: 'active' }).populate('items.event');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'El carrito está vacío' });
    }

    return res.status(200).json({
      cart: cart.toCartResponse(),
      stripeLineItems: cart.toStripeLineItems()
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const completeCart = async (req, res) => {
  try {
    const userId = req.userId;

    const completedCart = await Cart.findOneAndUpdate(
      { userId, status: 'active' },
      { status: 'completed' },
      { new: true }
    );

    if (!completedCart) {
      return res.status(404).json({ message: 'Carrito activo no encontrado' });
    }

    let newCart = null;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries && !newCart) {
      try {
        newCart = await Cart.create({
          userId,
          items: [],
          total: 0,
          status: 'active'
        });
      } catch (createError) {
        if (createError.code === 11000 && retryCount < maxRetries - 1) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 100 * retryCount));

          const existingNewCart = await Cart.findOne({ userId, status: 'active' });
          if (existingNewCart) {
            newCart = existingNewCart;
            break;
          }
        } else {
          throw createError;
        }
      }
    }

    if (!newCart) {
      throw new Error('Failed to create new cart after multiple retries');
    }

    return res.status(200).json({
      message: 'Carrito marcado como completado y nuevo carrito creado',
      completedCart: completedCart.toCartResponse(),
      newCart: newCart.toCartResponse()
    });
  } catch (error) {
    console.error('Error completing cart:', error);
    return res.status(500).json({ message: error.message });
  }
};
