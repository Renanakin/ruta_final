# Use Node.js 20-alpine for a lightweight image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy backend package files
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy backend source code
COPY . .

# Alchemist is now inside the backend folder, so we copy it directly
# src/modules/ai/ai.routes.js (3 levels) -> root
COPY alchemist/ /app/alchemist/

# Ensure the database file isn't overwritten if mounted, 
# but provide a base if needed. 
# Note: database.sqlite should typically be a volume.

# Expose backend port
EXPOSE 3002

# Start the application
CMD ["npm", "start"]
