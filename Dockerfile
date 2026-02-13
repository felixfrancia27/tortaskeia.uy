# ===========================================
# Stage 1: Development
# ===========================================
FROM node:20-alpine AS development

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

EXPOSE 4000

CMD ["npm", "run", "start"]

# ===========================================
# Stage 2: Build
# ===========================================
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build:ssr

# ===========================================
# Stage 3: Production
# ===========================================
FROM node:20-alpine AS production

WORKDIR /app

# Copy built application
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

EXPOSE 4000

ENV NODE_ENV=production

CMD ["node", "dist/tortaskeia/server/server.mjs"]
