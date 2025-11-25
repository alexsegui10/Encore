import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
});

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [CartItemSchema],
  total: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  }
}, { timestamps: true });

CartSchema.methods.calculateTotal = function() {
  this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  return this.total;
};

CartSchema.methods.toCartResponse = function() {
  return {
    _id: this._id,
    userId: this.userId,
    items: this.items.map(item => ({
      event: item.event,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity
    })),
    total: this.total,
    itemCount: this.items.reduce((sum, item) => sum + item.quantity, 0),
    updatedAt: this.updatedAt
  };
};

CartSchema.methods.toStripeLineItems = function() {
  return this.items.map(item => ({
    price_data: {
      currency: 'eur',
      product_data: {
        name: item.event.title || 'Evento',
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));
};

export default mongoose.model('Cart', CartSchema);
