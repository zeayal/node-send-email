#!/bin/bash


docker rm -f node-send-email
docker image rm -f zeayal/node-send-email


docker build . -t zeayal/node-send-email 

docker run --name nodeEmail -p 49160:8080 -d zeayal/node-send-email 