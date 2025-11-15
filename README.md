# Inventra
A full-stack inventory management tool built for small trading businesses, featuring real-time data ingestion, FIFO-based costing, and a live dashboard

# Inventory Management System (Real-Time FIFO)

## 1. Description

This project is a **real-time inventory management system** built using **Node.js, PostgreSQL, Kafka, and Socket.IO**, with a **React frontend**.  

The system supports:

- Real-time inventory updates via Kafka topics  
- FIFO (First-In-First-Out) logic for stock consumption  
- User authentication
- Live dashboards showing inventory, purchases, and sales

## Live Links

- **Frontend:** https://inventra-client-theta.vercel.app  
- **Backend API:** https://inventra-m2vx.onrender.com

---

## 2. Environment Variables

### Server-side

Create a `.env` file in the `server` folder and copy the following:

```env
# PostgreSQL Configuration
PGUSER=your_pg_user
PGPASSWORD=your_pg_password
PGHOST=your_pg_host
PGPORT=your_pg_port
PGDATABASE=your_pg_database

# Kafka Configuration (Confluent Cloud)
KAFKA_API_KEY=your_kafka_api_key
KAFKA_API_SECRET=your_kafka_api_secret
KAFKA_BROKER=broker1:9092,broker2:9092,broker3:9092
```

### Client-side

Create a `.env` file in the `client` folder and copy the following:

```env
VITE_ENDPOINT_URL=http://localhost:5000/api
```

> Replace the URL with your **deployed server URL** when running in production.

---

## 3. Login Credentials

Default admin account:

```
Email: admin@example.com
Password: admin123
```

---

## 4. FIFO Logic

The inventory system follows **FIFO (First-In-First-Out)** principle:

- When a product is sold, the system deducts stock starting from the **oldest inventory batch**  
- Ensures accurate costing and prevents stock expiration issues  
- Ledger entries are updated in real-time via Kafka topics:

  - `inventory.purchase` → New stock added  
  - `inventory.sale` → Stock consumed  
  - `inventory.ledger` → Maintains FIFO stock ledger  

---

## 5. How to Run Locally

### Step 1: Clone the repository

```bash
git clone <your-repo-url>
cd <repo-root>
```

### Step 2: Set up PostgreSQL

1. Install **PostgreSQL** and **pgAdmin**  
2. Create a database using the name from `.env`  
3. Run the SQL setup scripts in the `server/setup` folder to create tables and insert dummy data  

### Step 3: Set up Kafka Cluster

1. Create a Kafka cluster on **Confluent Cloud**  
2. Create the following **topics**:

```
inventory.ledger
inventory.purchase
inventory.sale
```

### Step 4: Run the Server

```bash
cd server
npm install
npm start
```

- Ensure `.env` variables are set correctly  
- The server will start on the port defined in `.env` or `5000` by default  
- Kafka consumer starts automatically and listens to topics  

### Step 5: Run the Client

```bash
cd client
npm install
npm run dev
```

- Make sure the `.env` file points to your backend API (`VITE_ENDPOINT_URL`)  
- The client will run on `http://localhost:5173` (default for Vite)  
- Log in using the admin credentials  

---

## 6. Notes

- Ensure **Kafka broker URLs**, API keys, and secrets are correct  
- FIFO logic is **handled on the server** via ledger updates  
- Real-time updates require **Socket.IO connection** between client and server
