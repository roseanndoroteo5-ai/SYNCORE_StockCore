# SYNCORE StockCore

**StockCore: An Inventory Management System for Stock Monitoring, Inventory Tracking, and Stock Transactions**

This combined project keeps the original Laravel backend and React frontend projects, then adds the StockCore interface, API, inventory database tables, and demo accounts.

## Project structure

- `backend/` — Laravel 13 application and StockCore API.
- `frontend/` — React 19 source application.
- `backend/public/stockcore/` — production React build served by Laravel.
- `backend/database/migrations/` — original migrations plus StockCore inventory tables.
- `backend/database/seeders/StockCoreDemoSeeder.php` — demo Admin and Staff accounts and sample products.

The original frontend and backend source files and dependencies from both supplied ZIP archives are retained. New integration files were added; the starter React screen and Laravel welcome route were adapted to StockCore.

## Requirements

- PHP 8.3 or newer
- Composer
- Node.js and npm
- MySQL / MariaDB (the included `.env` is configured for a local Laragon/phpMyAdmin setup)

## Run the integrated application

Open a terminal in `backend/`:

```bash
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Then open **http://127.0.0.1:8000**. Laravel serves the compiled React frontend and the API from the same origin.

If Composer dependencies are not installed on your computer, run `composer install` inside `backend/` first.

## Demo login accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@stockcore.test` | `Admin123!` |
| Staff | `staff@stockcore.test` | `Staff123!` |

Change these demo passwords before using the application with real inventory data.

## Frontend development

Open a second terminal in `frontend/`:

```bash
npm install
npm start
```

The React development server proxies `/api` requests to `http://127.0.0.1:8000`. Start the Laravel server first. To rebuild the frontend for the integrated Laravel app:

```bash
npm run build
```

Then copy the generated `frontend/build/` contents into `backend/public/stockcore/` (replace the previous compiled frontend files).

## Included features

- Admin and Staff login using Laravel-backed credentials and bearer-token authentication
- Responsive SYNCORE StockCore login page and sidebar layout
- Overview dashboard with total products, units, low-stock alerts, and estimated inventory value
- Product listing, search, add, edit, and Admin-only delete
- Stock-in and stock-out transaction recording with quantity validation
- Transaction history and stock analytics
- Responsive desktop and mobile layouts

## API endpoints

All protected endpoints require `Authorization: Bearer <token>`.

- `POST /api/login`
- `GET /api/me`
- `POST /api/logout`
- `GET /api/dashboard`
- `GET /api/products`
- `POST /api/products`
- `PUT /api/products/{id}`
- `DELETE /api/products/{id}`
- `GET /api/transactions`
- `POST /api/transactions`

## Notes

- The React source is in `frontend/src/`; the production build is in `backend/public/stockcore/`.
- The supplied `.env` is configured for MySQL on `127.0.0.1:3306`, username `root`, and a blank password. In phpMyAdmin, create a database named `syncore_stockcore`, then run `php artisan migrate --seed`. If your MySQL credentials differ, update `backend/.env` first.
- The original archive dependencies (`backend/vendor/` and `frontend/node_modules/`) are kept as supplied. If a dependency folder is incompatible with your computer, reinstall dependencies with Composer/npm.
