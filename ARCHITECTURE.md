# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                           │
│                    (Next.js 14 App Router)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Home    │  │  Cart    │  │ Checkout │  │  Admin   │       │
│  │  Page    │  │  Page    │  │   Page   │  │  Panel   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      State Management                            │
│                        (Zustand)                                 │
│  ┌─────────────────┐         ┌─────────────────┐               │
│  │   Auth Store    │         │   Cart Store    │               │
│  │  (User State)   │         │  (Cart Items)   │               │
│  └─────────────────┘         └─────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      Firebase Services                           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │     Auth     │ │  Firestore   │ │   Storage    │           │
│  │  (Phone SMS) │ │  (Database)  │ │   (Images)   │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
│                                                                  │
│  ┌────────────────────────────────────────────────┐            │
│  │         Cloud Functions (Serverless)            │            │
│  │  ┌──────────────────────────────────────────┐  │            │
│  │  │  sendOrderNotification()                  │  │            │
│  │  │  - Triggered on new order                 │  │            │
│  │  │  - Sends email to admin                   │  │            │
│  │  └──────────────────────────────────────────┘  │            │
│  │  ┌──────────────────────────────────────────┐  │            │
│  │  │  sendOrderStatusUpdate()                  │  │            │
│  │  │  - Triggered on status change             │  │            │
│  │  │  - Sends email to customer                │  │            │
│  │  └──────────────────────────────────────────┘  │            │
│  └────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
│  ┌──────────────┐         ┌──────────────┐                     │
│  │ Email SMTP   │         │  SMS Gateway │                     │
│  │  (Nodemailer)│         │  (Firebase)  │                     │
│  └──────────────┘         └──────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Registration Flow

```
User enters phone + PIN
        ↓
Firebase Auth sends SMS
        ↓
User enters verification code
        ↓
Firebase verifies code
        ↓
Create user document in Firestore
  - phoneNumber
  - pin (should be hashed!)
  - role: 'customer'
  - createdAt
        ↓
User authenticated
```

### 2. Shopping & Checkout Flow

```
Browse Products (Firestore query)
        ↓
Add to Cart (Zustand store - localStorage)
        ↓
Proceed to Checkout
        ↓
Enter Delivery Address
        ↓
Display QR Payment Code
        ↓
User pays & clicks "I have paid"
        ↓
Create Order Document:
  - userId
  - items[]
  - totalAmount
  - status: 'payment_pending'
  - deliveryAddress
        ↓
Firebase Trigger: onCreate('orders/{id}')
        ↓
Cloud Function: sendOrderNotification()
        ↓
Admin receives email
        ↓
Admin verifies payment in Admin Panel
        ↓
Update order status: 'payment_verified'
        ↓
Continue production pipeline...
```

### 3. Order Status Pipeline

```
payment_pending
        ↓
payment_verified (Admin confirms)
        ↓
in_production (Admin marks)
        ↓
out_for_delivery (Admin marks)
        ↓
delivered (Admin marks)
```

## Database Schema

### Collections

#### users
```typescript
{
  id: string (document ID = Firebase Auth UID)
  phoneNumber: string
  pin: string // ⚠️ Should be hashed in production!
  displayName?: string
  email?: string
  role: 'customer' | 'admin'
  address?: {
    province: string
    district: string
    khoroo: string
    detailedAddress: string
  }
  createdAt: Timestamp
}
```

#### products
```typescript
{
  id: string (auto-generated)
  name: {
    en: string
    mn: string
  }
  description: {
    en: string
    mn: string
  }
  price: number (in MNT)
  category: string
  images: string[] (Firebase Storage URLs)
  inStock: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### orders
```typescript
{
  id: string (auto-generated)
  userId: string (reference to users)
  items: [
    {
      productId: string
      product: Product (denormalized)
      quantity: number
    }
  ]
  totalAmount: number
  status: 'pending' | 'payment_pending' | 'payment_verified' | 
          'in_production' | 'out_for_delivery' | 'delivered' | 'cancelled'
  deliveryAddress: {
    province: string
    district: string
    khoroo: string
    detailedAddress: string
  }
  paymentProof?: string (optional image URL)
  createdAt: Timestamp
  updatedAt: Timestamp
  notes?: string
}
```

## Security Rules Summary

### Firestore Rules

```javascript
// Users: Can read own, admin can manage all
users/{userId}
  - read: authenticated
  - create: authenticated && owner
  - update: owner
  - delete: admin

// Products: Public read, admin write
products/{productId}
  - read: all
  - write: admin only

// Orders: Owner can read, admin can manage
orders/{orderId}
  - read: admin || owner
  - create: authenticated && owner
  - update: admin only
  - delete: admin only
```

### Storage Rules

```javascript
// Product images: Public read, admin write
/products/{imageId}
  - read: all
  - write: admin

// User uploads: Authenticated read/write
/uploads/{userId}/{fileName}
  - read: authenticated
  - write: owner
```

## API Routes

### Next.js API Routes

- `POST /api/send-order-notification`
  - Called from checkout after order creation
  - Forwards notification to Cloud Function
  - Returns success/error status

## State Management

### Auth Store (Zustand)
```typescript
interface AuthState {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  isAdmin: () => boolean
}
```

### Cart Store (Zustand + localStorage)
```typescript
interface CartState {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalAmount: () => number
  getItemCount: () => number
}
```

## Internationalization

### Structure
```
messages/
  ├── en.json (English translations)
  └── mn.json (Mongolian translations)

Routes: /{locale}/path
  - /en/products
  - /mn/products
```

### Implementation
- next-intl for translations
- Middleware intercepts routes
- Language switcher in header
- All content supports both languages

## Performance Optimizations

1. **Image Optimization**: Next.js Image component with Firebase Storage
2. **Code Splitting**: Automatic with Next.js App Router
3. **State Persistence**: Cart stored in localStorage
4. **Lazy Loading**: Framer Motion animations on scroll
5. **Caching**: Firebase Firestore automatic caching

## Scalability Considerations

### Current Limits (Firebase Spark Plan)
- **Firestore**: 50K reads, 20K writes/day
- **Storage**: 1GB storage, 10GB/month transfer
- **Functions**: 125K invocations/month
- **Phone Auth**: 10K/month

### When to Scale
- **Upgrade to Blaze Plan** when:
  - > 50 orders/day (Firestore limits)
  - > 300 phone registrations/month
  - Need longer Cloud Function execution
  
### Optimization Strategies
1. Implement pagination for product lists
2. Use Firestore query cursors for large datasets
3. Cache frequently accessed data
4. Implement image CDN (Firebase already provides this)
5. Add database indexes (defined in firestore.indexes.json)

## Deployment Architecture

```
GitHub Repository
        ↓
Vercel (Auto-deploy on push)
  - Builds Next.js app
  - Serves static/dynamic content
  - Edge network distribution
        ↓
Firebase Hosting (Optional)
  - Can host static assets
  - CDN distribution
        ↓
Firebase Services
  - Auth
  - Firestore
  - Storage
  - Cloud Functions
```

## Monitoring & Logging

### Vercel
- Deployment logs
- Function logs
- Analytics (optional)

### Firebase
- Authentication logs
- Firestore usage metrics
- Cloud Function logs
- Performance monitoring

### Recommended Tools
- Sentry (error tracking)
- LogRocket (session replay)
- Google Analytics 4

## Future Architecture Improvements

1. **Caching Layer**: Redis for session management
2. **Search**: Algolia or MeiliSearch for product search
3. **Queue System**: Bull Queue for order processing
4. **Payment Gateway**: QPay, SocialPay integration
5. **Real-time Updates**: WebSocket for order status
6. **Microservices**: Separate payment service
7. **CDN**: Cloudflare for static assets
8. **Database**: Consider PostgreSQL for complex queries

---

## Technology Decisions

### Why Firebase?
- ✅ Quick setup & deployment
- ✅ Built-in authentication (Phone SMS)
- ✅ Real-time database
- ✅ Generous free tier
- ✅ Automatic scaling
- ✅ Managed infrastructure

### Why Next.js?
- ✅ Server-side rendering (SEO)
- ✅ API routes (backend logic)
- ✅ Image optimization
- ✅ Automatic code splitting
- ✅ Built-in internationalization support
- ✅ Excellent Vercel integration

### Why Zustand?
- ✅ Simple API
- ✅ No boilerplate
- ✅ TypeScript support
- ✅ Lightweight (1KB)
- ✅ Middleware support (persistence)

---

For implementation details, see README.md and DEPLOYMENT.md
