FROM mcr.microsoft.com/playwright:v1.44.0-jammy

WORKDIR /app

# Copy package files for workspace setup
COPY package.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/

# Install all dependencies (we need this for the workspace structure)
RUN npm install

# Copy all source code
COPY . .

# Build the server
RUN npm run build -w server

# Set environment variables
ENV PORT=4000
ENV NODE_ENV=production

EXPOSE 4000

# Start the server
CMD ["npm", "start", "-w", "server"]
