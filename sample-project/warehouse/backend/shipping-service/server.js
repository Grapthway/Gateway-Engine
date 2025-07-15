import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';

import { typeDefs } from './graphql/schema.js';
import { resolvers } from './graphql/resolver.js';
import './models/mongooseConnect.js';


const authPreStep = {
  service: 'auth-service',
  field: 'getUserData',
  passHeaders: ['Authorization'],
  selection: ['user { id name }'],
  assign: { user: 'user' },
  onError: { "stop": true }
};


const createShippingPipeline = {
    pre: [
        authPreStep, // 1. Get sender's info
        { // 2. Get recipient's info by email
            service: 'auth-service',
            field: 'getUserByEmail',
            argsMapping: { "email": "args.input.recipientEmail" },
            selection: ['id', 'name'],
            assign: { "recipient": "*" },
            onError: { "stop": true, "message": "Recipient not found." }
        },
        { // 3. Check if sender and recipient have a warehouse relation
            service: 'warehouse-activity-service',
            field: 'checkWarehouseRelation',
            passContext: ['user'], 
            argsMapping: { "partnerId": "recipient.id" },
            onError: { "stop": true, "message": "No active warehouse relation with recipient." }
        },
        { // 4. Decrease stock for ALL items at once.
            service: 'inventory-service',
            field: 'decreaseInventoryBulk',
            operation: 'mutation',
            passContext: ['user'], // Passes the sender's auth context.
            // Pass the entire items array from the original mutation's input.
            argsMapping: { "items": "args.input.items" },
            onError: { "stop": true, "message": "Failed to update inventory. One or more items may be out of stock." }
        }
    ],
    // The main createShipping resolver runs here
    post: [
        { // 6. Update or create recipient's inventory using the new bulk mutation.
            service: 'inventory-service',
            field: 'updateOrCreateInventoryBulk',
            operation: 'mutation',
            argsMapping: {
                "userId": "recipient.id", // from context
                "items": "args.input.items" // from original arguments
            },
            onError: { "stop": false, "message": "Failed to update recipient inventory, but shipping was created." }
        },
        { // 7. Log the activity for all items
            service: 'warehouse-activity-service',
            field: 'createWarehouseActivityBulk',
            operation: 'mutation',
            selection: ['_scalar'],
            argsMapping: {
                "shippingId": "id", // from createShipping response
                "senderId": "user.id",
                "recipientId": "recipient.id",
                "senderName": "user.name",
                "recipientName": "recipient.name",
                "items": "args.input.items", // Pass the full items array
                "activityType": "CREATE"
            },
            concurrent: true // Fire-and-forget logging
        }
    ]
};

// Pipeline for deleting (cancelling) a shipment
const deleteShippingPipeline = {
    pre: [
      // Step 1: Authenticate the user trying to delete the shipment.
      authPreStep,

      // Step 2: Fetch the full details of the shipment that is about to be deleted.
      // We need this data for the rollback step.
      {
        service: 'shipping-service', // Calls itself to get the data
        field: 'getShipping',        // Uses the existing query
        argsMapping: {
          "id": "args.id"          // Passes the ID from the deleteShipping mutation
        },
        // Select all the fields needed for the next step.
        selection: ['senderId', 'recipientId', 'items { itemName: name, quantity }'],
        // Assign the entire result to a new 'shipping' key in the context.
        assign: { "shipping": "*" },
        onError: { "stop": true }
      },

      // Step 3: Call the inventory service to roll back the stock changes.
      // This is the step that was previously failing.
      {
        service: 'inventory-service',
        field: 'rollbackInventoryForShipment',
        operation: 'mutation',     // It's a mutation.
        selection: ['_scalar'],    // It returns a Boolean (a scalar).
        argsMapping: {
          // Map the data we fetched in the previous step to the required arguments.
          "senderId": "shipping.senderId",
          "recipientId": "shipping.recipientId",
          "items": "shipping.items"
        },
        onError: { "stop": true }
      }
    ]
};

const MIDDLEWARE_MAP = {
  'getShipping': { pre: [authPreStep] },
  'getAllShippings': { pre: [authPreStep] },
  'createShipping': createShippingPipeline,
  'updateShipping': { pre: [authPreStep] },
  'deleteShipping': deleteShippingPipeline,
};

async function announce() {
  try {
    const token = process.env.GATEWAY_TOKEN;
    const service = process.env.SERVICE_NAME;
    const url = process.env.SELF_URL;
    const gatewayAdminUrl = process.env.GATEWAY_URL;

    if (!service || !url || !gatewayAdminUrl || !token) {
      console.warn('⚠️  Missing service configuration in .env file. Announce skipped.');
      return;
    }

    const healthUrl = `${gatewayAdminUrl}/admin/health?token=${encodeURIComponent(token)}`;

    const payload = {
      service,
      url,
      type: "graphql",
      subgraph: "shipping",
      schema: typeDefs,
      middlewareMap: MIDDLEWARE_MAP,
    };

    const res = await fetch(healthUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const responseText = await res.text();
      console.error(`❌ Health announce failed for ${service}: ${res.status} ${res.statusText} - ${responseText}`);
    } else {
      console.log(`✅ Announced ${service} to gateway`);
    }
  } catch (err) {
    console.error('❌ Error announcing health:', err.message);
  }
}

async function start() {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  await server.start();

  app.use(
    '/graphql',
    cors(),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        let context = { req };
        Object.keys(req.headers).forEach(key => {
            if (key.startsWith('x-ctx-')) {
                const ctxKey = key.substring(6);
                try {
                    context[ctxKey] = JSON.parse(req.headers[key]);
                } catch (e) {
                    console.warn(`Could not parse context header ${key}`);
                }
            }
        });
        return context;
      }
    })
  );

  const PORT = process.env.PORT || 4006;
  await new Promise((res) => httpServer.listen({ port: PORT, host: '0.0.0.0' }, res));
  console.log(`🚀 Shipping service ready at http://localhost:${PORT}/graphql`);

  await announce();
  setInterval(announce, 20000);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
