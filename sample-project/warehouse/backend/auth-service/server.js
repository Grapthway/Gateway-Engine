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

//
// =================================================================
// START: GraphQL Request Logger Plugin
// =================================================================
//
// This custom plugin provides deep insight into every GraphQL request.
// It's the best way to debug incoming queries and errors.
//
const loggingPlugin = {
  async requestDidStart(requestContext) {
    // This function fires at the start of every request.
    console.log('================================================');
    console.log('GraphQL Request Received at:', new Date().toISOString());
    
    // Log the raw query string sent by the client.
    // *** THIS IS THE MOST IMPORTANT PART FOR YOUR DEBUGGING. ***
    // Inspect the 'Query:' output in your console. For the logout
    // request, you will likely see `logout(...) { }`, which is invalid.
    console.log('Query:\n', requestContext.request.query);
    
    // Log any variables sent with the query.
    console.log('Variables:', requestContext.request.variables);
    
    // Log the HTTP headers.
    console.log('Headers:', requestContext.request.http.headers);
    console.log('================================================');

    return {
      // This function fires if any errors occur during the request lifecycle.
      async didEncounterErrors(context) {
          console.log('--- AN ERROR OCCURRED ---');
          context.errors.forEach(error => {
            console.error('Message:', error.message);
            console.error('Path:', error.path);
            console.error('Locations:', error.locations);
            console.error('Stacktrace:', error.extensions?.stacktrace?.join('\n'));
          });
          console.log('-------------------------');
      }
    };
  },
};
//
// =================================================================
// END: GraphQL Request Logger Plugin
// =================================================================
//


// Health-check announcer
async function announce() {
  try {
    const token = process.env.GATEWAY_TOKEN || "";
    const service = process.env.SERVICE_NAME;
    const url = process.env.SELF_URL;
    const gateway = process.env.GATEWAY_URL;
    const subgraph = "auth";

    if (!service || !url || !gateway) {
      console.warn('⚠️  Missing SERVICE_NAME, SELF_URL or GATEWAY_URL in .env');
      return;
    }
    
    const healthUrl = `${gateway}/admin/health?token=${encodeURIComponent(token)}`;

    const payload = {
      service,
      url,
      subgraph,
      type: "graphql", 
      schema: typeDefs, 
      middlewareMap: {}, 
      stitchingConfig: {}
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
      console.log(`✅ Announced health for ${service} to gateway.`);
    }
  } catch (err) {
    console.error('❌ Error announcing health:', err);
  }
}

setInterval(announce, 20000);

async function start() {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({ 
    typeDefs, 
    resolvers,
    plugins: [loggingPlugin]
  });

  await server.start();

  app.use(
    '/graphql',
    cors(),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => ({ req, res }),
    })
  );

  const PORT = process.env.PORT || 4000;
  await new Promise((resolve) =>
    httpServer.listen({ port: PORT, host: '0.0.0.0' }, resolve)
  );
  console.log(`🚀 Auth service ready at http://localhost:${PORT}/graphql`);

  await announce();
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
