# Velvet – Backend de tienda de ropa en AWS

API REST de **Velvet**, una tienda de ropa en línea. Está hecha con NestJS, Drizzle ORM y PostgreSQL, y preparada para desplegarse en AWS con Amazon RDS y Amazon Personalize.

Frontend: [Proyectoaws-frontend](https://github.com/luisv15-jpg/Proyectoaws-frontend)

## Funcionalidades

- **Autenticación:** registro, login con JWT y refresh token, roles `admin` y `user`, cambio de contraseña y recuperación por correo.
- **Productos:** catálogo con categorías, tallas, colores, precio de oferta, stock y borrado lógico (papelera).
- **Carrito y pedidos:** carrito por usuario, creación de pedidos, estados (`pending` → `delivered`) y métodos de pago tarjeta, Yape, Plin y transferencia.
- **Usuarios:** perfil con medidas corporales, gestión de roles y restauración de usuarios eliminados.
- **Dashboard:** ventas por mes y por día, productos más vendidos, distribución por categoría y por estado de pedido.
- **Recomendaciones con IA:** productos recomendados y similares con Amazon Personalize. Si el servicio no devuelve resultados, recomienda los más vendidos.
- **Documentación:** Swagger disponible en `/docs`.

## Stack

| Parte | Herramientas |
|---|---|
| Framework | NestJS 10, TypeScript |
| Base de datos | PostgreSQL con Drizzle ORM. En producción se conecta a Amazon RDS con autenticación IAM |
| IA | Amazon Personalize |
| Seguridad | Passport JWT, bcrypt, validación con class-validator |
| Otros | Nodemailer, Swagger, Docker |

## Instalación

Necesitas Node.js 20, pnpm y una base de datos PostgreSQL.

```bash
git clone https://github.com/luisv15-jpg/Proyectoaws-backend.git
cd Proyectoaws-backend
pnpm install
cp .env.example .env     # completa los valores
pnpm drizzle-kit migrate # crea las tablas
pnpm start:dev
```

La API queda en `http://localhost:3002` y la documentación en `http://localhost:3002/docs`.

### Con Docker

```bash
docker build -t velvet-backend .
docker run -p 3002:3002 --env-file .env velvet-backend
```

## Variables de entorno

Revisa `.env.example`. Las principales son:

| Variable | Uso |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` | Conexión de la API a PostgreSQL |
| `DB_USER`, `DB_NAME` | Conexión de drizzle-kit para las migraciones |
| `JWT_SECRET` | Firma de los tokens |
| `FRONTEND_URL` | Origen permitido por CORS |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | Envío de correos de recuperación |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | Acceso a AWS |
| `PERSONALIZE_CAMPAIGN_ARN`, `PERSONALIZE_TRACKING_ID` | Recomendaciones con Amazon Personalize |

## Estructura

```
src/
  auth/        login, registro, JWT, roles y recuperación de contraseña
  users/       perfil, medidas y administración de usuarios
  products/    catálogo y papelera
  cart/        carrito de compras
  orders/      pedidos y estados
  dashboard/   métricas para el panel de administración
  ai/          recomendaciones con Amazon Personalize
  mail/        envío de correos
  drizzle/     conexión y esquema de la base de datos
  health/      endpoint de salud para el despliegue
```

## Autor

Luis Abel Vasquez Medina
