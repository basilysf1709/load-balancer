# Load Balancer Visualization

This project provides a visual representation of a load balancer distributing requests across multiple IP addresses. It demonstrates different load balancing algorithms and allows for real-time interaction and observation of the load distribution.

## Visuals

![Screen Shot 2024-07-22 at 8 45 12 AM](https://github.com/user-attachments/assets/aa103344-1150-4050-bfda-d39bddc92288)

## Features

- Interactive visualization of load balancing across multiple IP addresses
- Support for multiple load balancing algorithms:
  - Round Robin
  - Random
  - Least Connections
- Real-time updates of request distribution
- Ability to add new IP addresses dynamically
- Visual feedback on which IP handled the most recent request

## Tech Stack

- Frontend: React with React Flow for visualization
- Backend: Flask (Python)
- API Communication: Axios

## Getting Started

### Prerequisites

- Node.js and npm
- Python 3.x
- pip (Python package manager)

### Installation

1. Clone the repository:
`git clone [your-repo-link]`
`cd [your-repo-name]`

2. Set up the backend:
`pip install -r requirements.txt`

3. Set up the frontend:
`cd frontend`
`npm install`

### Running the Application

1. Start the backend server:
`python app.py`
2. In a new terminal, start the frontend development server:
`cd frontend`
`npm start`
3. Open your browser and navigate to `http://localhost:3000` to view the application.

## Usage

- Click on the algorithm buttons to change the load balancing method.
- Use the "Send Request" button to simulate sending a request to the load balancer.
- The "Add IP" button allows you to add a new IP address to the pool.
- Observe the visual feedback as requests are distributed among the IP addresses.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
