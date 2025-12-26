# ChatMart - Real-Time Chat + E-Commerce Platform

A production-ready, enterprise-grade application combining real-time instant messaging with a full-featured e-commerce platform. Built with React, TypeScript, Supabase, and modern web technologies.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Real-Time Features](#real-time-features)
- [Security](#security)

## Overview

ChatMart is designed as a portfolio project suitable for senior engineers and demonstrates:

- Enterprise-scale architecture with proper separation of concerns
- Real-time communication using Supabase real-time subscriptions
- Role-based access control (Admin, Vendor, Customer)
- Production-ready security practices including Row Level Security
- Scalable database design with proper indexing
- Modern React patterns with TypeScript
- Cloud-native deployment with Docker

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface (React)                    │
├─────────────────────────────────────────────────────────────┤
│  Auth Context │ Protected Routes │ Real-time Subscriptions │
├─────────────────────────────────────────────────────────────┤
│              Supabase JavaScript Client                      │
├─────────────────────────────────────────────────────────────┤
│                    Supabase Platform                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ PostgreSQL Database │ Real-time │ Auth │ Edge Fn    │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│            Edge Functions (Order, Payment Processing)       │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Authentication**: JWT-based auth with Supabase Auth service
2. **Real-Time Chat**: WebSocket subscriptions via Supabase
3. **E-Commerce**: REST API calls with Row Level Security
4. **Notifications**: Real-time database updates
5. **Business Logic**: Edge Functions for order/payment processing

## Features

### Authentication & Authorization
- Email/password authentication
- Role-based access control (Admin, Vendor, Customer)
- Protected routes and pages
- Session management
- Profile management

### E-Commerce
- Product catalog with categories
- Advanced filtering and search
- Product reviews and ratings
- Shopping cart with persistence
- Order management
- Payment processing
- Order tracking

### Real-Time Chat
- Direct and group chat rooms
- Real-time message updates
- Message read receipts
- Message editing and deletion
- User presence detection
- Chat room management

### Admin Dashboard
- Key metrics and analytics
- Order management
- User management
- System statistics
- Recent activity tracking

### Notifications
- Real-time order updates
- Chat notifications
- System notifications
- Preference management

## Technology Stack

### Frontend
- **React 18**: Modern UI library
- **TypeScript**: Type-safe development
- **React Router 6**: Client-side routing
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **Vite**: Fast build tool

### Backend & Database
- **Supabase**: Complete backend platform
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication
  - Row Level Security (RLS)
  - Edge Functions (Deno runtime)

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Orchestration

## Project Structure

```
chatmart/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── layout/
│   │   │   └── Navbar.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── ChatPage.tsx
│   │   ├── CartPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── OrdersPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── AdminDashboard.tsx
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── supabase.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   ├── migrations/
│   │   ├── 001_create_base_schema.sql
│   │   └── 002_enable_rls_policies.sql
│   └── functions/
│       ├── process-order/
│       │   └── index.ts
│       └── process-payment/
│           └── index.ts
├── public/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Database Schema

### Core Tables

#### Users & Profiles
- `auth.users`: Supabase authentication users
- `profiles`: Extended user information (username, avatar, vendor info)
- `roles`: Role definitions (admin, vendor, customer)
- `user_roles`: Role assignments

#### Products & Catalog
- `categories`: Product categories
- `products`: Product listings with inventory
- `product_images`: Product images with ordering
- `reviews`: Product reviews and ratings

#### Orders & Payments
- `orders`: Customer orders with status tracking
- `order_items`: Individual items in orders
- `payments`: Payment records
- `payment_history`: Payment transaction history

#### Chat & Messaging
- `chat_rooms`: Chat room definitions
- `room_members`: User membership in rooms
- `messages`: Chat messages with metadata
- `message_reads`: Read receipts for messages

#### Notifications
- `notifications`: System and real-time notifications
- `notification_preferences`: User notification settings

### Key Constraints & Indexes

- Foreign keys for referential integrity
- Unique constraints on business identifiers (email, username, SKU)
- Indexes on frequently queried columns (user_id, status, created_at)
- RLS policies for data isolation

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Docker (for containerized deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chatmart
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Initialize database**

   The migrations are automatically applied. Verify by checking Supabase dashboard.

5. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173)

### Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
```

## Deployment

### Docker Deployment

1. **Build Docker image**
   ```bash
   docker build -t chatmart:latest .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access application**
   ```
   http://localhost:3000
   ```

### Environment Variables for Production

```bash
VITE_SUPABASE_URL=your_production_url
VITE_SUPABASE_ANON_KEY=your_production_key
```

### Vercel Deployment

1. Connect repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

```bash
vercel --prod
```

## API Documentation

### Authentication Endpoints

All operations use Supabase Auth. Example:

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

### Products API

```typescript
// Get all active products
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('is_active', true)
  .order('created_at', { ascending: false });

// Get products by category
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('category_id', categoryId);
```

### Orders API

```typescript
// Create order
const { data } = await supabase
  .from('orders')
  .insert({
    user_id: userId,
    order_number: `ORD-${Date.now()}`,
    status: 'pending',
    total_amount: 100,
    shipping_address: 'address'
  })
  .select();

// Get user orders
const { data } = await supabase
  .from('orders')
  .select('*')
  .eq('user_id', userId);
```

### Chat API

```typescript
// Get chat rooms for user
const { data } = await supabase
  .from('room_members')
  .select('room_id')
  .eq('user_id', userId);

// Get messages
const { data } = await supabase
  .from('messages')
  .select('*')
  .eq('room_id', roomId)
  .order('created_at', { ascending: true });
```

## Real-Time Features

### Real-Time Chat

```typescript
const subscription = supabase
  .from('messages')
  .on('*', (payload) => {
    console.log('New message:', payload.new);
  })
  .subscribe();
```

### Real-Time Notifications

```typescript
const subscription = supabase
  .from('notifications')
  .on('INSERT', (payload) => {
    console.log('New notification:', payload.new);
  })
  .subscribe();
```

### Presence Detection

```typescript
const channel = supabase.channel('presence-channel');

channel.subscribe(async (status) => {
  if (status === 'SUBSCRIBED') {
    channel.track({
      user_id: userId,
      online_at: new Date().toISOString(),
    });
  }
});
```

## Security

### Row Level Security (RLS)

All tables have RLS enabled with policies enforcing:
- Users can only access their own data
- Public data is accessible to all
- Vendors can manage only their products
- Admins have elevated permissions

### Authentication

- JWT tokens from Supabase Auth
- Secure session management
- Protected routes with authentication checks

### Data Protection

- All sensitive data encrypted at rest
- HTTPS-only communication
- No secrets in client-side code
- Environment variables for sensitive configuration

### Input Validation

- TypeScript for type safety
- Supabase handles SQL injection prevention
- Client-side validation
- Server-side RLS enforcement

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Performance Optimization

### Frontend
- Code splitting with React Router
- Lazy loading of components
- Image optimization
- Caching strategies

### Database
- Strategic indexing
- Query optimization
- Connection pooling via Supabase
- Real-time subscription efficiency

### Deployment
- CDN caching
- Minification and bundling
- Gzip compression
- Browser caching headers

## Monitoring & Analytics

Track key metrics:
- User engagement
- Order conversion rates
- Chat room activity
- System performance

Use Supabase dashboard for:
- Database monitoring
- API usage statistics
- Real-time logs
- Performance metrics

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
1. Check existing GitHub issues
2. Create detailed issue report
3. Include reproduction steps
4. Provide system information

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced search with Elasticsearch
- [ ] Video chat integration
- [ ] Recommendation engine
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Progressive Web App (PWA)
- [ ] GraphQL API

## Acknowledgments

Built with:
- React 18 documentation
- Supabase guides
- Tailwind CSS resources
- Community contributions

---

**Last Updated**: December 2024
**Version**: 1.0.0
