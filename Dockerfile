# Build arguments for versioning and metadata
ARG NODE_VERSION=24.12.0
ARG BUILD_DATE
ARG VCS_REF
ARG VERSION=0.1.0
ARG AUTHORS=nuh
ARG URL=https://github.com/NUH-Clinical-Innovation-Office/nextjs-frontend-template
ARG TITLE=Next.js Frontend Template
ARG DESCRIPTION=Production-ready Next.js application

# Stage 1: Dependencies
FROM node:${NODE_VERSION}-alpine AS deps

# Add metadata labels
LABEL org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.authors="${AUTHORS}" \
      org.opencontainers.image.url="${URL}" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.title="${TITLE}" \
      org.opencontainers.image.description="${DESCRIPTION}" \
      org.opencontainers.image.base.name="node:${NODE_VERSION}-alpine"

WORKDIR /app

# Install dependencies only when needed
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Stage 2: Builder
FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./

# Install all dependencies including dev dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Run linting and type checking
RUN npm run lint && npm run type-check

# Build the application
RUN npm run build

# Stage 3: Runner
FROM node:${NODE_VERSION}-alpine AS runner

# Re-declare build args for this stage
ARG BUILD_DATE
ARG VCS_REF
ARG VERSION

# Add metadata labels to final image
LABEL org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.authors="YongCheng Low" \
      org.opencontainers.image.url="${URL}" \
      org.opencontainers.image.version="${AUTHORS}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.title="${TITLE}" \
      org.opencontainers.image.description="${DESCRIPTION}" \
      org.opencontainers.image.base.name="node:${NODE_VERSION}-alpine"

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV APP_VERSION="${VERSION}"

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
