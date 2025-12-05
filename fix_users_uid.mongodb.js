// Script para arreglar usuarios sin uid o slug
// Conectar a la base de datos encore

use('encore');

// Buscar usuarios sin uid o slug null
const usersWithIssues = db.users.find({
  $or: [
    { uid: null },
    { uid: { $exists: false } },
    { slug: null },
    { slug: { $exists: false } }
  ]
});

print('\n=== USUARIOS CON PROBLEMAS ===');
let count = 0;
usersWithIssues.forEach(user => {
  count++;
  print(`\nUsuario #${count}:`);
  print(`  _id: ${user._id}`);
  print(`  username: ${user.username}`);
  print(`  email: ${user.email}`);
  print(`  uid actual: ${user.uid || 'null'}`);
  print(`  slug actual: ${user.slug || 'null'}`);
  
  const updateFields = {};
  
  // Generar nuevo uid si no existe
  if (!user.uid) {
    updateFields.uid = `${user.username.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    print(`  ✓ Nuevo uid: ${updateFields.uid}`);
  }
  
  // Generar nuevo slug si no existe
  if (!user.slug) {
    updateFields.slug = user.username.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    print(`  ✓ Nuevo slug: ${updateFields.slug}`);
  }
  
  // Actualizar el usuario
  if (Object.keys(updateFields).length > 0) {
    const result = db.users.updateOne(
      { _id: user._id },
      { $set: updateFields }
    );
    print(`  Modificado: ${result.modifiedCount}`);
  }
});

print(`\n=== TOTAL: ${count} usuarios actualizados ===\n`);

// Verificar que ya no hay usuarios con problemas
const remaining = db.users.countDocuments({
  $or: [
    { uid: null },
    { uid: { $exists: false } },
    { slug: null },
    { slug: { $exists: false } }
  ]
});

print(`Usuarios restantes con problemas: ${remaining}\n`);
