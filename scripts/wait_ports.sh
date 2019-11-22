#!/bin/bash

backoff_array=(1 2 3 4 5 6 7 6 5 5 5 5 5 5 5 5 5 5 5 5 5 5)
for port in "$@"; do
    for i in `seq 0 21`; do
        printf "\033[0mping port $port ($i).."
        nc -z -w 1 localhost $port < /dev/null > /dev/null 2>&1 && printf "\033[1;32mOK\033[0m\n" && break
        printf "\033[1;33mRETRY..\033[0m\n"
        sleep ${backoff_array[$i]}
        false
    done
    [ $? -ne 0 ] && printf "\033[1;31mERROR: port ${port} not answering, exiting with error\033[0m\n" && exit 1
done
true
