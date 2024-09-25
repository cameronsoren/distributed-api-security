const express = require('express');
const amqp = require('amqplib/callback_api');
const bodyParser = require('body-parser');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { ApolloServer, gql } = require('apollo-server-express');


// Initialize Express app
const app = express();
app.use(bodyParser.json());

// Define the PORT for REST/GraphQL services
const PORT = 3000;  

// Threat rules mapping
const threatRules = {
  "DDoS": {
    "action": "block_ip",
    "severity": "high"
  },
  "SQL Injection": {
    "action": "send_alert",
    "severity": "high"
  },
  "XSS": {
    "action": "log_event",
    "severity": "medium"
  },
  "Brute Force": {
    "action": "rate_limit",
    "severity": "medium"
  },
  "CSRF": {
    "action": "send_alert",
    "severity": "medium"
  },
  "Credential Stuffing": {
    "action": "block_ip",
    "severity": "high"
  },
  "Directory Traversal": {
    "action": "send_alert",
    "severity": "high"
  },
  "MITM": {
    "action": "send_alert",
    "severity": "high"
  },
  "Rate Limiting Violation": {
    "action": "rate_limit",
    "severity": "medium"
  },
  "Phishing": {
    "action": "log_event",
    "severity": "low"
  }
};


// Apply actions based on threat type
function applyAction(action, details) {
  switch (action) {
    case "block_ip":
      blockIP(details.source_ip);
      break;
    case "send_alert":
      sendAlert(details);
      break;
    case "rate_limit":
      rateLimit(details.source_ip);
      break;
    case "log_event":
      logEvent(details);
      break;
    default:
      console.log(`No action defined for: ${action}`);
  }
}

// Action functions
function blockIP(ipAddress) {
  console.log(`Blocking IP address: ${ipAddress}`);
}

function sendAlert(details) {
  console.log(`Sending alert for threat: ${details}`);
}

function rateLimit(ipAddress) {
  console.log(`Applying rate limiting to IP: ${ipAddress}`);
}

function logEvent(details) {
  console.log(`Logging event: ${details}`);
}

// REST Endpoint (JSON input)
app.post('/report-threat-rest', (req, res) => {
  const threat = req.body;
  processThreatReport(threat); // Apply the threat processing logic
  res.send('Threat processed via REST.');
});

// GraphQL Schema and Resolvers
const typeDefs = gql`
  type Query {
    _empty: String
  }

  type Mutation {
    reportThreatGraphQL(api_id: String!, threat_type: String!, details: String!): String
  }
`;

const resolvers = {
  Mutation: {
    reportThreatGraphQL: (_, { api_id, threat_type, details }) => {
      const threat = { api_id, threat_type, details: JSON.parse(details) };
      processThreatReport(threat); // Apply the threat processing logic
      return 'Threat processed via GraphQL.';
    }
  }
};

// Function to start the Apollo Server and Express together properly
async function startApolloServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();  // This ensures Apollo Server is fully started
  server.applyMiddleware({ app });

  // Start Express app 
  app.listen(PORT, () => {
    console.log(`Central hub listening on port ${PORT}`);
  });
}

// Call the function to start Apollo Server and Express app
startApolloServer();

// gRPC Setup (using protobuf definitions)
const PROTO_PATH = '../central-hub/threat.proto'; 
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,  // Preserve field case
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const threatProto = grpc.loadPackageDefinition(packageDefinition).threatPackage;

function reportThreatGrpc(call, callback) {
  const threat = call.request;
  console.log(`gRPC threat received: api_id=${threat.api_id}, threat_type=${threat.threat_type}, details=${JSON.stringify(threat.details)}`);
  processThreatReport(threat); // Apply the threat processing logic
  callback(null, { message: 'Threat processed via gRPC.' });
}

const grpcServer = new grpc.Server();
grpcServer.addService(threatProto.ThreatService.service, { reportThreatGrpc });

// Start the gRPC server on a different port
grpcServer.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  grpcServer.start();
  console.log('gRPC server running on port 50051');
});


// // RabbitMQ setup. Broadcast processed threat after normalizing it
function broadcastProcessedThreat(threat) {
  const RABBITMQ_URL = 'amqp://localhost';
  amqp.connect(RABBITMQ_URL, (err, connection) => {
      if (err) throw err;
      connection.createChannel((err, channel) => {
          const queue = 'processed-threats';
          channel.assertQueue(queue, { durable: false });
          channel.sendToQueue(queue, Buffer.from(JSON.stringify(threat)));
          console.log('Processed threat broadcasted via RabbitMQ');
      });
  });
}

// Example usage in processThreatReport function:
function processThreatReport(threat) {
  const { threat_type, details } = threat;
  const rule = threatRules[threat_type];

  if (rule) {
      console.log(`Processing ${threat_type} threat`);
      applyAction(rule.action, details);

      // After processing, broadcast to RabbitMQ
      broadcastProcessedThreat(threat);
  } else {
      console.log(`No defined action for ${threat_type}`);
  }
}
