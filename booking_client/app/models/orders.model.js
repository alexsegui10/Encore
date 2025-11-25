import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
    {
        uid: {
            type: String,
            required: true,
            unique: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: 'EUR'
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'cancelled'],
            default: 'pending',
            required: true
        }
    },
    { 
        timestamps: true,
        collection: 'Order' // Nombre exacto de la colección en MongoDB
    }
);

export default mongoose.model('Order', orderSchema);