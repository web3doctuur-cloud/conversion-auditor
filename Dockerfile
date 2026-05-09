FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Install Playwright browsers
RUN npx playwright install chromium

# Build TypeScript
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start"]
