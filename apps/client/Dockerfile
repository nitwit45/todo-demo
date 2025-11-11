FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/ ./packages/
COPY apps/client/ ./apps/client/

# Install dependencies
RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/client

EXPOSE 3000

CMD ["pnpm", "dev"]

