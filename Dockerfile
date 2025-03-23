# Stage 1: Build the app
FROM node:18-alpine AS build

WORKDIR /app

# Устанавливаем зависимости (dev и prod)
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Копируем исходники и генерим Prisma Client + билд
COPY . .
RUN npx prisma generate
RUN yarn build

# Stage 2: Production only
FROM node:18-alpine

WORKDIR /app

# Устанавливаем только прод-зависимости
COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile

# Копируем только билд и необходимые файлы
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@your-other-needed-pkgs ./node_modules/@your-other-needed-pkgs

# Prisma Client работает, даже без prisma-cli, т.к. уже сгенерен

EXPOSE 5000
CMD ["yarn": "start"]

