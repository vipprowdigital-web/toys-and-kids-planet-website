# console\Dockerfile


# -------------------------------
# Development dependencies
# -------------------------------
FROM node:20-alpine AS development-dependencies-env

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .


# -------------------------------
# Production dependencies
# -------------------------------
FROM node:20-alpine AS production-dependencies-env

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev


# -------------------------------
# Build stage
# -------------------------------
FROM node:20-alpine AS build-env

WORKDIR /app
COPY . .
COPY --from=development-dependencies-env /app/node_modules ./node_modules
RUN npm run build


# -------------------------------
# Runtime (final image)
# -------------------------------
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY --from=production-dependencies-env /app/node_modules ./node_modules
COPY --from=build-env /app/build ./build

EXPOSE 3000

CMD ["npm", "run", "start"]