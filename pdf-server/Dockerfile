FROM node:latest
WORKDIR /pdf-server
COPY package.json ./
RUN npm install
COPY server.js ./
COPY /public ./public
EXPOSE 4001
CMD ["npm", "start"]
