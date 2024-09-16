# Base image
FROM ruby:3.2.2

# Install dependencies
RUN apt-get update -qq && apt-get install -y \
    build-essential \
    libpq-dev \
    nodejs \
    mariadb-client

# Set working directory
WORKDIR /app

# Copy Gemfile and Gemfile.lock
COPY ./Gemfile* /app

# Install gems
RUN bundle install

# Copy the main application
COPY . /app

# The main command to run when the container starts.
CMD ["rails", "server", "-b", "0.0.0.0"]
