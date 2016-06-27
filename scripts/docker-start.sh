#!/bin/sh
echo postgres://hotlap:hotlap@db/hotlap > prodDB.conf
./wait-for-it.sh db:5432 -t 5 -- npm start
