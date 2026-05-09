FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies (Playwright browsers already in the base image)
RUN npm install

# Copy application code
COPY . .

# Build TypeScript (server only)
RUN npm run build -w server

# Set environment variable for browser location
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

EXPOSE 3001

CMD ["npm", "run", "start"]