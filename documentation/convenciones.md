# Backend Seminario Integrador

## Convenciones para el Manejo de Fechas

### 1. Fecha

- **Tipo de dato en MySQL**: `DATE`
- **Tipo de dato en Node.js**: `string`
- **Formato esperado**: `YYYY-MM-DD`

Cuando trabajemos con fechas que **no incluyen una hora**, como las definidas en la base de datos con el tipo de datos `DATE`, estas deben representarse como **cadenas de texto** (`string`) en el código de Node.js.

#### Ejemplo:

```js
// Convertir Date a string
const dateString = format(date, "yyyy-MM-dd");
```

### 2. Fecha y hora

- **Tipo de dato en MySQL**: `DATETIME`
- **Tipo de dato en Node.js**: `Date`
