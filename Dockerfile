FROM node:20.1-slim
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . ./
CMD [ "npm", "start" ]
