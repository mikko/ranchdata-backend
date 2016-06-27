FROM node:6-onbuild
EXPOSE 3000
CMD /usr/src/app/docker-start.sh
ADD ./scripts/docker-start.sh ./scripts/wait-for-it.sh /usr/src/app/
