# Gunakan image Node versi LTS
FROM node:20-alpine

# Set working directory di dalam container
WORKDIR /app

# Copy package.json dan package-lock.json terlebih dahulu
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy semua source code
COPY . .

# Expose port (sesuaikan dengan app kamu, misalnya 3000)
EXPOSE 3000

# Jalankan aplikasi
CMD ["node", "index.js"]
