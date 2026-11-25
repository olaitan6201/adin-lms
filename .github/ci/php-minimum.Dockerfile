FROM composer:2 AS composer
FROM php:8.4.1-cli-bookworm@sha256:246d2ca7e9cf21c4e7c354ce87e87bf1ad6d41b2061c77668845e04a8f8889d4

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpng-dev libzip-dev unzip \
    && docker-php-ext-install -j2 bcmath gd zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer /usr/bin/composer /usr/local/bin/composer
ENV COMPOSER_HOME=/tmp/composer
WORKDIR /app
