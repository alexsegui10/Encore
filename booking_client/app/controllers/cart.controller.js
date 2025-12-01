import Cart from '../models/cart.model.js';
import Event from '../models/evento.model.js';

export const getCart = async (req, res) => {
  try {
    const userId = req.userId;
    let cart = await Cart.findOne({ userId, status: 'active' }).populate('items.event');

    if (!cart) {
      cart = await Cart.create({ userId, items: [], total: 0, status: 'active' });
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

    // Buscar carrito activo, si no existe crear uno nuevo
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
      item => item.event.toString() === eventId
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
  try {
    const userId = req.userId;
    const { productId, quantity = 1, product } = req.body;

    if (!product || !product.name || !product.price) {
      return res.status(400).json({ message: 'Datos del producto incompletos' });
    }

    // Buscar carrito activo, si no existe crear uno nuevo
    let cart = await Cart.findOne({ userId, status: 'active' });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [],
        total: 0,
        status: 'active'
      });
    }

    // Check if product already exists in cart
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
    console.error('Error adding product to cart:', error);
    return res.status(500).json({ message: error.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { eventId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: 'La cantidad debe ser al menos 1' });
    }

    const cart = await Cart.findOne({ userId, status: 'active' });
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    const item = cart.items.find(item => item.event.toString() === eventId);
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
    const { eventId } = req.params;

    const cart = await Cart.findOne({ userId, status: 'active' });
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    cart.items = cart.items.filter(item => item.event.toString() !== eventId);
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

    // Borrar físicamente el carrito
    await Cart.deleteOne({ _id: cart._id });

    // Crear un nuevo carrito vacío
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

    const cart = await Cart.findOne({ userId, status: 'active' });
    if (!cart) {
      return res.status(404).json({ message: 'Carrito activo no encontrado' });
    }

    cart.status = 'completed';
    await cart.save();

    const newCart = new Cart({
      userId,
      items: [],
      total: 0,
      status: 'active'
    });
    await newCart.save();

    return res.status(200).json({
      message: 'Carrito marcado como completado y nuevo carrito creado',
      completedCart: cart.toCartResponse(),
      newCart: newCart.toCartResponse()
    });
  } catch (error) {
    console.error('Error completing cart:', error);
    return res.status(500).json({ message: error.message });
  }
};
