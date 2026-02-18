FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (use ci for reproducible builds)
RUN npm ci --omit=dev

# Copy application code
COPY . .

# Run as non-root user
RUN addgroup -g 1001 -S nodeapp && adduser -S nodeapp -u 1001 -G nodeapp
RUN chown -R nodeapp:nodeapp /app
USER nodeapp

EXPOSE 1234

# Bind to all interfaces so the server is accessible from outside the container
ENV HOST=::
ENV PORT=1234

CMD [ "npm", "start" ]
