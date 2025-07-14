# Use Node.js as the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (production only)
RUN npm install --production

# Copy the rest of the service files
COPY . .

# Start the application using env PORT from --env-file
CMD ["npm", "start"]
