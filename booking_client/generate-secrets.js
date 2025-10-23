/**
 * Script para generar claves secretas seguras para JWT
 * 
 * Uso:
 *   node generate-secrets.js
 * 
 * Copiar el output al archivo .env
 */

const crypto = require('crypto');

console.log('\n🔐 Generando claves secretas para JWT...\n');
console.log('═'.repeat(80));

const accessSecret = crypto.randomBytes(64).toString('hex');
const refreshSecret = crypto.randomBytes(64).toString('hex');

console.log('\n📋 Copiar estas líneas a tu archivo .env:\n');
console.log(`ACCESS_TOKEN_SECRET=${accessSecret}`);
console.log(`REFRESH_TOKEN_SECRET=${refreshSecret}`);

console.log('\n═'.repeat(80));
console.log('\n✅ Claves generadas exitosamente!\n');
console.log('⚠️  IMPORTANTE: Guárdalas de forma segura y no las compartas.\n');
