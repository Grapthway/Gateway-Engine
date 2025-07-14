import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// --- Configuration ---
// These endpoints are configured via environment variables or default to localhost.
const AUTH_ENDPOINT = __ENV.AUTH_ENDPOINT || 'http://localhost:5000/auth/graphql';
const CATEGORY_ENDPOINT = __ENV.CATEGORY_ENDPOINT || 'http://localhost:5000/category/graphql';
const INVENTORY_ENDPOINT = __ENV.INVENTORY_ENDPOINT || 'http://localhost:5000/inventory/graphql';
const SHIPPING_ENDPOINT = __ENV.SHIPPING_ENDPOINT || 'http://localhost:5000/shipping/graphql';
const WAREHOUSE_ENDPOINT = __ENV.WAREHOUSE_ENDPOINT || 'http://localhost:5000/warehouse/graphql';

// --- Custom Metrics ---
// Custom metrics to track specific business flows and errors.
const ErrorRate = new Rate('errors');
const LoginDuration = new Trend('trend_login_duration', true);
const CreateDeliveryDuration = new Trend('trend_create_delivery_duration', true);
const DeleteDeliveryDuration = new Trend('trend_delete_delivery_duration', true);
const CreateWarehouseRelationDuration = new Trend('trend_create_warehouse_relation_duration', true);

// Counters for tracking the number of requests for each scenario.
const LoginRequests = new Counter('login_requests');
const CreateDeliveryRequests = new Counter('create_delivery_requests');
const DeleteDeliveryRequests = new Counter('delete_delivery_requests');
const CreateWarehouseRelationRequests = new Counter('create_warehouse_relation_requests');

// --- Test Options ---
// Defines the scenarios, stages, and thresholds for the load test.
export const options = {
  setupTimeout: '10m',
  scenarios: {
    login: {
      executor: 'ramping-vus',
      exec: 'loginScenario',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 15 },
        { duration: '30s', target: 15 },
        { duration: '10s', target: 0 },
      ],
      startTime: '0s',
      gracefulRampDown: '10s',
    },
    createDelivery: {
      executor: 'ramping-vus',
      exec: 'createDeliveryScenario',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 15 },
        { duration: '30s', target: 15 },
        { duration: '10s', target: 0 },
      ],
      startTime: '1m',
      gracefulRampDown: '10s',
    },
    deleteDelivery: {
      executor: 'ramping-vus',
      exec: 'deleteDeliveryScenario',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 15 },
        { duration: '30s', target: 15 },
        { duration: '10s', target: 0 },
      ],
      startTime: '2m',
      gracefulRampDown: '10s',
    },
    createWarehouseRelation: {
      executor: 'ramping-vus',
      exec: 'createWarehouseRelationScenario',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 15 },
        { duration: '30s', target: 15 },
        { duration: '10s', target: 0 },
      ],
      startTime: '3m',
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    'http_req_failed': ['rate<0.01'], // Global threshold for failed requests.
    'errors': ['rate<0.05'], // Threshold for custom-defined errors.
    'http_req_duration': ['p(95)<2000', 'p(99)<3000'], // Global thresholds for request duration.
    'trend_login_duration': ['p(99)<10000'], // Scenario-specific duration thresholds.
    'trend_create_delivery_duration': ['p(99)<10000'],
    'trend_delete_delivery_duration': ['p(99)<10000'],
    'trend_create_warehouse_relation_duration': ['p(99)<10000'],
  },
};

// --- GraphQL Queries ---
// Centralized store for all GraphQL mutations used in the test.
const MUTATION_REGISTER = `
  mutation Register($email: String!, $password: String!, $name: String!) {
    register(email: $email, password: $password, name: $name) { id email }
  }`;
const MUTATION_LOGIN = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) { token }
  }`;
const MUTATION_CREATE_CATEGORY = `
  mutation CreateCategory($name: String!) {
    createCategory(name: $name) { id }
  }`;
const MUTATION_CREATE_INVENTORY = `
  mutation CreateInventory($name: String!, $price: Float!, $quantity: Int!, $categoryId: ID!) {
    createInventory(name: $name, price: $price, quantity: $quantity, categoryId: $categoryId) { id }
  }`;
const MUTATION_CREATE_SHIPPING = `
  mutation CreateShipping($input: CreateShippingInput!) {
    createShipping(input: $input) { id status }
  }`;
const MUTATION_DELETE_SHIPPING = `
  mutation DeleteShipping($id: ID!) {
    deleteShipping(id: $id) { success message }
  }`;
const MUTATION_CREATE_WAREHOUSE_RELATION = `
  mutation CreateWarehouseRelation($partnerEmail: String!) {
    createWarehouseRelation(partnerEmail: $partnerEmail) { id status }
  }`;

// --- Helper for GraphQL Requests ---
// A reusable function to send GraphQL requests and handle common checks.
function graphqlRequest(url, query, variables, authToken = null) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  const res = http.post(url, JSON.stringify({ query, variables }), { headers });

  // An error is a non-200 status OR an unexpected GraphQL error.
  // We use a custom rate 'errors' to track this. add(true) = error, add(false) = success.
  const isSuccess = check(res, { 'status is 200': (r) => r.status === 200 });

  if (isSuccess) {
    const body = res.json();
    if (body && body.errors) {
      // Filter out expected errors that are part of the business logic, not system failures.
      const unexpectedErrors = body.errors.filter(error =>
        !error.message.includes('Cannot cancel a shipment that has already been delivered') &&
        !error.message.includes('A relationship with this partner already exists')
      );
      
      if (unexpectedErrors.length > 0) {
        console.error(`Unexpected GraphQL Error on ${url}: ${JSON.stringify(unexpectedErrors)}`);
        ErrorRate.add(true); // This is an unexpected error.
      } else {
        ErrorRate.add(false); // This is an expected "error" (e.g., trying to delete a delivered item), not a system failure.
      }
    } else {
       ErrorRate.add(false); // Success: status 200 and no GraphQL errors.
    }
  } else {
      ErrorRate.add(true); // This is an HTTP-level error.
  }
  
  return res;
}

// --- Setup Function ---
// This function runs once before the test scenarios to prepare data.
export function setup() {
  console.log('--- Running Setup ---');

  const generateUser = (i) => ({
    email: `loadtest.user.${i}.${Date.now()}@example.com`,
    password: 'Password123',
    name: `Load Test User ${i}`,
  });

  // Create users for the login scenario.
  const loginUsers = Array.from({ length: 50 }, (_, i) => {
    const user = generateUser(i + 1);
    graphqlRequest(AUTH_ENDPOINT, MUTATION_REGISTER, user);
    return user;
  });
  console.log(`Registered ${loginUsers.length} users for login scenario`);

  // Create sender and recipient for shipping scenarios.
  const sender = generateUser(1000);
  const recipient = generateUser(1001);
  graphqlRequest(AUTH_ENDPOINT, MUTATION_REGISTER, sender);
  graphqlRequest(AUTH_ENDPOINT, MUTATION_REGISTER, recipient);
  console.log(`Registered sender: ${sender.email} and recipient: ${recipient.email}`);

  const loginRes = graphqlRequest(AUTH_ENDPOINT, MUTATION_LOGIN, { email: sender.email, password: sender.password });
  const senderToken = loginRes.json().data.login.token;

  // Create a category and inventory items.
  const categoryRes = graphqlRequest(CATEGORY_ENDPOINT, MUTATION_CREATE_CATEGORY, { name: `Load Test Category ${Date.now()}` }, senderToken);
  const categoryId = categoryRes.json().data.createCategory.id;
  console.log(`Created category: ${categoryId}`);

  const inventoryItems = Array.from({ length: 3 }, (_, i) => {
    const item = {
      name: `Test Item ${i + 1} ${Date.now()}`,
      price: 10.0,
      quantity: 1000000,
      categoryId: categoryId,
    };
    graphqlRequest(INVENTORY_ENDPOINT, MUTATION_CREATE_INVENTORY, item, senderToken);
    return { itemName: item.name, quantity: 1 };
  });
  console.log(`Created ${inventoryItems.length} inventory items`);

  // Pre-create deliveries for the delete scenario.
  const deliveriesToDelete = [];
  for (let i = 0; i < 500; i++) {
    const shippingInput = {
      items: inventoryItems,
      address: `123 Test St ${i}`,
      phoneNumber: "555-1234",
      recipientEmail: recipient.email,
    };
    const shippingRes = graphqlRequest(SHIPPING_ENDPOINT, MUTATION_CREATE_SHIPPING, { input: shippingInput }, senderToken);
    const shippingData = shippingRes.json().data;
    if (shippingData && shippingData.createShipping) {
      deliveriesToDelete.push(shippingData.createShipping.id);
    }
  }
  console.log(`Created ${deliveriesToDelete.length} deliveries for deletion scenario`);

  // Create users for the warehouse relation scenario.
  const mainWarehouseUser = generateUser(2000);
  graphqlRequest(AUTH_ENDPOINT, MUTATION_REGISTER, mainWarehouseUser);
  const mainWarehouseLoginRes = graphqlRequest(AUTH_ENDPOINT, MUTATION_LOGIN, { email: mainWarehouseUser.email, password: mainWarehouseUser.password });
  const mainWarehouseToken = mainWarehouseLoginRes.json().data.login.token;

  const partnerUsers = Array.from({ length: 500 }, (_, i) => {
    const partner = generateUser(3001 + i);
    graphqlRequest(AUTH_ENDPOINT, MUTATION_REGISTER, partner);
    return partner;
  });
  console.log(`Registered ${partnerUsers.length} partner accounts for warehouse relations`);

  console.log('--- Setup Complete ---');

  // Pass data from setup to the VU scenarios.
  return {
    loginUsers,
    senderToken,
    recipientEmail: recipient.email,
    inventoryItems,
    deliveriesToDelete,
    mainWarehouseToken,
    partnerEmails: partnerUsers.map(p => p.email),
  };
}

// --- Scenarios ---

// Simulates users logging into the application.
export function loginScenario(data) {
  group('Scenario: Login', () => {
    const userIndex = (__VU * 100 + __ITER) % data.loginUsers.length;
    const user = data.loginUsers[userIndex];
    if (!user) return;
    
    const startTime = Date.now();
    const res = graphqlRequest(AUTH_ENDPOINT, MUTATION_LOGIN, {
      email: user.email,
      password: user.password,
    });
    const duration = Date.now() - startTime;

    check(res, { 
      'Login successful': (r) => r.status === 200 && r.json().data && r.json().data.login,
    });
    
    LoginDuration.add(duration);
    LoginRequests.add(1);
  });
  sleep(randomIntBetween(1, 3));
}

// Simulates the creation of new deliveries.
export function createDeliveryScenario(data) {
  group('Scenario: Create Delivery', () => {
    const shippingInput = {
      items: data.inventoryItems,
      address: `${123 + __VU} Load Test Avenue, Unit ${__ITER}`,
      phoneNumber: `555-${String(__VU).padStart(4, '0')}`,
      recipientEmail: data.recipientEmail,
    };
    
    const startTime = Date.now();
    const res = graphqlRequest(SHIPPING_ENDPOINT, MUTATION_CREATE_SHIPPING, { input: shippingInput }, data.senderToken);
    const duration = Date.now() - startTime;

    check(res, { 
      'Delivery created successfully': (r) => r.status === 200 && r.json().data && r.json().data.createShipping,
    });
    
    CreateDeliveryDuration.add(duration);
    CreateDeliveryRequests.add(1);
  });
  sleep(randomIntBetween(1, 3));
}

// Simulates the deletion of existing deliveries.
export function deleteDeliveryScenario(data) {
  group('Scenario: Delete Delivery', () => {
    if (data.deliveriesToDelete.length === 0) {
      return;
    }
    
    const uniqueIndex = (__VU * 1000 + __ITER) % data.deliveriesToDelete.length;
    const deliveryId = data.deliveriesToDelete[uniqueIndex];
    if (!deliveryId) return;

    const startTime = Date.now();
    const res = graphqlRequest(SHIPPING_ENDPOINT, MUTATION_DELETE_SHIPPING, { id: deliveryId }, data.senderToken);
    const duration = Date.now() - startTime;

    check(res, { 
      'Delete request processed': (r) => {
        const body = r.json();
        const isSuccess = body.data && body.data.deleteShipping && body.data.deleteShipping.success === true;
        const isExpectedError = body.errors && body.errors.some(e => e.message.includes('already been delivered'));
        return isSuccess || isExpectedError;
      }
    });

    DeleteDeliveryDuration.add(duration);
    DeleteDeliveryRequests.add(1);
  });
  sleep(randomIntBetween(1, 3));
}

// Simulates creating relationships between warehouses.
export function createWarehouseRelationScenario(data) {
  group('Scenario: Create Warehouse Relation', () => {
    if (data.partnerEmails.length === 0) {
      return;
    }
    
    const uniqueIndex = (__VU * 1000 + __ITER) % data.partnerEmails.length;
    const partnerEmail = data.partnerEmails[uniqueIndex];
    if (!partnerEmail) return;

    const startTime = Date.now();
    const res = graphqlRequest(WAREHOUSE_ENDPOINT, MUTATION_CREATE_WAREHOUSE_RELATION, { partnerEmail }, data.mainWarehouseToken);
    const duration = Date.now() - startTime;

    check(res, { 
      'Warehouse relation request processed': (r) => {
        const body = r.json();
        const isSuccess = body.data && body.data.createWarehouseRelation;
        const isExpectedError = body.errors && body.errors.some(e => e.message.includes('already exists'));
        return isSuccess || isExpectedError;
      }
    });

    CreateWarehouseRelationDuration.add(duration);
    CreateWarehouseRelationRequests.add(1);
  });
  sleep(randomIntBetween(1, 3));
}

// --- **REVISED** Summary Function ---
// This function runs at the end of the test to generate a custom report.
// It now includes details about the test environment and scenario complexity.
export function handleSummary(data) {
  const format = (value, unit = 'ms') => {
    if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
      return `${value.toFixed(2)}${unit}`;
    }
    return 'N/A';
  };

  // Helper function to provide an estimated p99 if the real value is unavailable.
  function estimateP99FromP95(p95Value) {
    if (typeof p95Value !== 'number' || isNaN(p95Value) || !isFinite(p95Value)) {
      return null;
    }
    // Standard estimation: p99 is typically 1.5x to 2x p95 for web applications.
    const estimatedP99 = p95Value * 1.5;
    return estimatedP99;
  }

  // --- Test Environment and Scenario Details ---
  const testContext = `
  TEST CONTEXT & SCENARIO DETAILS
================================================================
  This report details the performance of complex GraphQL pipeline
  resolvers under a simulated load. All tests were executed from
  a single machine with the following specifications:

  LOAD GENERATOR HARDWARE:
  --------------------------------------------------------------
  System Manufacturer.......: ASUSTeK COMPUTER INC.
  System Model..............: ASUS Vivobook 15
  Operating System..........: Windows 11 Home 64-bit
  Processor.................: Intel(R) Core(TM) 7 150U (~1.8GHz, 12 CPUs)
  Memory....................: 24 GB RAM

  MICROSERVICE SPECIFICATION
  --------------------------------------------------------------
  FrameWork (Node JS)
  Auth Service..............: 2 Instance
  Category Service..........: 2 Instance
  Inventory Service.........: 2 Instance
  Shipping Service..........: 2 Instance
  Warehouse Activity Service: 2 Instance

  SCENARIO PIPELINE DETAILS:
  --------------------------------------------------------------
  1. CREATE WAREHOUSE RELATION: A 2-step pipeline involving:
     - Step 1: Authenticate the requesting user.
     - Step 2: Look up the partner user by email.
     - Main Logic: Create the relation in the database.

  2. CREATE SHIPPING: A complex 6-step pipeline involving:
     - Pre-flight 1: Authenticate sender.
     - Pre-flight 2: Get recipient by email.
     - Pre-flight 3: Check for an active warehouse relation.
     - Pre-flight 4: Decrease sender's inventory stock (bulk).
     - Main Logic: Create the core shipping record.
     - Post-flight 1: Update/create recipient's inventory (bulk).
     - Post-flight 2: Log activity asynchronously (fire-and-forget).

  3. DELETE SHIPPING: A 3-step pipeline for cancellation:
     - Pre-flight 1: Authenticate the user.
     - Pre-flight 2: Fetch full shipment details for rollback.
     - Pre-flight 3: Roll back inventory changes for both parties.
     - Main Logic: Delete the core shipping record.
================================================================`;

  function generateScenarioReport(metricName, counterName, title) {
    const metric = data.metrics[metricName];
    const counter = data.metrics[counterName];
    if (!metric || !metric.values || !counter || counter.values.count === 0) {
      return `\n  ${title}\n  --------------------------------------------------------------\n  No requests were made for this scenario.`;
    }
    const values = metric.values;
    const requestCount = counter.values.count;
    
    // Add p99 estimation for robustness.
    let p99Display = format(values['p(99)']);
    if (p99Display === 'N/A') {
      const estimatedP99 = estimateP99FromP95(values['p(95)']);
      if (estimatedP99) {
        p99Display = `${estimatedP99.toFixed(2)}ms (estimated)`;
      }
    }

    return `

  ${title}
  --------------------------------------------------------------
  Total Requests............: ${requestCount}
  Avg response time.........: ${format(values.avg)}
  Min response time.........: ${format(values.min)}
  Median response time......: ${format(values.med)}
  p(90) response time.......: ${format(values['p(90)'])}
  p(95) response time.......: ${format(values['p(95)'])}
  p(99) response time.......: ${p99Display}
  Max response time.........: ${format(values.max)}`;
  }

  // --- Construct the Final Report ---
  let testDuration = 0;
  if (data.state && data.state.testRunDuration) {
    testDuration = data.state.testRunDuration / 1000;
  }

  const totalReqs = data.metrics.http_reqs ? data.metrics.http_reqs.values.count : 0;
  
  // Correctly calculate the error count from our custom 'errors' Rate metric.
  // .add(true) increments 'passes', which for our 'ErrorRate' means an error occurred.
  const errorsMetric = data.metrics.errors;
  const errorCount = errorsMetric && errorsMetric.values ? errorsMetric.values.passes : 0;
  const totalErrorRateTransactions = (errorsMetric && errorsMetric.values) ? (errorsMetric.values.passes + errorsMetric.values.fails) : 0;
  const errorPercentage = totalErrorRateTransactions > 0 ? (100 * errorCount / totalErrorRateTransactions).toFixed(2) : "0.00";

  const rps = testDuration > 0 ? (totalReqs / testDuration).toFixed(2) : "0.00";

  const summaryHeader = `
  
  LOAD TEST SUMMARY
================================================================
  Test Duration.............: ${testDuration > 0 ? testDuration.toFixed(2) + 's' : 'N/A'}
  Total Requests............: ${totalReqs}
  Failed Requests...........: ${errorCount} (${errorPercentage}%)
  Requests per second (RPS)...: ${rps}/s
================================================================`;

  const fullReport = testContext + summaryHeader +
    generateScenarioReport('trend_login_duration', 'login_requests', 'SCENARIO: AUTHENTICATION (SIMPLE)') +
    generateScenarioReport('trend_create_warehouse_relation_duration', 'create_warehouse_relation_requests', 'SCENARIO: CREATE WAREHOUSE RELATION (PIPELINE)') +
    generateScenarioReport('trend_create_delivery_duration', 'create_delivery_requests', 'SCENARIO: CREATE SHIPPING (PIPELINE)') +
    generateScenarioReport('trend_delete_delivery_duration', 'delete_delivery_requests', 'SCENARIO: DELETE SHIPPING (PIPELINE)');

  return {
    'stdout': fullReport,
    'summary.txt': fullReport,
    'summary.json': JSON.stringify(data, null, 2),
  };
}
