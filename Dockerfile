FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV NODE_OPTIONS=--max-old-space-size=1536
ENV GENERATE_SOURCEMAP=false
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY server ./server
COPY scripts ./scripts
COPY database ./database
COPY deploy/docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
  && apk add --no-cache bash >/dev/null 2>&1 || true
COPY --from=build /app/build ./build
ENV NODE_ENV=production
EXPOSE 3001
ENTRYPOINT ["/entrypoint.sh"]
