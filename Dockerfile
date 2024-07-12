# Use an official node image as the base image
FROM node:21

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install -f

# Copy the rest of the application code to the working directory
COPY . .

# Set the command to run the server and serve the app
CMD ["npm", "start"]

# Expose the port the app runs on
EXPOSE 3000
