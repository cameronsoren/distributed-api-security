const axios = require('axios');
const amqp = require('amqplib/callback_api');

function simulateThreat() {
    const threat = {
        api_id: 'client_a',
        threat_type: 'DDoS',
        details: { source_ip: '192.168.1.10', description: 'Suspicious traffic detected' }
    };

    axios.post('http://localhost:3000/report-threat-rest', threat)
        .then(response => {
            console.log('Threat reported via REST: ', response.data);
        })
        .catch(error => {
            console.error('Error reporting threat: ', error);
        });
}

setInterval(simulateThreat, 10000);  // Client A sends every 10 seconds

// RabbitMQ listener for receiving processed threats
amqp.connect('amqp://localhost', (err, connection) => {
    if (err) throw err;
    connection.createChannel((err, channel) => {
        if (err) throw err;
        const queue = 'processed-threats';

        channel.assertQueue(queue, { durable: false });
        console.log('Client A waiting for processed threats from Central Hub...');

        // Listen for processed threats from RabbitMQ
        channel.consume(queue, (msg) => {
            const threat = JSON.parse(msg.content.toString());
            console.log(`Client A received processed threat: ${JSON.stringify(threat)}`);

            // Simulate taking action based on the processed threat
            console.log(`Client A taking action on threat from: ${threat.api_id}`);
        }, { noAck: true });
    });
});
