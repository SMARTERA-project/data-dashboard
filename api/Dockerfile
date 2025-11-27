FROM node:latest
WORKDIR /app
COPY package.json ./
RUN npm install
COPY index.js ./
COPY models/ ./models/
COPY resolvers.js ./resolvers.js
COPY schema.js ./schema.js
EXPOSE 4000
CMD ["npm", "start"]
