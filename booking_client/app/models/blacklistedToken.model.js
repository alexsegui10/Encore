import mongoose from 'mongoose';

const blacklistedTokenSchema = new mongoose.Schema({
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
    reason: {
        type: String,
        enum: ['logout', 'expired', 'revoked'],
        required: true
    },
    originalExpiryDate: {
        type: Date,
        required: true
    },
    blacklistedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Índice para búsquedas rápidas por token
blacklistedTokenSchema.index({ token: 1 });

// Índice para limpiar tokens antiguos automáticamente (TTL)
// Los tokens se eliminarán de la blacklist después de su fecha de expiración original + 7 días
blacklistedTokenSchema.index({ blacklistedAt: 1 }, { 
    expireAfterSeconds: 7 * 24 * 60 * 60 // 7 días
});

export default mongoose.model('BlacklistedToken', blacklistedTokenSchema);
