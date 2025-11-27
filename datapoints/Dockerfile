# Uporaba uradne Node.js slike kot osnova
FROM node:23-alpine

# Nastavitev delovne mape v vsebniku
WORKDIR /app

# Kopiranje package.json in package-lock.json
COPY package*.json ./

# Namestitev odvisnosti
RUN npm install mongodb --only=production

# Kopiranje aplikacije v vsebnik
COPY server.js .

# Določitev privzetega porta (npr. 3000)
EXPOSE 3000

# Ukaz za zagon aplikacije
CMD ["node", "server.js"]
