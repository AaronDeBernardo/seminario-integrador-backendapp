# Backend GitLaw

Este proyecto fue desarrollado con **Node.js**, **Express** y **TypeScript** para la asignatura Seminario Integrador de la **Universidad Tecnológica Nacional – Facultad Regional Rosario**.

Se trata de una API REST que es consumida por un frontend desarrollado en Angular. El sitio web ofrece información para visitantes (potenciales clientes) y cuenta con **tres niveles de acceso**: administradores, abogados y clientes.

👉 **Link al frontend:** [Repositorio Frontend GitLaw](https://github.com/EliasDanteo/seminario-integrador-frontendapp.git)

---

## Accesos y funcionalidades

A continuación se describen brevemente los distintos roles y sus funcionalidades principales. Para información más detallada, se puede consultar la carpeta [`/documentation`](./documentation), donde se encuentran los **casos de uso**, **modelos de datos**, y otros artefactos del proyecto.

### Administradores

Incluye a secretarios y abogados con rol de "admin". Son los usuarios con mayores privilegios. Pueden:

- Realizar operaciones CRUD sobre múltiples entidades.
- Visualizar todos los casos y su información.
- Ver el feedback de los clientes y actividades realizadas.
- Solicitar informes de ingresos y desempeño de los abogados.
- Registrar el cobro de cuotas en el sistema.

### Abogados

Tienen las facultades de:

- Crear y gestionar horarios de turnos.
- Agregar documentos, notas y recordatorios a los casos.
- Registrar actividades realizadas para los clientes.

### Clientes

Tienen acceso limitado. Pueden:

- Consultar el estado de sus casos.
- Solicitar turnos con abogados.
- Solicitar el envío de correos con información más detallada.

### Visitantes

Usuarios no registrados que pueden:

- Leer las noticias publicadas.
- Solicitar turnos.

---

## Requisitos

- **Node.js**: Versión 20.19.1. [Descargar desde nodejs.org](https://nodejs.org/)
- **npm**: Se instala con Node.js. Para actualizarlo:

  ```bash
  npm install -g npm

  ```

- **Base de datos**: MySQL 8.4

## Instalación

1. Clona este repositorio en tu computadora:

```
git clone https://github.com/AaronDeBernardo/seminario-integrador-backendapp.git
```

2. Accede al directorio del proyecto:

```
cd seminario-integrador-backendapp
```

3. Instala las dependencias:

```
npm install
```

## Variables de entorno

Debes crear un archivo .env en la raíz del proyecto con las siguientes variables.

```
PRODUCTION=false

EMAIL=
EMAIL_PASSWORD=

PORT=3000
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:4200

DB_HOST=localhost
DB_USER=user
DB_PASSWORD=password
DB_NAME=sistema_juridico

JWT_SECRET=your_jwt_secret
SESSION_DURATION_HOURS=1
REFRESH_TIME_MINUTES=10
```

Si quieres puedes omitir las variables del email ingresando cualquier string. Sin embargo, el sistema no podrá enviar correos electrónicos cuando se soliciten informes.

## Base de datos

Antes de usar el sistema, debes inicializar la base de datos. Ejecuta los siguientes scripts SQL que se encuentran en el repositorio:

- **Creación de tablas y estructura básica**: [`db-creator`](./documentation/Base%20de%20Datos/db-creator.sql)
- **Carga de datos mínimos**: [`dml-mdcp`](./documentation/Base%20de%20Datos/dml-mdcp.sql)

## Ejecución

Puedes elegir cualquiera de los siguientes modos según tus necesidades. Simplemente ejecuta el comando indicado.

### Modo de desarrollo

```
npm run start:dev
```

El servidor normalmente estará disponible en `http://localhost:3000/` o el puerto que configures en tu archivo de configuración.

### Modo de producción

```
npm run build
```

Esto compilará los archivos de TypeScript. Los archivos generados se encontrarán en el directorio `dist/` listos para ser ejecutados con Node en tu servidor con el comando:

```
node dist/app.js

```

## Autores

- **Borsato, Milton Rubén** - <borsatomilton@gmail.com>
- **Danteo, Elías Tomás** - <elias.danteo.tomas@hotmail.com>
- **De Bernardo, Aarón** - <aarondebernardo@gmail.com>
- **Gramaglia, Francisca** - <franciscagramaglia714@gmail.com>
- **Spini, Santiago** - <santiagospini@gmail.com>
