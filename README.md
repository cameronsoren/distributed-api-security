
# Distributed API Security Framework

## Overview
A framework for real-time distributed API security, enabling threat reporting and sharing across multiple protocols (REST, GraphQL, gRPC).

## Features
- Multi-protocol support (REST, GraphQL, gRPC)
- Threat report normalization
- Client-to-client threat sharing

## Installation
Clone the repository:
```bash
git clone https://github.com/cameronsoren/distributed-api-security.git
cd distributed-api-security
npm install
```

## Usage 
Instructions for running the project:

### Start the Central Hub:
```bash
npm run start-central-hub
```

### Connect Clients:
Clients (A, B, C) connect to the central hub via different protocols (REST, gRPC, GraphQL). Begin by configuring the client endpoints and running:

For Client A (REST):
```bash
npm run start-client-a
```

For Client B (gRPC):
```bash
npm run start-client-b
```

For Client C (GraphQL):
```bash
npm run start-client-c
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
This project is licensed under the MIT License.