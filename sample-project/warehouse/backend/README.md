# 🏭 Backend Services for Warehouse System

This repository contains modular backend microservices (Auth, Category, Inventory, Shipping, and Warehouse Activity) integrated via a dynamic GraphQL gateway called **Grapthway**.

---

## 🚀 Quick Start Guide

### 1. 🔁 Clone the Repository

```bash
git clone --branch main https://gitlab.com/igtc/warehouse/backend-services.git
cd backend-services
```

---

### 2. 🛡️ Start the Gateway

First, launch the community version of **Grapthway**:

```bash
docker run -d -p 5000:5000 --name my-community-gateway farisbahdlor/grapthway:community-v2.0
```

> 🌐 Visit: [http://localhost:5000/start](http://localhost:5000/start)
> 📌 Copy the generated `GATEWAY_TOKEN`.
> 🔁 Note: You must re-visit `/start` after restarting the gateway container to get a **new token** for all services.

---

### 3. 🧱 Build and Run Microservices

Use the following steps for **each service**, replacing the `GATEWAY_TOKEN` with the one you copied above:

#### 🔐 Auth Service

```bash
docker build -t auth-service ./auth-service
docker run -d --env-file ./auth-service/.env.4000 -e GATEWAY_TOKEN=a84c5963833b704cdb86a2d5cbedfe03 -p 4000:4000 --name auth-service-1 auth-service
```

#### 🗂️ Category Service

```bash
docker build -t category-service ./category-service
docker run -d --env-file ./category-service/.env.6000 -e GATEWAY_TOKEN=a84c5963833b704cdb86a2d5cbedfe03 -p 6000:6000 --name category-service-1 category-service
```

#### 📦 Inventory Service

```bash
docker build -t inventory-service ./inventory-service
docker run -d --env-file ./inventory-service/.env.7000 -e GATEWAY_TOKEN=a84c5963833b704cdb86a2d5cbedfe03 -p 7000:7000 --name inventory-service-1 inventory-service
```

#### 🚚 Shipping Service

```bash
docker build -t shipping-service ./shipping-service
docker run -d --env-file ./shipping-service/.env.9000 -e GATEWAY_TOKEN=a84c5963833b704cdb86a2d5cbedfe03 -p 9000:9000 --name shipping-service-1 shipping-service
```

#### 🏗️ Warehouse Activity Service

```bash
docker build -t warehouse-activity-service ./warehouse-activity-service
docker run -d --env-file ./warehouse-activity-service/.env.8000 -e GATEWAY_TOKEN=a84c5963833b704cdb86a2d5cbedfe03 -p 8000:8000 --name warehouse-activity-service-1 warehouse-activity-service
```

---

### 🔁 Run Multiple Instances (Optional)

Each service supports **multi-instance deployments**. Just swap the `.env` file:

```bash
docker run -d --env-file ./auth-service/.env.4001 -e GATEWAY_TOKEN=a84c5963833b704cdb86a2d5cbedfe03 -p 4001:4001 --name auth-service-2 auth-service
```

---

## ⚙️ Customizing Environment Variables

You can override any env value using `-e` flags when running the container:

```bash
docker run -d \
  --env-file ./auth-service/.env.4000 \
  -e GATEWAY_TOKEN=a84c5963833b704cdb86a2d5cbedfe03 \
  -e MONGO_URI=mongodb://admin:password@host.docker.internal:27017/warehouse?authSource=admin \
  -e REDIS_URL=redis://host.docker.internal:6379 \
  -e PORT=4000 \
  -p 4000:4000 \
  auth-service
```

---

## ✅ Health Check and Successful Boot Confirmation

Once a service is running correctly, you should see logs like:

```txt
2025-07-10 10:07:12 🚀 Auth service ready at http://localhost:4000/graphql
2025-07-10 10:07:12 MongoDB connected
2025-07-10 10:07:12 ✅ Announced health for auth-service to gateway.
```

---

## 🧠 Tips

* Use `host.docker.internal` in `.env` for host-database access on Docker Desktop (macOS/Windows).
* If using Linux, replace it with `172.17.0.1` or your Docker host IP.
* Always restart services with updated tokens after the gateway is restarted.
