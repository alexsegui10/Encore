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

refreshTokenSchema.index({ userId: 1 });

refreshTokenSchema.index({ expiryDate: 1 });

export default mongoose.model('RefreshToken', refreshTokenSchema);