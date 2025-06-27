# 🚀 Grapthway

<div align="center">

![Grapthway Logo](https://img.shields.io/badge/Grapthway-GraphQL%20Gateway-blue?style=for-the-badge&logo=graphql)

**The Future of Microservices Orchestration**

*A declarative GraphQL gateway that transforms how you compose, orchestrate, and observe distributed systems*

[![Docker Pulls](https://img.shields.io/docker/pulls/farisbahdlor/grapthway?style=flat-square)](https://hub.docker.com/r/farisbahdlor/grapthway)
[![GitHub Stars](https://img.shields.io/github/stars/farisbahdlor/Grapthway?style=flat-square)](https://github.com/Grapthway)
[![License](https://img.shields.io/github/license/Grapthway?style=flat-square)](LICENSE)

[🎯 Quick Start](#-quick-start) • [✨ New Features](#-smart-deployments-version-aware-registration) • [🏗️ Examples](#-advanced-examples) • [⚡ Performance](#-performance-optimization-report) • [🤝 Contributing](#-contributing)

</div>

---

## 🆕 Current Version: v1.5

**Latest Update**: This version introduces a sophisticated, version-aware registration engine alongside significant performance enhancements.

* **Intelligent Blue-Green Deployments**: The gateway now automatically detects configuration changes (in schemas, pipelines, or stitching) to perform zero-downtime blue-green swaps.
* **Atomic Configuration Swaps**: Service updates are now fully atomic, ensuring the gateway's state is always consistent.
* **Global Utility Services**: Pre-pipelines can now call shared services (like authentication) from any subgraph, making them globally accessible.
* **Enhanced Performance**: Optimized JSON processing, lock-free schema reloading, and improved GraphQL query handling. See the [Performance Report](#-performance-optimization-report) for details.

---

## ✨ What is Grapthway?

Grapthway is not just another GraphQL gateway—it's a **next-generation orchestration platform** that brings order to microservices chaos. Built for the cloud-native era, it provides:

```mermaid
graph TB
    Client[👤 Client] --> Gateway{🌟 Grapthway}
    Gateway --> Auth[🔐 Auth Service]
    Gateway --> Users[👥 User Service] 
    Gateway --> Orders[📦 Order Service]
    Gateway --> Payment[💳 Payment Service]
    
    Gateway --> Dashboard[📊 Live Dashboard]
    Gateway --> Logs[📝 Real-time Logs]
    
    style Gateway fill:#3b82f6,stroke:#1e40af,stroke-width:3px,color:#fff
    style Dashboard fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff
    style Logs fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px,color:#fff
```

### 🎭 **Declarative Pipelines**
Transform complex workflows into simple JSON configurations. No more gateway spaghetti code.

### 🧬 **Dynamic Schema Stitching**  
Services come and go—your schema adapts in real-time. Zero-downtime deployments, maximum flexibility.

### 🔬 **Deep Observability**
Live dashboard, WebSocket log streaming, and categorized insights that make debugging a breeze.

### ⚡ **Enterprise Ready**
From development laptops to production clusters—scale with confidence using Redis persistence and HA deployment.

---

## 🌟 Key Features

<table>
<tr>
<td width="50%">

### 🔥 **Core Capabilities**
- **Unified GraphQL API** across all microservices
- **Version-Aware Service Registration**
- **Global (Cross-Subgraph) Pipelines**
- **Cross-service data composition** without tight coupling  
- **Transactional workflows** spanning multiple services
- **Automatic service discovery** and health monitoring
- **Load balancing** with round-robin distribution
- **Context propagation** via X-Ctx-* headers

</td>
<td width="50%">

### 🛡️ **Production Features**
- **Automatic Blue-Green Deployment Orchestration**
- **Redis persistence** for enterprise deployments
- **Real-time admin dashboard** with live metrics
- **WebSocket log streaming** for instant debugging
- **Automatic cleanup** of stale services (60s timeout)
- **Error handling & rollback** for distributed transactions
- **GraphQL subscriptions** over WebSockets

</td>
</tr>
</table>

---

## 🎯 Quick Start

### 🐳 Run with Docker

Choose your edition and get started in seconds:

```bash
# 🆓 Community Edition (Perfect for development)
docker run -d -p 5000:5000 --name my-community-gateway farisbahdlor/grapthway:community-v1.5
```

### 🔑 Get Your Tokens

```bash
curl http://localhost:5000/start
```

> 💡 **Pro Tip**: Store your admin tokens securely—you'll need them for service registration and dashboard access.

### 🎪 Register Your First Service

Announce your service to the gateway. The gateway is smart enough to handle the rest.

```javascript
// In your microservice
async function registerWithGateway() {
  const response = await fetch(`http://gateway:5000/health?token=${ADMIN_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service: 'user-service',
      url: 'http://user-service:4000/graphql',
      subgraph: 'auth', // Define which subgraph this service belongs to
      schema: `
        type User { id: ID!, email: String!, name: String! }
        type Query { me: User }
      `,
      middlewareMap: { /* Pipeline definitions */ },
      stitchingConfig: { /* Schema extensions */ }
    })
  });
}

// Keep your service alive by re-announcing periodically
setInterval(registerWithGateway, 20000);
```

---

## ✨ Smart Deployments: Version-Aware Registration

Grapthway eliminates manual deployment orchestration by intelligently detecting version changes to perform zero-downtime Blue-Green deployments.

When a service instance announces its health, the gateway compares its full configuration (Schema, Pipelines, and Stitching) to the currently active version.

#### Real-World Example: Deploying a Breaking Change

Imagine your `store-product-service` **v1 (Blue)** is live. Its `createProduct` mutation takes `name` and `price` as separate arguments.

1. **You Deploy v2 (Green):** You refactor the service and change the `createProduct` mutation to accept a single `ProductInput` object. This is a breaking schema change. You deploy this new container.
2. **"Green" Service Registers:** The new `v2` service starts and announces itself to the gateway's `/health` endpoint, sending its new schema.
3. **Gateway Detects the Change:** The gateway's `UpdateServiceRegistration` function compares the incoming schema from `v2` with the stored schema from `v1` and sees they are different.
4. **The Swap is Triggered:** Recognizing a new version, the gateway performs a Blue-Green Swap:
   * It instantly **wipes its list of "blue" (v1) instances**.
   * It creates a new active set of instances containing only the new "green" (v2) service.
   * It **atomically replaces** the stored schema, pipelines, and stitching rules with the new ones from `v2`.
5. **Result:** The cutover is instant. All new GraphQL requests are now routed exclusively to `store-product-service-v2` and validated against its new schema.

If a subsequent instance of `v2` registers with the *same* configuration, the gateway recognizes it as a **Scale-Up Event** and simply adds it to the load-balancing pool for the active "green" version.

---

## 🏗️ Advanced Examples

### 🛒 E-commerce Checkout Pipeline (Atomic Swaps & Global Services in Action)

This example demonstrates how Grapthway handles complex workflows that touch multiple services, all managed as a single, atomic configuration.

```javascript
// This entire configuration is sent by your store-product-service
const MIDDLEWARE_MAP = {
  // This pipeline runs for the 'payCart' mutation.
  "payCart": {
    // 'pre' steps run before the main resolver.
    "pre": [
      {
        // 1. Call the Global 'auth-service' for Authentication.
        //    Even if this request is for the "store" subgraph, the gateway
        //    finds 'auth-service' in any subgraph.
        "service": "auth-service",
        "field": "getUserData",
        "passHeaders": ["Authorization"],
        "selection": ["user { id }"],
        // 2. The result is saved to the request context as `user`.
        "assign": { "user": "user" }
      },
      {
        // 3. Next, call the cart service.
        "service": "cart-service",
        "field": "getCartItems",
        //    The gateway automatically adds the `X-Ctx-User` header from the previous step.
        "passHeaders": ["Authorization"],
        "selection": ["id", "storeId"],
        // 4. The result is saved to the context as `cartItems`.
        "assign": { "cartItems": "" },
        "onError": {
          "rollback": [{ "service": "inventory-service", "field": "releaseItems" }]
        }
      }
    ],
    // 'post' steps run *after* the main resolver to enrich the response.
    "post": [
      {
        "service": "balance-service",
        "field": "getUserBalance",
        // 5. Map the `userId` from the main resolver's output to this enrichment query's arguments.
        "argsMapping": { "userId": "userId" }, 
        "selection": ["amount", "updatedAt"],
        // 6. The result is merged into the final response as `finalBalance`.
        "assign": { "finalBalance": "" } 
      }
    ]
  }
}
```

This entire `MIDDLEWARE_MAP` is treated as a single, **atomic unit**. When you deploy a new version of `store-product-service` with changes to this map, the gateway swaps the entire configuration at once, ensuring perfect consistency.

### 🔗 Dynamic Schema Stitching

Extend types across service boundaries seamlessly:

```javascript
// In your order-service, extend the User type from auth-service.
const stitchingConfig = {
  "User": { // Target type to extend
    "orderHistory": { // New field to add to the User type
      "service": "order-service",
      "resolverField": "getOrdersByUserId",
      // Map the User's `id` to the `userId` argument of the resolver.
      "argsMapping": { "userId": "id" } 
    }
  }
};
```

---

## ⚡ Performance Optimization Report

We've implemented key optimizations that deliver measurable performance gains while fixing critical GraphQL handling issues.

### 📊 Load Test Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Requests/sec** | 13.97 RPS | 14.41 RPS | **+3.1%** ⬆️ |
| **P95 Latency** | 257.23 ms | 239.72 ms | **-17.51 ms** ⬇️ |
| **Error Rate** | 0.0% | 0.0% | Maintained |

> **Test Environment**: 5 Virtual Users over 2m 20s duration

### 🔧 Key Optimizations

#### 1. High-Performance JSON Processing
- **Change**: Replaced `encoding/json` with `json-iterator/go`
- **Impact**: Faster JSON operations across all API requests, logging, and downstream communication

#### 2. Lock-Free Schema Reloading
- **Change**: Implemented atomic schema updates using `sync/atomic.Value`
- **Impact**: Zero-downtime schema reloads with no request blocking
- **Before**: `sync.RWMutex` caused lock contention
- **After**: Non-blocking background schema builds with atomic swaps

#### 3. GraphQL Query Optimization
- **Fixed**: Scalar return type handling (removed unnecessary `__typename` injection)
- **Fixed**: Input object formatting (proper GraphQL syntax instead of JSON strings)
- **Impact**: Cleaner query generation and improved downstream service compatibility

**Examples of Fixed Queries:**

*Before (Broken):*
```javascript
# Scalar queries incorrectly added __typename
logout(token: "abc123") { __typename }  # ❌ Invalid for String return

# Input objects formatted as JSON strings
editUser(input: "{\"name\":\"faris\",\"age\":25}")  # ❌ Invalid syntax
```

*After (Fixed):*
```javascript
# Scalar queries return clean values
logout(token: "abc123")  # ✅ Proper scalar handling

# Input objects use proper GraphQL syntax
editUser(input: {name: "faris", age: 25})  # ✅ Correct formatting
```

### 🎯 Technical Benefits

- **6.8% latency reduction** - Faster response times for end users
- **Zero downtime** schema updates - No service interruption during configuration changes
- **100% compatibility** - Drop-in JSON replacement maintains existing functionality
- **Memory efficiency** - Reduced lock contention and reflection overhead

### 🔍 Implementation Details

The optimizations focus on eliminating performance bottlenecks:

```go
// Lock-free schema reloading
func (m *Merger) ReloadSchema() {
    // Build new schemas in background
    newSchema := buildSchema()
    // Atomic swap - zero blocking
    m.schemaValue.Store(newSchema)
}

// Optimized input formatting
func formatValue(value interface{}) string {
    // Converts {"name":"faris"} → {name: "faris"}
    // Handles nested objects recursively
}
```

*These optimizations maintain backward compatibility while delivering measurable performance improvements. No changes required to existing resolvers or schemas.*

---

## 📊 Built-in Observability

### 📈 **Real-time Dashboard**
- Live service status and health metrics
- Pipeline execution monitoring
- Interactive schema explorer
- WebSocket log streaming

### 📝 **Comprehensive Logging**
- **Gateway Logs**: Request/response cycles with pipeline traces
- **Admin Logs**: Service registrations and configuration changes  
- **Schema Logs**: Complete audit trail of schema evolution

### 🔍 **Diagnostic Endpoints**
| Endpoint | Purpose |
|----------|---------|
| `/service` | List all registered services and instances |
| `/schema` | View raw SDL schemas |
| `/gateway-status` | Detailed gateway metrics |
| `/get-pipelines` | Active pipeline configurations |

---

## 🏢 Edition Comparison

<table>
<thead>
<tr>
<th width="40%">Feature</th>
<th width="30%">🆓 Community</th>
<th width="30%">🏢 Enterprise</th>
</tr>
</thead>
<tbody>
<tr><td><strong>Storage</strong></td><td>In-memory</td><td>Redis persistence</td></tr>
<tr><td><strong>Services per subgraph</strong></td><td>Up to 3</td><td>Unlimited</td></tr>
<tr><td><strong>Max subgraphs</strong></td><td>2</td><td>Unlimited</td></tr>
<tr><td><strong>Log retention</strong></td><td>2 days</td><td>Configurable</td></tr>
<tr><td><strong>Support</strong></td><td>Community</td><td>Priority + SLA</td></tr>
<tr><td><strong>High availability</strong></td><td>❌</td><td>✅</td></tr>
<tr><td><strong>Custom extensions</strong></td><td>❌</td><td>✅</td></tr>
</tbody>
</table>

---

## 🔧 Architecture Deep Dive

```mermaid
sequenceDiagram
    participant C as Client
    participant G as Gateway
    participant M as Middleware
    participant S as Services
    participant D as Dashboard

    C->>G: GraphQL Request
    G->>M: Execute Pre-Pipeline
    M->>S: Route to Service(s)
    S-->>M: Service Response
    M->>G: Execute Post-Pipeline  
    G-->>C: Final Response
    G->>D: Stream Logs
```

### 🔄 **Request Lifecycle**
1. **Pre-processing**: Authentication, validation, context injection
2. **Service routing**: Intelligent load balancing across instances
3. **Response handling**: Data enrichment and transformation
4. **Post-processing**: Notifications, analytics, cleanup
5. **Observability**: Real-time logging and metrics

---

## 🛠️ Troubleshooting

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 🔴 Service not appearing | Check announcement frequency (e.g., every 20s) and network connectivity. |
| 🟡 Schema not updating | Validate schema format and check gateway logs for parsing or merging errors. |
| 🟠 Pre-pipeline not running | Ensure the service is announcing its `middlewareMap` correctly. Verify the target service (e.g., `auth-service`) is healthy and registered. |
| 🔵 Dashboard not loading | Confirm admin token and WebSocket connectivity to the gateway. |

### Debug Commands

```bash
# Check gateway status
curl "http://localhost:5000/gateway-status?token=${ADMIN_TOKEN}"

# View active services  
curl "http://localhost:5000/service?token=${ADMIN_TOKEN}"

# Inspect pipeline configurations
curl "http://localhost:5000/get-pipelines?token=${ADMIN_TOKEN}"
```

---

## 📖 Documentation

- 📚 **[Complete Engineering Manual](engineering_manual.html)**

---

## 📄 License

### Editions

Grapthway is available in two editions, distributed as Docker images on Docker Hub.

* **Community Edition:** A free-to-use version with a core set of features, ideal for individuals, startups, and small projects.
* **Enterprise Edition:** Our commercial version with advanced features, unlimited scaling, and professional support, designed for mission-critical applications.

### License and Terms of Use

Your use of any Grapthway Docker image is subject to the terms and conditions outlined in our Software License Agreement.

**Please read the full agreement here: [LICENSE.md](LICENSE.md)**

---

## 🙏 Acknowledgments

Built with ❤️ by the Grapthway team. Special thanks to:

- The GraphQL community for inspiration
- Early adopters and beta testers
- Contributors and open source maintainers

---

<div align="center">

**Ready to transform your microservices architecture?**

[🚀 Get Started](https://github.com/farisbahdlor/grapthway/releases) • [💬 Join Discord](https://discord.gg/grapthway) • [🐦 Follow Updates](https://twitter.com/grapthway)

*Made with ❤️ for the cloud-native community*

</div>