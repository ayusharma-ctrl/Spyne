# App - Spyne

A web app where users can list cars for sale and browse available listings.

## Getting Started

Follow the instructions below to set up the project locally on your machine.

### Installation

1. **Clone the repository:**

   ```bash
   https://github.com/ayusharma-ctrl/Spyne.git
   
2. **Navigate to the project directory:**
   ```bash
   cd Spyne.git

3. **Install dependencies:**
   ```bash
   npm install

### Configuration

Create a `.env` file in the root directory of your project and add the following environment variables:

  ```bash
  # MongoDb connection Uri
  DATABASE_URL="your-mongo-connection-uri"
  REDIS_URL="your-redis-database-url"
  CLOUDINARY_CLOUD_NAME="cloud-name"
  CLOUDINARY_API_KEY="your-key"
  CLOUDINARY_API_SECRET="your-secret"
  NODE_ENV="development"
  JWT_SECRET="random-string"
  NEXT_PUBLIC_X_API_KEY="your-secrect-key-to-include-in-headers"
  ```

### Running the Project

  ```bash
    npm run dev
  ```

### Build for production:
  ```bash
    npm run build
  ```
  
### API Documentation
 
 We have a Swagger support. Simply visit: "http://localhost:3000/api-doc" or "https://spyne-amber.vercel.app/api-doc"