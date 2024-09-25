import pkg from '@apollo/client';
const { ApolloClient, InMemoryCache, gql, HttpLink } = pkg;
import fetch from 'node-fetch';
import amqp from 'amqplib/callback_api.js';

const client = new ApolloClient({
    link: new HttpLink({ uri: 'http://localhost:3000/graphql', fetch }),
    cache: new InMemoryCache(),
});

function simulateThreat() {
    const details = JSON.stringify({
        source_ip: "192.168.1.30",
        description: "Suspicious login attempts detected"
    });

    client.mutate({
        mutation: gql`
            mutation ReportThreat($api_id: String!, $threat_type: String!, $details: String!) {
                reportThreatGraphQL(api_id: $api_id, threat_type: $threat_type, details: $details)
            }
        `,
        variables: {
            api_id: "client_c",
            threat_type: "Brute Force",
            details: details
        },
    })
    .then(response => {
        console.log('Threat reported via GraphQL:', response.data);
    })
    .catch(error => {
        console.error('Error reporting threat via GraphQL:', error);
    });
}

setInterval(simulateThreat, 20000);  // Client C sends every 20 seconds


// RabbitMQ listener for receiving processed threats
amqp.connect('amqp://localhost', (err, connection) => {
    if (err) throw err;
    connection.createChannel((err, channel) => {
        if (err) throw err;
        const queue = 'processed-threats';

        channel.assertQueue(queue, { durable: false });
        console.log('Client C waiting for processed threats from Central Hub...');

        // Listen for processed threats from RabbitMQ
        channel.consume(queue, (msg) => {
            const threat = JSON.parse(msg.content.toString());
            console.log(`Client C received processed threat: ${JSON.stringify(threat)}`);

            // Simulate taking action based on the processed threat
            console.log(`Client C taking action on threat from: ${threat.api_id}`);
        }, { noAck: true });
    });
});