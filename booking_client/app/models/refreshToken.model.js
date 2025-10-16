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

// Remove expired tokens automatically (TTL index)
refreshTokenSchema.index({ expiryDate: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('RefreshToken', refreshTokenSchema);