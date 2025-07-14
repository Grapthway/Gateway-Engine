# 🚀 Frontend Application – Docker Setup Guide

Welcome! This guide walks you through setting up, building, and running this frontend application using Docker. In just a few steps, your app will be up and running at **[http://localhost:3000](http://localhost:3000)**.

---

## 📦 Prerequisites

Before starting, make sure the following tools are installed on your machine:

* [Docker](https://www.docker.com/products/docker-desktop/) 🐳

---

## 🛠️ Step-by-Step Instructions

### 1. 📥 Clone the Repository

```bash
git clone --branch main https://gitlab.com/igtc/warehouse/frontend.git
cd frontend
```

> Skip this step if you already have the project directory.

---

### 2. 🧱 Build the Docker Image

Use the provided `Dockerfile` to build your application image.

```bash
docker build -t warehouse-frontend .
```

* `-t warehouse-frontend` gives your image a name (you can change it).

---

### 3. 🏃 Run the Container

After the image has been built successfully, run the container:

```bash
docker run -d -p 3000:3000 --name warehouse-frontend-container warehouse-frontend
```

* `-d` runs the container in the background
* `-p 3000:3000` maps port 3000 on your machine to the container
* `--name warehouse-frontend-container` gives your container a friendly name

---

### 4. 🌐 Access the Application

Once the container is running, open your browser and go to:

```
http://localhost:3000
```

Your frontend application should now be live! 🎉

---

## 🧼 Useful Docker Commands

* 🔄 Rebuild image (if you made code changes):

  ```bash
  docker build -t warehouse-frontend .
  ```

* 📋 List running containers:

  ```bash
  docker ps
  ```

* ❌ Stop the container:

  ```bash
  docker stop warehouse-frontend-container
  ```

* 🗑️ Remove the container:

  ```bash
  docker rm warehouse-frontend-container
  ```

* 🗑️ Remove the image:

  ```bash
  docker rmi warehouse-frontend
  ```

---

## 📁 Project Structure

```
frontend/
├── Dockerfile
├── package.json
├── package-lock.json
├── app/
├── public/
├── src/
└── ...
```

---

## 🧾 Notes

* Make sure your app uses port `3000` inside the container.
* The `npm run build` command is used during image creation to prepare the frontend app.
* The `CMD ["npm", "run", "start"]` ensures the production server is started on container boot.

---
