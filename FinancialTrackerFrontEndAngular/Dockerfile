# Etapa de build
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Forzar reconstrucción sin caché
RUN npm run build --configuration=docker --no-cache

# Etapa de nginx
FROM nginx:alpine
COPY --from=build /app/dist/financial-tracker/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
