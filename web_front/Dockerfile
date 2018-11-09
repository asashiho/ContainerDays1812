# Base Image
FROM node:8.10.0

# Maintainer
LABEL maintainer "Shiho ASA"

# Install Path
ENV APP_PATH /opt/webfront
WORKDIR $APP_PATH

COPY package.json ./
RUN npm cache clean --force && npm install

# Copy files required for the app to run
COPY app.js $APP_PATH/
COPY config.js $APP_PATH/

COPY bin/ $APP_PATH/bin/
COPY public/ $APP_PATH/public/
COPY routes/ $APP_PATH/routes/
COPY views/ $APP_PATH/views/

# Port number the container should expose
EXPOSE 3000

# Run the application
CMD [ "npm", "run", "start" ]
