# Spring Boot Backend Integration Guide

This document outlines how ChatMart could be integrated with a Spring Boot backend as an alternative or complementary architecture to Supabase Edge Functions.

## Architecture with Spring Boot

```
┌─────────────────────────────────────────────────────────────────┐
│                      React Frontend                            │
│              (Node.js development server)                       │
└──────────────────────────────────┬──────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
        ┌───────────▼──────────┐      ┌──────────▼────────────┐
        │   Supabase Auth      │      │  Spring Boot API      │
        │   (JWT tokens)       │      │  (Port 8080)          │
        └──────────────────────┘      └──────────┬────────────┘
                                                 │
                                    ┌────────────┴──────────┐
                                    │                       │
                    ┌───────────────▼──────┐   ┌──────────▼─────┐
                    │   PostgreSQL DB      │   │   Redis Cache  │
                    │   (via Supabase)     │   │   (Caching)    │
                    └──────────────────────┘   └────────────────┘
                                    │
                                    │
                    ┌───────────────▼──────────┐
                    │   Kafka Message Queue   │
                    │   (Event streaming)     │
                    └──────────────────────────┘
```

## Project Structure

```
spring-boot-backend/
├── src/main/java/com/chatmart/
│   ├── ChatMartApplication.java
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   ├── CorsConfig.java
│   │   ├── KafkaConfig.java
│   │   └── CacheConfig.java
│   ├── controller/
│   │   ├── ProductController.java
│   │   ├── OrderController.java
│   │   ├── PaymentController.java
│   │   ├── ChatController.java
│   │   └── NotificationController.java
│   ├── service/
│   │   ├── ProductService.java
│   │   ├── OrderService.java
│   │   ├── PaymentService.java
│   │   ├── ChatService.java
│   │   └── NotificationService.java
│   ├── repository/
│   │   ├── ProductRepository.java
│   │   ├── OrderRepository.java
│   │   ├── PaymentRepository.java
│   │   ├── ChatRoomRepository.java
│   │   └── MessageRepository.java
│   ├── entity/
│   │   ├── Product.java
│   │   ├── Order.java
│   │   ├── Payment.java
│   │   ├── ChatRoom.java
│   │   ├── Message.java
│   │   └── User.java
│   ├── dto/
│   │   ├── ProductDTO.java
│   │   ├── OrderDTO.java
│   │   ├── PaymentDTO.java
│   │   └── ChatMessageDTO.java
│   ├── event/
│   │   ├── OrderCreatedEvent.java
│   │   ├── PaymentProcessedEvent.java
│   │   └── MessageSentEvent.java
│   ├── consumer/
│   │   ├── OrderEventConsumer.java
│   │   └── PaymentEventConsumer.java
│   └── exception/
│       └── GlobalExceptionHandler.java
├── src/main/resources/
│   ├── application.properties
│   ├── application-dev.properties
│   ├── application-prod.properties
│   └── db/migration/ (Flyway migrations)
├── pom.xml
└── Dockerfile
```

## Core Components

### 1. Spring Boot Configuration

#### SecurityConfig.java
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(withDefaults())
            .csrf(csrf -> csrf.disable())
            .authorizeRequests(authz -> authz
                .antMatchers("/api/auth/**").permitAll()
                .antMatchers("/api/products/public/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.decoder(jwtDecoder()))
            );
        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
    }
}
```

#### CorsConfig.java
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:5173", "https://yourdomain.com")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

### 2. Entities

#### Product.java
```java
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String slug;

    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    private BigDecimal discountPrice;

    @Column(nullable = false)
    private Integer stock;

    private Float rating;

    private Integer reviewCount;

    @Column(nullable = false)
    private Boolean isActive;

    @Column(nullable = false)
    private Boolean featured;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne
    @JoinColumn(name = "vendor_id")
    private User vendor;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<ProductImage> images;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<Review> reviews;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

#### Order.java
```java
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true)
    private String orderNumber;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @Column(nullable = false)
    private BigDecimal totalAmount;

    private BigDecimal taxAmount;

    private BigDecimal shippingCost;

    private BigDecimal subtotal;

    @Column(nullable = false)
    private String shippingAddress;

    private String billingAddress;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items;

    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL)
    private Payment payment;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

### 3. Services

#### OrderService.java
```java
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final CacheManager cacheManager;

    @Transactional
    public OrderDTO createOrder(CreateOrderRequest request, UUID userId) {
        Order order = new Order();
        order.setUser(new User(userId));
        order.setOrderNumber("ORD-" + System.currentTimeMillis());
        order.setStatus(OrderStatus.PENDING);
        order.setShippingAddress(request.getShippingAddress());
        order.setBillingAddress(request.getBillingAddress());

        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                .orElseThrow(() -> new ProductNotFoundException());

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setUnitPrice(product.getPrice());
            orderItem.setSubtotal(product.getPrice()
                .multiply(BigDecimal.valueOf(itemRequest.getQuantity())));

            orderItem.setOrder(order);
            order.getItems().add(orderItem);

            subtotal = subtotal.add(orderItem.getSubtotal());

            product.setStock(product.getStock() - itemRequest.getQuantity());
            productRepository.save(product);
        }

        BigDecimal tax = subtotal.multiply(BigDecimal.valueOf(0.1));
        BigDecimal shipping = subtotal.compareTo(BigDecimal.valueOf(100)) > 0
            ? BigDecimal.ZERO
            : BigDecimal.TEN;

        order.setSubtotal(subtotal);
        order.setTaxAmount(tax);
        order.setShippingCost(shipping);
        order.setTotalAmount(subtotal.add(tax).add(shipping));

        Order savedOrder = orderRepository.save(order);

        kafkaTemplate.send("order-events", new OrderCreatedEvent(
            savedOrder.getId(),
            savedOrder.getUser().getId(),
            savedOrder.getOrderNumber(),
            savedOrder.getTotalAmount()
        ));

        clearOrderCache();

        return orderMapper.toDTO(savedOrder);
    }

    @Cacheable(value = "orders", key = "#userId")
    public List<OrderDTO> getUserOrders(UUID userId) {
        return orderRepository.findByUser_Id(userId).stream()
            .map(orderMapper::toDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public void updateOrderStatus(UUID orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException());

        order.setStatus(status);
        orderRepository.save(order);
        clearOrderCache();
    }

    private void clearOrderCache() {
        Cache cache = cacheManager.getCache("orders");
        if (cache != null) cache.clear();
    }
}
```

#### PaymentService.java
```java
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final PaymentGateway paymentGateway;

    @Transactional
    public PaymentDTO processPayment(PaymentRequest request, UUID userId) {
        Order order = orderRepository.findById(request.getOrderId())
            .orElseThrow(() -> new OrderNotFoundException());

        if (!order.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Cannot pay for another user's order");
        }

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setUser(new User(userId));
        payment.setAmount(order.getTotalAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setStatus(PaymentStatus.PROCESSING);

        Payment savedPayment = paymentRepository.save(payment);

        try {
            PaymentResponse gatewayResponse = paymentGateway.process(request);

            savedPayment.setStatus(PaymentStatus.SUCCESS);
            savedPayment.setTransactionId(gatewayResponse.getTransactionId());
            savedPayment.setGatewayResponse(gatewayResponse.getResponseJson());

            order.setStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);

            kafkaTemplate.send("payment-events", new PaymentProcessedEvent(
                savedPayment.getId(),
                order.getId(),
                userId,
                PaymentStatus.SUCCESS
            ));

        } catch (PaymentException e) {
            savedPayment.setStatus(PaymentStatus.FAILED);
            kafkaTemplate.send("payment-events", new PaymentProcessedEvent(
                savedPayment.getId(),
                order.getId(),
                userId,
                PaymentStatus.FAILED
            ));
        }

        paymentRepository.save(savedPayment);
        return paymentMapper.toDTO(savedPayment);
    }
}
```

### 4. Controllers

#### OrderController.java
```java
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDTO> createOrder(
            @RequestBody CreateOrderRequest request,
            @AuthenticationPrincipal JWT jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        OrderDTO order = orderService.createOrder(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<OrderDTO>> getUserOrders(
            @AuthenticationPrincipal JWT jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(orderService.getUserOrders(userId));
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDTO> getOrder(
            @PathVariable UUID orderId,
            @AuthenticationPrincipal JWT jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(orderService.getOrder(orderId, userId));
    }

    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable UUID orderId,
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, status));
    }
}
```

### 5. Event-Driven Architecture with Kafka

#### OrderEventConsumer.java
```java
@Component
@RequiredArgsConstructor
public class OrderEventConsumer {

    private final OrderService orderService;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @KafkaListener(topics = "order-events", groupId = "order-group")
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("Processing order created event: {}", event.getOrderId());

        notificationService.createNotification(
            event.getUserId(),
            "Order Created",
            "Your order " + event.getOrderNumber() + " has been created",
            NotificationType.ORDER,
            event.getOrderId()
        );

        emailService.sendOrderConfirmation(
            event.getUserId(),
            event.getOrderNumber(),
            event.getTotalAmount()
        );
    }

    @KafkaListener(topics = "order-status-changed", groupId = "order-group")
    public void handleOrderStatusChanged(OrderStatusChangedEvent event) {
        log.info("Processing order status change: {} -> {}",
            event.getOrderId(), event.getNewStatus());

        String message = "Your order status has been updated to: "
            + event.getNewStatus();

        notificationService.createNotification(
            event.getUserId(),
            "Order Status Updated",
            message,
            NotificationType.ORDER,
            event.getOrderId()
        );
    }
}
```

### 6. REST API Endpoints

#### Products
```
GET    /api/products              - List products (public)
GET    /api/products/{id}         - Get product details
GET    /api/products/category/{categoryId} - Products by category
POST   /api/products              - Create product (VENDOR)
PUT    /api/products/{id}         - Update product (VENDOR)
DELETE /api/products/{id}         - Delete product (VENDOR)
```

#### Orders
```
POST   /api/orders                - Create order
GET    /api/orders                - Get user orders
GET    /api/orders/{id}           - Get order details
PUT    /api/orders/{id}/status    - Update order status (ADMIN)
GET    /api/orders/{id}/items     - Get order items
```

#### Payments
```
POST   /api/payments              - Process payment
GET    /api/payments/{id}         - Get payment details
GET    /api/payments/{id}/history - Payment history
```

#### Chat
```
POST   /api/chat/rooms            - Create chat room
GET    /api/chat/rooms            - Get user's rooms
POST   /api/chat/rooms/{id}/messages - Send message
GET    /api/chat/rooms/{id}/messages - Get messages
```

## Integration with React Frontend

### API Service Layer

```typescript
// services/api.ts
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const orderApi = {
  create: (data) => axios.post(`${API_BASE}/orders`, data),
  getAll: () => axios.get(`${API_BASE}/orders`),
  getById: (id) => axios.get(`${API_BASE}/orders/${id}`),
  updateStatus: (id, status) =>
    axios.put(`${API_BASE}/orders/${id}/status`, null, { params: { status } })
};

export const productApi = {
  getAll: (params) => axios.get(`${API_BASE}/products`, { params }),
  getById: (id) => axios.get(`${API_BASE}/products/${id}`),
  search: (query) => axios.get(`${API_BASE}/products/search`, { params: { q: query } })
};

export const paymentApi = {
  process: (data) => axios.post(`${API_BASE}/payments`, data)
};
```

## Docker Deployment

### Dockerfile
```dockerfile
FROM maven:3.8-openjdk-17 AS builder

WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

FROM openjdk:17-slim

WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  spring-boot-api:
    build: ./spring-boot-backend
    ports:
      - "8080:8080"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/chatmart
      - SPRING_DATASOURCE_USERNAME=postgres
      - SPRING_DATASOURCE_PASSWORD=password
      - SPRING_JPA_HIBERNATE_DDL_AUTO=validate
      - KAFKA_BOOTSTRAP_SERVERS=kafka:9092
    depends_on:
      - postgres
      - kafka
    networks:
      - chatmart-network

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=chatmart
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - chatmart-network

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    environment:
      - KAFKA_BROKER_ID=1
      - KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181
      - KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092
    depends_on:
      - zookeeper
    networks:
      - chatmart-network

  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    environment:
      - ZOOKEEPER_CLIENT_PORT=2181
    networks:
      - chatmart-network

volumes:
  postgres-data:

networks:
  chatmart-network:
    driver: bridge
```

## Testing Strategy

```java
@SpringBootTest
@AutoConfigureMockMvc
public class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderService orderService;

    @Test
    public void testCreateOrder() throws Exception {
        CreateOrderRequest request = new CreateOrderRequest();
        // ... set request data

        mockMvc.perform(post("/api/orders")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request))
            .header("Authorization", "Bearer " + jwtToken))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.orderNumber").exists());
    }
}
```

## Hybrid Architecture Approach

The React application can work with both:

1. **Pure Supabase**: Current setup
2. **Spring Boot Backend**: Replace Supabase endpoints with Spring Boot API
3. **Hybrid**: Use Supabase for real-time/auth, Spring Boot for business logic

### Environment-based Configuration

```typescript
const API_PROVIDER = process.env.REACT_APP_API_PROVIDER || 'supabase';

export const getApiClient = () => {
  if (API_PROVIDER === 'spring-boot') {
    return new SpringBootApiClient();
  }
  return new SupabaseApiClient();
};
```

---

**Last Updated**: December 2024
