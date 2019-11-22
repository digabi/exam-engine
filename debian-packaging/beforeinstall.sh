#!/usr/bin/env bash

function beforeinstall() {
    echo "BEFOREINSTALL: Do nothing yet"
}

export -f beforeinstall
su digabi -c "bash -c beforeinstall"
