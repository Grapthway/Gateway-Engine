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
  selection: ['user { id name email }'],
  assign: { user: 'user' },
  onError: { "stop": true }
};

const MIDDLEWARE_MAP = {
  'getWarehouseRelation': { pre: [authPreStep] },
  'getAllWarehouseRelations': { pre: [authPreStep] },
  'checkWarehouseRelation': { pre: [authPreStep] },
  'getWarehouseActivity': { pre: [authPreStep] },
  'getAllWarehouseActivities': { pre: [authPreStep] },

  'createWarehouseRelation': {
    pre: [
      authPreStep, // 1. Authenticate the owner and get their email.
      { // 2. Authenticate the partner and get their email.
        service: 'auth-service',
        field: 'getUserByEmail',
        argsMapping: { "email": "args.partnerEmail" },
        selection: ['id', 'email'],
        assign: { "partner": "*" },
        onError: { "stop": true, "message": "Partner with the specified email does not exist." }
      }
    ]
  },

  'deleteWarehouseRelation': { pre: [authPreStep] },
  'createWarehouseActivity': { pre: [authPreStep] }
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
      subgraph: "warehouse",
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
  const PORT = process.env.PORT || 4005;
  await new Promise((res) => httpServer.listen({ port: PORT, host: '0.0.0.0' }, res));
  console.log(`🚀 Warehouse Activity service ready at http://localhost:${PORT}/graphql`);
  await announce();
  setInterval(announce, 20000);
}
start().catch((err) => {
  console.error(err);
  process.exit(1);
});