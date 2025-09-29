# Base image for React
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN npm install

# Build the React app
RUN npm run build

# Install lightweight web server
RUN npm install -g serve

# Serve the build folder
CMD ["serve", "-s", "build", "-l", "3000"]
