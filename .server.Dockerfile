FROM node:16

ENV TZ=Asia/Shanghai 
ENV  DEBIAN_FRONTEND=noninteractive

RUN apt install -y tzdata 
RUN ln -fs /usr/share/zoneinfo/${TZ} /etc/localtime 
RUN echo ${TZ} > /etc/timezone 
RUN dpkg-reconfigure --frontend noninteractive tzdata 

WORKDIR /app

COPY ./package.json /app/package.json
COPY ./build /app/build

RUN npm -g install pnpm
RUN pnpm i --production

CMD ["node", "build"]