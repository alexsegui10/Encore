import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        unitPrice: {
            type: Number,
            required: true
        },
        itemType: {
            type: String,
            enum: ['event', 'product'],
            default: 'event',
            required: true
        },
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: false
        },
        productId: {
            type: String,
            required: false
        },
        productData: {
            type: mongoose.Schema.Types.Mixed,
            required: false
        }
    },
    { 
        timestamps: true,
        collection: 'OrderItem'
    }
);

export default mongoose.model('OrderItem', orderItemSchema);
