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
  selection: ['user { id }'],
  assign: { user: 'user' },
  passContext: ['user'],
  onError: { "stop": true }
};

const MIDDLEWARE_MAP = {
  'getInventory': { pre: [authPreStep] },
  'getAllInventory': { pre: [authPreStep] },
  'getInventoryByName': { pre: [authPreStep] },
  'updateInventory': {
    pre: [
      authPreStep,
      {
        service: 'category-service',
        field: 'getCategory',
        passHeaders: ['Authorization'],
        argsMapping: { "id": "args.categoryId" },
        onError: { "stop": true }
      }
    ]
  },
  'deleteInventory': { pre: [authPreStep] },
  'createInventory': {
    pre: [
      authPreStep,
      {
        service: 'category-service',
        field: 'getCategory',
        passHeaders: ['Authorization'],
        argsMapping: { "id": "args.categoryId" },
        onError: { "stop": true }
      }
    ]
  },
  'decreaseInventory': { pre: [authPreStep] },
  'updateOrCreateInventory': { pre: [authPreStep] },
  'adjustInventoryQuantity': { pre: [authPreStep] },
};

const STITCHING_CONFIG = {
    "Category": {
      "inventories": {
        "service": "inventory-service",
        "resolverField": "getInventoriesByCategoryIdAndUserId",
        "argsMapping": { 
            "categoryId": "id",
            "userId": "userId"
        } 
      }
    }
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
      subgraph: "inventory",
      schema: typeDefs,
      middlewareMap: MIDDLEWARE_MAP,
      stitchingConfig: STITCHING_CONFIG,
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
        let user;
        if (req.headers['x-ctx-user']) {
          try {
            user = JSON.parse(req.headers['x-ctx-user']);
          } catch (err) {
            console.warn('⚠️ Failed to parse x-ctx-user header:', err.message);
          }
        }
        return { req, user };
      }
    })
  );

  const PORT = process.env.PORT || 4004;
  await new Promise((res) => httpServer.listen({ port: PORT, host: '0.0.0.0' }, res));
  console.log(`🚀 Inventory service ready at http://localhost:${PORT}/graphql`);

  await announce();
  setInterval(announce, 20000);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
