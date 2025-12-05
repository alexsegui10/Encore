# Lógica de Merchandising en Encore

## Cómo funciona

### Estructura de datos

En el modelo `Event` (evento.model.js), el campo `merchandising` está definido así:

```javascript
merchandising: {
  type: mongoose.Schema.Types.Mixed,
  default: []
}
```

Este campo puede contener cualquier tipo de dato (Mixed), pero por defecto es un array vacío.

### ¿Por qué está vacío?

El merchandising aparece vacío en eventos recién creados porque:

1. **No se crea automáticamente**: Los productos de merchandising no se generan automáticamente al crear un evento
2. **Se debe asociar manualmente**: Los productos deben ser asociados explícitamente al evento
3. **Es opcional**: No todos los eventos tienen merchandising

### Cómo funciona cuando "le das y funciona"

Cuando dices que "le das y funciona con 3 productos", probablemente:

1. **Existe una ruta/endpoint** que asocia productos al evento
2. **Se almacena en el array**: Los IDs o datos de los productos se guardan en el campo `merchandising`
3. **Se recupera con el evento**: Al obtener el evento, el merchandising viene incluido

### Ejemplo de flujo típico:

```
1. Crear evento → merchandising: []
2. Asociar producto 1 → merchandising: [producto1_id]
3. Asociar producto 2 → merchandising: [producto1_id, producto2_id]
4. Asociar producto 3 → merchandising: [producto1_id, producto2_id, producto3_id]
```

### En el método toEventResponse:

```javascript
merchandising: this.merchandising || []
```

Siempre devuelve un array (vacío si no hay productos, o con los productos si los hay).

## Dónde buscar la lógica

Para entender completamente cómo se asocian los productos, busca en:

1. `booking_client/app/controllers/` - Controladores que manejan merchandising
2. `booking_client/app/routes/` - Rutas relacionadas con productos/merchandising
3. Base de datos - Colección de productos que se vinculan a eventos

## Conclusión

El merchandising NO se genera automáticamente. Funciona como una relación que se establece cuando:
- Se crean productos específicos para ese evento
- Se asocian manualmente esos productos al evento
- Se almacenan las referencias en el array merchandising del evento
