import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
  itemType: {
    type: String,
    enum: ['event', 'product'],
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: function () { return this.itemType === 'event'; }
  },
  product: {
    type: mongoose.Schema.Types.Mixed, // Store product data from enterprise server
    required: function () { return this.itemType === 'product'; }
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

// Índice compuesto: permite múltiples carritos por usuario, pero solo uno activo
CartSchema.index({ userId: 1, status: 1 }, {
  unique: true,
  partialFilterExpression: { status: 'active' }
});


CartSchema.methods.calculateTotal = function () {
  console.log('=== CALCULATING CART TOTAL ===');
  console.log('Total items:', this.items.length);
  this.items.forEach((item, index) => {
    console.log(`Item ${index}:`, {
      itemType: item.itemType,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
      hasEvent: !!item.event,
      hasProduct: !!item.product
    });
  });
  this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  console.log('Calculated total:', this.total);
  return this.total;
};


CartSchema.methods.toCartResponse = function () {
  return {
    _id: this._id,
    userId: this.userId,
    items: this.items.map(item => {
      const baseItem = {
        itemType: item.itemType,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity
      };

      if (item.itemType === 'event') {
        // Check if event is populated (is an object) or just an ID
        if (item.event && typeof item.event === 'object' && item.event._id) {
          baseItem.event = item.event;
        } else if (item.event) {
          // Just an ObjectId, return basic object
          baseItem.event = { _id: item.event };
        }
      } else if (item.itemType === 'product') {
        // Products are stored as plain objects, not references
        if (item.product) {
          baseItem.product = item.product;
        }
      }

      return baseItem;
    }),
    total: this.total,
    itemCount: this.items.reduce((sum, item) => sum + item.quantity, 0),
    updatedAt: this.updatedAt
  };
};

CartSchema.methods.toStripeLineItems = function () {
  return this.items.map(item => {
    let productName = 'Item';

    if (item.itemType === 'event' && item.event) {
      productName = item.event.title || 'Evento';
    } else if (item.itemType === 'product' && item.product) {
      productName = item.product.name || 'Producto';
    }

    return {
      price_data: {
        currency: 'eur',
        product_data: {
          name: productName,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    };
  });
};

export default mongoose.model('Cart', CartSchema);
