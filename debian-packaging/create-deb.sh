#!/bin/bash

set -ex
DEB_PACKAGE_SOURCE_DIR=debian-packaging/package-user-root/
DEB_VERSION=1.1.${BUILD_NUMBER}

# cleanup
rm *.deb || true
find debian-packaging/package-user-root/exam-engine/ ! -name bin ! -name desktop -maxdepth 1 -mindepth 1 -print0 | xargs -0 rm -rf

# find is used to avoid infinite recursion in copying
cp -R $(find . -maxdepth 1 -mindepth 1 ! -name ".git" ! -name "debian-packaging" ! -name dist) debian-packaging/package-user-root/exam-engine/

fpm -C ${DEB_PACKAGE_SOURCE_DIR} -s dir -n exam-engine-telasw -a amd64 --prefix /home/digabi --deb-user 1000 \
    --deb-group 1000 --depends sox --depends code-plugins --depends pandoc -t deb -v ${DEB_VERSION} \
    --before-install debian-packaging/beforeinstall.sh \
    --after-install debian-packaging/afterinstall.sh \
    --deb-no-default-config-files --exclude '*/.git/*' .
