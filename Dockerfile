# Use Node.js v22 official image (LTS version)
FROM node:22

# Set working directory
WORKDIR /usr/src/app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml to ensure proper caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install

# Copy the rest of the app's code
COPY . .

# Expose the port
EXPOSE ${PORT}

# Start the application
CMD ["pnpm", "run", "dev"]
