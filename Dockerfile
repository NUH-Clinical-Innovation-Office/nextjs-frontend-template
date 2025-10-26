# Build arguments for versioning and metadata
ARG NODE_VERSION=24.10.0

# Stage 1: Builder
FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /app

# Install all dependencies including dev dependencies for build
COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Runner
FROM node:${NODE_VERSION}-alpine AS runner

# Metadata arguments
ARG BUILD_DATE
ARG REVISION
ARG VERSION

# Add metadata labels to final image
LABEL org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.authors="nuh" \
      org.opencontainers.image.url="https://github.com/NUH-Clinical-Innovation-Office/nextjs-frontend-template" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${REVISION}" \
      org.opencontainers.image.title="Next.js Frontend Template" \
      org.opencontainers.image.description="Production-ready Next.js application" \
      org.opencontainers.image.base.name="node:${NODE_VERSION}-alpine"

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]
