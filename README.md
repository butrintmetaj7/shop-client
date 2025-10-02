# Shop Client

Frontend SPA for a shopping application built with Vue 3, PrimeVue, and Pinia.

## Tech Stack

- Vue.js 3 (Composition API + TypeScript)
- PrimeVue UI components
- Pinia (state management)
- Vue Router
- Vitest (testing)

## Features

- Product listing with pagination
- Product details page
- Shopping cart with localStorage persistence
- Responsive design


## Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm run test:unit

# Build for production
npm run build
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://127.0.0.1:8000/api/v1
```

If not set, defaults to `http://127.0.0.1:8000/api/v1`

## API Endpoints

The app expects a backend API with:
- `GET /shop/products?page={page}` - Paginated products
- `GET /shop/products/{id}` - Single product details

## Requirements

- Node.js 20+
