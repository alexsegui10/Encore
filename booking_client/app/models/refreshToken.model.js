import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

// Add index for better performance
refreshTokenSchema.index({ userId: 1 });

// Índice para búsquedas por fecha de expiración (sin TTL automático)
// Ya no usamos expireAfterSeconds porque queremos mover los tokens a blacklist manualmente
refreshTokenSchema.index({ expiryDate: 1 });

export default mongoose.model('RefreshToken', refreshTokenSchema);