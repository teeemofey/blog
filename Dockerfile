FROM oven/bun:1

WORKDIR /app

# Copy everything
COPY . .

# Install dependencies
RUN bun install

# Expose the port
EXPOSE 6969

# Run the app
CMD ["bun", "start"]
