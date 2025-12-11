# Stage 1: Install dependencies
FROM node:20-alpine AS builder
WORKDIR /app

# Install netcat for wait-for-it.sh
RUN apk add --no-cache netcat-openbsd

# Copy package files
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app

# Install netcat for wait-for-it.sh
RUN apk add --no-cache netcat-openbsd

# Copy wait-for-it script and start script
COPY wait-for-it.sh ./wait-for-it.sh
COPY start.sh ./start.sh
# Convert line endings and make executable
RUN apk add --no-cache dos2unix && \
    dos2unix ./wait-for-it.sh ./start.sh && \
    chmod +x ./wait-for-it.sh ./start.sh && \
    apk del dos2unix

# Copy node_modules and application code
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/app ./app
COPY --from=builder /app/package*.json ./

ENV PORT=4000
EXPOSE 4000

CMD ["./start.sh"]
