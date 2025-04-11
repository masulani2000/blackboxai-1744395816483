# Arbitrage Calculator

A real-time web application that calculates and tracks sports arbitrage betting opportunities across different bookmakers. The application monitors odds from multiple bookmakers and calculates profitable arbitrage opportunities automatically.

## Features

- Real-time odds tracking and arbitrage calculations
- Detailed view of each arbitrage opportunity
- Live updates via WebSocket connection
- Filtering options by league, bookmaker, and minimum profit
- Responsive design with Tailwind CSS

## Installation

### Option 1: Download ZIP File

1. Download the ZIP file:
   - Click the green "Code" button at the top of the repository
   - Select "Download ZIP"
   - Save the file to your computer

2. Extract the ZIP file:
   - Windows: Right-click the ZIP file and select "Extract All"
   - Mac: Double-click the ZIP file
   - Linux: Run `unzip arbitrage-calculator.zip`

3. Navigate to the extracted folder:
```bash
cd arbitrage-calculator
```

### Option 2: Clone Repository

If you have Git installed, you can clone the repository:
```bash
git clone <repository-url>
cd arbitrage-calculator
```

### Installing Dependencies

After downloading/cloning, install the required dependencies:
```bash
npm install
```

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Environment Configuration

1. Create a `.env` file in the root directory:
   - Copy the `.env.example` file and rename it to `.env`
   - Windows: `copy .env.example .env`
   - Mac/Linux: `cp .env.example .env`

2. The `.env` file contains:
```env
# Server Configuration
PORT=8000  # Default port is 8000 if not specified
NODE_ENV=development  # Change to 'production' for production environment
```

## Running the Application

1. Start the development server:
```bash
npm run dev
```
or for production:
```bash
npm start
```

2. Open your web browser and navigate to:
```
http://localhost:8000
```

## Dependencies

### Main Dependencies
- `express`: Web application framework
- `socket.io`: Real-time bidirectional event-based communication
- `axios`: Promise based HTTP client
- `cors`: Cross-Origin Resource Sharing middleware
- `dotenv`: Environment variables management
- `string-similarity`: String similarity comparison

### Development Dependencies
- `nodemon`: Development utility for automatic server restart

## Project Structure

```
├── public/
│   ├── index.html        # Main page
│   ├── detail.html       # Opportunity details page
│   └── js/
│       ├── main.js       # Main page JavaScript
│       └── detail.js     # Details page JavaScript
├── server/
│   ├── index.js          # Express server setup
│   ├── socketHandler.js  # WebSocket handler
│   ├── routes/
│   │   └── arbitrage.js  # API routes
│   └── utils/
│       ├── oddsFetcher.js       # Odds data fetcher
│       ├── dataNormalizer.js    # Data normalization
│       └── arbitrageCalculator.js # Arbitrage calculations
└── package.json
```

## API Endpoints

- `GET /api/arbitrage`: Get all arbitrage opportunities
  - Query parameters:
    - `league`: Filter by league name
    - `bookmaker`: Filter by bookmaker name
    - `minProfit`: Filter by minimum profit percentage

- `GET /api/arbitrage/:id`: Get specific arbitrage opportunity details

## WebSocket Events

- `initialData`: Received when first connecting, contains current opportunities
- `opportunities`: Real-time updates for new arbitrage opportunities

## Technologies Used

- Backend:
  - Node.js
  - Express
  - Socket.IO
  - WebSocket

- Frontend:
  - HTML5
  - Tailwind CSS (via CDN for development)
  - Font Awesome
  - Socket.IO Client

## Development

The application includes two npm scripts:

```bash
npm run dev    # Runs the server with nodemon for development
npm start      # Runs the server for production
```

## CORS Configuration

The application is configured to handle CORS (Cross-Origin Resource Sharing) with the following settings:

- Allowed Origin: `http://localhost:8000`
- Allowed Methods: GET, POST
- Credentials: Enabled
- Custom Headers: "my-custom-header"

To modify these settings, update the CORS configuration in `server/index.js`.

## Troubleshooting

### Common Installation Issues

1. Node.js not installed:
   - Download and install Node.js from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. Permission errors during npm install:
   - Windows: Run Command Prompt as Administrator
   - Mac/Linux: Use `sudo npm install`

3. Port 8000 already in use:
   - Change the PORT in your .env file
   - Or stop the process using port 8000

### Running Issues

1. "Module not found" errors:
   - Ensure you're in the correct directory
   - Try deleting node_modules and running `npm install` again

2. Connection errors:
   - Verify the server is running
   - Check if the correct port is being used
   - Ensure no firewall is blocking the connection

## Production Deployment Notes

1. For production, install Tailwind CSS as a PostCSS plugin instead of using the CDN:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

2. Environment Variables:
   - Set `NODE_ENV=production`
   - Configure appropriate `PORT` for production
   - Add any additional environment variables needed

3. Security Considerations:
   - Update CORS configuration for production domain
   - Implement rate limiting
   - Add request validation
   - Set up proper CORS configuration
   - Use security headers
   - Implement error handling and logging

4. Deployment Steps:
   - Set NODE_ENV to 'production'
   - Use a process manager (e.g., PM2)
   - Set up monitoring and logging
   - Configure reverse proxy (e.g., Nginx)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

[MIT License](LICENSE)
