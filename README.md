# 🚀 Grapthway

<div align="center">

![Grapthway Logo](https://img.shields.io/badge/Grapthway-GraphQL%20Gateway-blue?style=for-the-badge&logo=graphql)

**The Future of Microservices Orchestration**

*A declarative GraphQL gateway that transforms how you compose, orchestrate, and observe distributed systems*

[![Docker Pulls](https://img.shields.io/docker/pulls/farisbahdlor/grapthway?style=flat-square)](https://hub.docker.com/r/farisbahdlor/grapthway)
[![GitHub Stars](https://img.shields.io/github/stars/farisbahdlor/grapthway?style=flat-square)](https://github.com/grapthway)
[![License](https://img.shields.io/github/license/grapthway?style=flat-square)](LICENSE)

[🎯 Quick Start](#-quick-start) • [📖 Documentation](#-documentation) • [🏗️ Examples](#-examples) • [🤝 Contributing](#-contributing)

</div>

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
- **Cross-service data composition** without tight coupling  
- **Transactional workflows** spanning multiple services
- **Automatic service discovery** and health monitoring
- **Load balancing** with round-robin distribution
- **Context propagation** via X-Ctx-* headers

</td>
<td width="50%">

### 🛡️ **Production Features**
- **Redis persistence** for enterprise deployments
- **Real-time admin dashboard** with live metrics
- **WebSocket log streaming** for instant debugging
- **Automatic cleanup** of stale services (30s timeout)
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
docker run -d -p 5000:5000 --name my-community-gateway farisbahdlor/grapthway:community-v1.4
```

### 🔑 Get Your Tokens

```bash
curl http://localhost:5000/start
```

> 💡 **Pro Tip**: Store your admin tokens securely—you'll need them for service registration and dashboard access.

### 🎪 Register Your First Service

```javascript
// In your microservice
async function registerWithGateway() {
  const response = await fetch(`http://gateway:5000/health?token=${ADMIN_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service: 'user-service',
      url: 'http://user-service:4000/graphql',
      subgraph: 'core',
      schema: `
        type User {
          id: ID!
          email: String!
          name: String!
        }
        type Query {
          me: User
        }
      `,
      middlewareMap: { /* Pipeline definitions */ },
      stitchingConfig: { /* Schema extensions */ }
    })
  });
}

// Keep your service alive
setInterval(registerWithGateway, 30000);
```

---

## 🏗️ Advanced Examples

### 🛒 E-commerce Checkout Pipeline

Transform a complex checkout flow into a declarative pipeline:

```json
const MIDDLEWARE_MAP = {
  // This entire block defines a middleware pipeline for the 'payCart' GraphQL field.
  "payCart": {
    // 'pre' steps run in sequence *before* the main 'payCart' resolver is called.
    "pre": [
      {
        "service": "auth-service", // The downstream microservice to call for this step.
        "field": "getUserData", // The specific GraphQL field (query or mutation) to execute on that service.
        "passHeaders": ["Authorization"], // Pass the original request's auth header.
        "selection": ["user { id }"], // The data fields to select from the 'getUserData' response.
        // The result of the 'user' field will be put into the context with the key 'user'.
        "assign": { "user": "user" }, // Saves data from the step's response into the pipeline's context for later steps.
        "concurrent": false // This is a blocking step; the gateway will wait for it to complete before proceeding.
      },
      {
        "service": "cart-service",
        "field": "getCartItems",
        "passHeaders": ["Authorization"], // Gateway automatically adds 'X-Ctx-User' header from the context.
        "selection": ["id", "storeId", "productId"],
        // The entire result of 'getCartItems' is put into the context with the key 'cartItems'.
        // An empty string for the value means "assign the entire result of the field".
        "assign": { "cartItems": "" },
        "concurrent": false, // This is a blocking step.
        // Defines what happens if this specific step fails.
        "onError": {
          // If this step fails, the following rollback steps are executed.
          // A list of compensating actions to run. The gateway will also rollback any previous pre-pipeline steps.
          "rollback": [
            {
              "service": "inventory-service",
              "field": "releaseItems",
              // NOTE: 'releaseItems' service MUST read 'X-Ctx-CartItems' header for data.
              // 'argsMapping' is NOT supported here.
              "concurrent": true // The rollback step is "fire-and-forget"; the gateway doesn't wait for its response.
            },
            {
              "service": "log-service",
              "field": "refundItemsLog",
              // NOTE: 'refundItemsLog' service MUST read 'X-Ctx-CartItems' header for data.
              "concurrent": true
            }
          ]
        }
      }
    ],
    // 'post' steps run *after* the main 'payCart' resolver successfully returns data. They are used for data enrichment.
    "post": [
      {
        "service": "balance-service", // The service to call for additional data.
        "field": "getUserBalance", // The field that provides the enrichment data.
        "concurrent": false, // A blocking enrichment; the gateway waits for this data before returning the final response.
        // The 'userId' value is taken from the main 'payCart' resolver's response.
        // Maps a value from the main resolver's result ('userId') to an argument for the enrichment query.
        "argsMapping": { "userId": "userId" },
        "selection": ["id", "amount", "userId", "updatedAt"], // The fields to request from the enrichment service.
        // The result of 'getUserBalance' is assigned to the 'finalBalance' field in the final response.
        // Merges the data from this step into the final GraphQL response sent to the client.
        "assign": { "finalBalance": "" }
      }
    ]
  }
}
```

### 🔗 Dynamic Schema Stitching

Extend types across service boundaries seamlessly:

```javascript
// Order service extending User type
const stitchingConfig = {
  "User": {
    "orderHistory": {
      "service": "order-service",
      "resolverField": "getOrdersByUserId",
      "argsMapping": { "userId": "id" }
    }
  },
  "Query": {
    "recentOrders": {
      "service": "order-service", 
      "resolverField": "getRecentOrders"
    }
  }
};
```

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
| 🔴 Service not appearing | Check announcement frequency (30s) and network connectivity |
| 🟡 Schema not updating | Validate schema format and check for conflicts |
| 🟠 Pipeline step failing | Verify context values and service availability |
| 🔵 Dashboard not loading | Confirm admin token and WebSocket connectivity |

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

- 📚 **[Complete Engineering Manual](engineering-manual.md)**

---

## 📄 License

### Editions

Grapthway is available in two editions, distributed as Docker images on Docker Hub.

* **Community Edition:** A free-to-use version with a core set of features, ideal for individuals, startups, and small projects.
* **Enterprise Edition:** Our commercial version with advanced features, unlimited scaling, and professional support, designed for mission-critical applications.

---

### License and Terms of Use

Your use of any Grapthway Docker image is subject to the terms and conditions outlined in our Software License Agreement.

**Please read the full agreement here: [LICENSE.md](LICENSE.md)**

---

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