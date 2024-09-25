
# Distributed API Security Framework

```
     ______
   .-'      `-.
  /            \
 |              |
 |,  .-.  .-.  ,|
 | )(_o/  \o_)( |
 |/     /\     \|
 (_     ^^     _)
  \__|IIIIII|__/
   | \IIIIII/ |
   \          /
    `--------`
```

# Overview
A framework for real-time distributed API security, enabling threat reporting and sharing across multiple protocols (REST, GraphQL, gRPC).

## Features
- Multi-protocol support (REST, GraphQL, gRPC)
- Real-time threat normalization
- Client-to-client threat sharing via RabbitMQ
- Customizable threat responses

## Installation

### Prerequisites
- **Node.js** (v14 or higher)
- **RabbitMQ**: You need to have RabbitMQ installed and running. [Follow the RabbitMQ installation guide](https://www.rabbitmq.com/download.html) for your platform.

### Steps to Install RabbitMQ Locally:
1. **Install RabbitMQ**:
   - **MacOS** (using Homebrew):
     ```bash
     brew install rabbitmq
     ```
   - **Ubuntu**:
     ```bash
     sudo apt-get install rabbitmq-server
     ```
   - **Windows**: Download and install from [RabbitMQ official site](https://www.rabbitmq.com/install-windows.html).

2. **Start RabbitMQ**:
   - MacOS/Ubuntu:
     ```bash
     brew services start rabbitmq
     # or
     sudo systemctl start rabbitmq-server
     ```
   - **Windows**: Start RabbitMQ using the RabbitMQ Command Prompt.

### Steps to Install and Run the Project

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   cd distributed-api-security
   npm install
   ```

2. **Start the Central Hub**:
   ```bash
   npm run start-central-hub
   ```

3. **Connect clients**:
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

## Usage
- The central hub coordinates threat data and shares it across the network using RabbitMQ.
- Ensure RabbitMQ is running to allow for real-time communication between APIs.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
This project is licensed under the [MIT License](LICENSE).
