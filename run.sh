#!/bin/bash

docker build . -t zeayal/node-send-email 

docker run -p 49160:8080 -d zeayal/node-send-email