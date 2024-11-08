FROM oven/bun:1

WORKDIR /app

# Copy everything
COPY . .

# Install dependencies
RUN bun install

# Expose the port
EXPOSE 3000 

# Run the app
CMD ["bun", "start"]
