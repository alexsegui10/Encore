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
            enum: ['event'],
            default: 'event',
            required: true
        },
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true
        }
    },
    { 
        timestamps: true,
        collection: 'OrderItem'
    }
);

export default mongoose.model('OrderItem', orderItemSchema);
