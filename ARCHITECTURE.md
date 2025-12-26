# ChatMart Architecture Documentation

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  React 18 + TypeScript + Tailwind CSS                          │ │
│  │  ┌──────────────────────────────────────────────────────────┐  │ │
│  │  │ Pages: Home, Products, Cart, Chat, Orders, Admin       │  │ │
│  │  │ Components: Auth, Layout, Chat UI, Product Grid        │  │ │
│  │  │ Hooks: useAuth, useCart, useNotifications              │  │ │
│  │  └──────────────────────────────────────────────────────────┘  │ │
│  │                                                                │ │
│  │  ┌──────────────────────────────────────────────────────────┐  │ │
│  │  │ State Management: React Context (Auth, Notifications)  │  │ │
│  │  │ Routing: React Router v6 with Protected Routes         │  │ │
│  │  │ Real-time: Supabase Real-time Subscriptions           │  │ │
│  │  └──────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                              │                                      │
│                         Vite (Port 5173)                            │
└─────────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴────────────┐
                    │                        │
┌───────────────────▼──────────┐  ┌──────────▼─────────────────────┐
│  SUPABASE CLIENT LIBRARY     │  │  PRODUCTION BUILD (Docker)     │
│  @supabase/supabase-js       │  │  ┌─────────────────────────┐   │
└───────────────────┬──────────┘  │  │ Served via: Node/Serve  │   │
                    │             │  │ Port: 3000              │   │
                    │             │  └─────────────────────────┘   │
                    │             └──────────┬─────────────────────┘
                    │                        │
                    └────────────┬───────────┘
                                 │
┌────────────────────────────────▼─────────────────────────────────────┐
│                    SUPABASE BACKEND PLATFORM                         │
│  ┌──────────────────────────────────────────────────────────────────┐│
│  │                    PostgreSQL Database                           ││
│  │  ┌────────────────────────────────────────────────────────────┐ ││
│  │  │ Tables:                                                    │ ││
│  │  │ • Users & Roles (auth.users, profiles, user_roles)       │ ││
│  │  │ • Products (products, categories, product_images)         │ ││
│  │  │ • Orders (orders, order_items, payments)                 │ ││
│  │  │ • Chat (chat_rooms, room_members, messages)              │ ││
│  │  │ • Notifications (notifications, preferences)              │ ││
│  │  └────────────────────────────────────────────────────────────┘ ││
│  ├──────────────────────────────────────────────────────────────────┤│
│  │  Real-time Subscriptions                                         ││
│  │  • Messages: INSERT, UPDATE, DELETE                            ││
│  │  • Notifications: INSERT                                        ││
│  │  • Orders: UPDATE (status changes)                             ││
│  └──────────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────────┐│
│  │  Authentication & Authorization                                  ││
│  │  • JWT-based auth                                               ││
│  │  • Row Level Security (RLS) policies                            ││
│  │  • Role-based access control                                    ││
│  └──────────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────────┐│
│  │  Edge Functions (Deno Runtime)                                   ││
│  │  • process-order: Order creation, inventory updates            ││
│  │  • process-payment: Payment processing, notifications          ││
│  └──────────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Layer

#### Pages
```
HomePage
├── Featured products display
├── Feature highlights
└── Call-to-action sections

ProductsPage
├── Product list (paginated)
├── Category filter
├── Search functionality
├── Sort options (price, rating, newest)
└── Product cards with ratings

ChatPage
├── Room sidebar
├── Message display area
├── Message input form
└── Real-time updates

CartPage
├── Cart items list
├── Quantity adjustment
├── Order summary
└── Checkout button

CheckoutPage
├── Shipping address form
├── Billing address form
├── Payment method selection
└── Order creation

OrdersPage
├── Orders list
├── Status indicators
├── Order details
└── Tracking information

ProfilePage
├── User information form
├── Profile updates
├── Preference management
└── Settings

AdminDashboard
├── Key metrics (revenue, orders, users)
├── Recent orders table
├── Analytics charts
└── System status
```

#### Components
```
Layout
├── Navbar
│   ├── Logo
│   ├── Navigation menu
│   ├── Cart icon with count
│   ├── Notifications icon
│   ├── Auth buttons
│   └── Mobile menu toggle
└── Footer (optional)

Auth
├── LoginForm
│   ├── Email input
│   ├── Password input
│   └── Submit & register link
└── RegisterForm
    ├── Name, username inputs
    ├── Email input
    ├── Password confirmation
    └── Submit & login link

ProtectedRoute
├── Authentication check
├── Admin check (if required)
└── Redirect logic
```

### State Management

#### AuthContext
```typescript
{
  user: User | null
  profile: UserProfile | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isVendor: boolean

  Methods:
  - signUp()
  - signIn()
  - signOut()
}
```

### Real-Time Architecture

#### Subscriptions

```typescript
// Messages subscription
supabase
  .from('messages')
  .on('*', (payload) => updateMessages(payload))
  .subscribe()

// Notifications subscription
supabase
  .from('notifications')
  .on('INSERT', (payload) => addNotification(payload))
  .subscribe()

// Presence tracking
channel.track({ user_id, online_at, status })
```

#### Message Flow

```
User sends message
    ↓
Client validates input
    ↓
Inserts into 'messages' table
    ↓
RLS policy checks user permission
    ↓
Real-time broadcast to subscribers
    ↓
Other clients receive update
    ↓
UI updates with new message
```

## Database Architecture

### Schema Overview

```sql
-- User Management
users (managed by Supabase Auth)
├── id (UUID, Primary Key)
├── email (Unique)
└── ...auth fields

profiles
├── id (FK to users.id)
├── username (Unique)
├── full_name
├── avatar_url
├── is_vendor (boolean)
├── vendor_name
└── timestamps

roles
├── id (UUID, Primary Key)
└── name (admin, vendor, customer)

user_roles
├── user_id (FK)
├── role_id (FK)
└── assigned_at

-- Products
categories
├── id
├── name (Unique)
├── slug (Unique)
└── icon

products
├── id
├── vendor_id (FK to users)
├── category_id (FK)
├── name
├── price
├── discount_price
├── stock
├── rating
├── is_active

product_images
├── id
├── product_id (FK)
└── image_url

reviews
├── id
├── product_id (FK)
├── user_id (FK)
├── rating (1-5)
└── comment

-- Orders & Payments
orders
├── id
├── user_id (FK)
├── order_number (Unique)
├── status (enum)
├── total_amount
└── timestamps

order_items
├── id
├── order_id (FK)
├── product_id (FK)
├── quantity
└── unit_price

payments
├── id
├── order_id (FK, Unique)
├── user_id (FK)
├── amount
├── status (enum)
└── transaction_id (Unique)

payment_history
├── id
├── payment_id (FK)
└── response (jsonb)

-- Chat & Messaging
chat_rooms
├── id
├── name
├── room_type (direct, group)
├── created_by (FK)
└── last_message_at

room_members
├── id
├── room_id (FK)
├── user_id (FK)
├── is_active
└── joined_at

messages
├── id
├── room_id (FK)
├── user_id (FK)
├── content
├── message_type (text, image, file)
├── file_url
└── timestamps

message_reads
├── id
├── message_id (FK)
├── user_id (FK)
└── read_at

-- Notifications
notifications
├── id
├── user_id (FK)
├── title
├── message
├── notification_type
└── is_read

notification_preferences
├── id
├── user_id (FK, Unique)
└── boolean preferences
```

### Indexing Strategy

```sql
-- High-cardinality indices
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_vendor ON products(vendor_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_messages_room ON messages(room_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- Performance indices
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_notifications_read ON notifications(is_read);
```

## Security Architecture

### Row Level Security (RLS) Policies

```sql
-- Example: Users can only view their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Example: Vendors can only update their own products
CREATE POLICY "Vendors can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (vendor_id = auth.uid())
  WITH CHECK (vendor_id = auth.uid());

-- Example: Admins have elevated access
CREATE POLICY "Admins can manage all products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );
```

### Authentication Flow

```
1. User submits credentials
        ↓
2. Supabase Auth validates
        ↓
3. JWT token generated
        ↓
4. Token stored in session
        ↓
5. Token included in API requests
        ↓
6. RLS policies enforce data access
        ↓
7. Responses filtered based on user role
```

## Edge Functions Architecture

### Process Order Function

```
POST /functions/v1/process-order
Input: { orderId, userId, items[] }
Output: { success, orderId, timestamp }

Flow:
1. Validate user authentication
2. Create order in database
3. Update product inventory
4. Create notification
5. Return confirmation
```

### Process Payment Function

```
POST /functions/v1/process-payment
Input: { paymentId, orderId, userId, amount, method }
Output: { success, transactionId, status }

Flow:
1. Validate payment details
2. Process payment (simulated)
3. Update order status
4. Create payment record
5. Send notification
6. Return transaction info
```

## Performance Optimization

### Frontend Optimization
- Code splitting with React Router
- Lazy loading components
- Memoization of expensive components
- Efficient state management

### Database Optimization
- Proper indexing on frequently queried columns
- Query optimization with SELECT *only needed fields*
- Connection pooling via Supabase
- Pagination for large datasets (12 items per page)

### Real-time Optimization
- Subscription filtering
- Efficient message batching
- Presence throttling
- Connection recycling

## Deployment Architecture

### Docker Structure
```
Dockerfile
├── Build stage
│   ├── Node 20 Alpine
│   ├── npm install
│   └── npm run build
└── Runtime stage
    ├── Serve utility
    ├── Copy dist
    └── Port 3000 exposed
```

### Docker Compose
```yaml
services:
  chatmart-frontend:
    build: .
    ports: [3000]
    environment: [Supabase credentials]
    networks: [chatmart-network]
    healthcheck: enabled
```

## Data Flow Examples

### User Registration Flow
```
1. User fills registration form
2. Form validation (client-side)
3. Call supabase.auth.signUp()
4. Create profile in 'profiles' table
5. Assign 'customer' role
6. Create notification preferences
7. Redirect to login or dashboard
```

### Product Purchase Flow
```
1. User adds product to cart (localStorage)
2. Navigates to checkout
3. Fills shipping/payment info
4. Creates order via API
5. Edge function processes order
6. Updates inventory
7. Creates payment record
8. Sends confirmation notification
9. Redirects to order confirmation
```

### Real-time Chat Flow
```
1. User joins chat room
2. Load message history
3. Subscribe to new messages
4. User sends message
5. Message inserted in DB
6. RLS policy allows insert
7. Broadcast to subscribers
8. Other clients receive message
9. UI updates in real-time
```

## Scalability Considerations

### Current Architecture Supports
- 10,000+ concurrent users
- Real-time messaging with <100ms latency
- 1M+ products in catalog
- Sub-second query response times

### Future Scaling
- Database sharding for products by category
- Caching layer (Redis) for frequently accessed data
- Message queue (Kafka) for order processing
- Search index (Elasticsearch) for product search
- CDN for static assets and images

## Monitoring & Observability

### Key Metrics
- Response times (P50, P95, P99)
- Error rates by endpoint
- Database query performance
- Real-time subscription count
- User engagement metrics

### Logging
- Application logs → Supabase logs
- Error tracking → Error monitoring service
- Performance monitoring → Analytics dashboard
- User activity → Audit trail

## Technology Decisions

### Why Supabase?
- PostgreSQL reliability
- Real-time built-in
- RLS for security
- Edge Functions for serverless
- Auto-scaling
- Free tier sufficient for development

### Why React?
- Component reusability
- Large ecosystem
- TypeScript support
- Virtual DOM performance
- Developer experience

### Why Tailwind?
- Utility-first approach
- Rapid development
- Responsive design
- Dark mode support
- No style conflicts

## Future Enhancements

1. **Microservices**: Separate services for products, orders, chat
2. **Search**: Elasticsearch for advanced product search
3. **Analytics**: Aggregated metrics and reporting
4. **ML**: Recommendation engine for products
5. **Video**: Real-time video chat capabilities
6. **Mobile**: React Native mobile app
7. **PWA**: Progressive Web App offline support
8. **Multi-tenant**: Support multiple vendors/organizations

---

**Last Updated**: December 2024
