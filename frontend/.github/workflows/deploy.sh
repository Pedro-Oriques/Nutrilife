#!/usr/bin/env bash

set -e 

#test
readonly IMG_NAME=$1
readonly NEW_VERSION=$2
readonly ROOT_PATH=$3
readonly PORT=$4
readonly PASSWD=$5

if [ -n "$(docker ps -a --format '{{.Names}}' | grep "^${IMG_NAME}$")" ]; then
  
  if [ "$( docker container inspect -f '{{.State.Status}}' $IMG_NAME )" = "running" ]; then
    old_version_id=$(docker ps -aqf "name=$IMG_NAME")
    docker stop $old_version_id && docker remove $old_version_id
  fi
fi

docker run -d --name "$IMG_NAME" "$NEW_VERSION"

APP_URL="$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$IMG_NAME"):$PORT"

export APP_URL IMG_NAME

envsubst '$IMG_NAME $APP_URL' < "$ROOT_PATH/nginx.conf.template" > "/etc/nginx/sites-enabled/$IMG_NAME-nginx.conf"

echo "$PASSWD" | sudo -S service nginx stop

echo "$PASSWD" | sudo -S certbot certonly --standalone --non-interactive --agree-tos --preferred-challenges http -d $IMG_NAME.qacoders.dev.br

echo "$PASSWD" | sudo -S service nginx start

if [ -n "${ROOT_PATH}" ]; then
  rm -rf ${ROOT_PATH}/*
fi
