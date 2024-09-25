const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const PROTO_PATH = '../central-hub/threat.proto';
const amqp = require('amqplib/callback_api');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
  });
const threatProto = grpc.loadPackageDefinition(packageDefinition).threatPackage;


const client = new threatProto.ThreatService('localhost:50051', grpc.credentials.createInsecure());

function simulateThreat() {
    const threat = {
        api_id: 'client_b',
        threat_type: 'SQL Injection',
        details: JSON.stringify({ source_ip: '192.168.1.20', description: 'Suspicious SQL query detected' })  
    };

    client.reportThreatGrpc(threat, (error, response) => {
        if (!error) {
            console.log('Threat reported via gRPC:', response);
        } else {
            console.error('Error:', error);
        }
    });

    console.log('Sending threat via gRPC:', threat);  // Log the threat before sending
}

setInterval(simulateThreat, 15000);  // Client B sends every 15 seconds


// RabbitMQ Listener Setup (for receiving processed threats from Central Hub)

amqp.connect('amqp://localhost', (err, connection) => {
  if (err) throw err;
  connection.createChannel((err, channel) => {
    if (err) throw err;
    const queue = 'processed-threats';

    channel.assertQueue(queue, { durable: false });
    console.log('Waiting for processed threats from Central Hub...');

    // Listen for messages from RabbitMQ
    channel.consume(queue, (msg) => {
      const threat = JSON.parse(msg.content.toString());
      console.log(`Client B received processed threat: ${JSON.stringify(threat)}`);

      // Simulate taking action based on the processed threat
      console.log(`Client B taking action on threat from: ${threat.api_id}`);
    }, { noAck: true });
  });
});



