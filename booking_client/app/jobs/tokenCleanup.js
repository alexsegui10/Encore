import RefreshToken from '../models/refreshToken.model.js';
import BlacklistedToken from '../models/blacklistedToken.model.js';

export const moveExpiredTokensToBlacklist = async () => {
    try {
        const expiredTokens = await RefreshToken.find({
            expiryDate: { $lte: new Date() }
        });
        
        for (const token of expiredTokens) {
            await BlacklistedToken.create({
                token: token.token,
                userId: token.userId,
                reason: 'expired',
                originalExpiryDate: token.expiryDate
            });
            
            await RefreshToken.findByIdAndDelete(token._id);
        }
        
        if (expiredTokens.length > 0) {
            console.log(`Movidos ${expiredTokens.length} tokens expirados a blacklist`);
        }
    } catch (error) {
        console.error('Error moviendo tokens expirados:', error);
    }
};

export const startTokenCleanup = () => {
    setInterval(moveExpiredTokensToBlacklist, 60000);
    moveExpiredTokensToBlacklist(); // Ejecutar al inicio también
};
