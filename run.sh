#!/usr/bin/env bash
#
# Pricefeed docker manager
#

# function for warning($1 = text)
function boldtext() {
  echo -e `tput bold`"$1"`tput sgr0` >&2
}

DOCKER_NAME="pricefeed"
BOLD=$(tput bold)
NORMAL=$(tput sgr0)

#echo "Bash version ${BASH_VERSION}..."

if [[ ! -f app/config.json ]]; then
  echo -e "\e[1m\e[34m app/config.json missing, copying example \e[0m";
  cp app/config.json.example app/config.json
  chmod 600 app/config.json
  echo -e "\e[1m\e[34m Edit the app/config.json file before starting the app \e[0m";
  exit 1
fi

build() {
  boldtext "Building docker container"
  time docker build -t pricefeed .
}

rebuild() {
  boldtext "Rebuilding docker container"
  docker rmi pricefeed
  time docker build -t pricefeed .
  docker ps -a | grep 'Exited' | awk '{print $1}' | xargs docker rm ; docker images | grep '<none>' | awk '{print $3}' | xargs docker rmi -f
}

install_docker() {
  sudo apt -y update
  sudo apt -y install curl git
  curl https://get.docker.com | sh
  if [ "$EUID" -ne 0 ]; then
    echo "Adding user $(whoami) to docker group"
    sudo usermod -aG docker $(whoami)
    echo "IMPORTANT: Please re-login (or close and re-connect SSH) for docker to function correctly"
  fi
}

#The container name has to be after all of the arguments.

start() {
  [[ ! -z $(docker ps -a | grep $DOCKER_NAME) ]] && boldtext "Container already started"  ||  ( boldtext "Starting container..." && docker run -itd --restart always -h $DOCKER_NAME -e TZ=$(cat /etc/timezone) -v $(pwd)/app:/home/pricefeed/app -u `stat -c "%u:%g" app` --name $DOCKER_NAME pricefeed)
  logs
}

stop() {
  [[ ! -z $(docker ps -a | grep $DOCKER_NAME) ]] && ( boldtext "Stopping container..."  ; docker stop $DOCKER_NAME ; docker rm -f $DOCKER_NAME ) || boldtext "Container not running"
}

enter() {
  [[ ! -z $(docker ps -a | grep $DOCKER_NAME) ]] && ( docker start $DOCKER_NAME && docker exec -it $DOCKER_NAME bash ) || boldtext "Container not running"
}

logs() {
  echo "Monitoring the logs: "
  docker logs --tail=30 -f $DOCKER_NAME
}

help() {
  echo "Usage: $0 COMMAND"
  echo
  echo "Commands: "
  echo "    install_docker - install docker"
  echo "    build - build container (from docker file)"
  echo "    rebuild - rebuild container (from docker file)"
  echo "    start - starts container"
  echo "    restart - restarts container"
  echo "    stop - stops container"
  echo "    logs - monitor the pricefeed logs"
  echo "    enter - enter a bash session in the container"
  echo
  exit
}

case $1 in
  install_docker)
    install_docker
  ;;
  build)
    build
  ;;
  rebuild)
    rebuild
  ;;
  start)
    start
  ;;
  restart)
    stop
    start
  ;;
  stop)
    stop
  ;;
  logs)
    logs
  ;;
  enter)
    enter
  ;;
  *)
    echo "Invalid cmd"
    help
  ;;
esac
