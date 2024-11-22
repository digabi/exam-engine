#!/usr/bin/env bash

function afterinstall() {
    # Add ee to $PATH
    local NODE_VERSION=$(< /home/digabi/exam-engine/.nvmrc)
    cat > /home/digabi/bin/ee << EOF
#!/bin/bash

PUPPETEER_CACHE_DIR=/home/digabi/exam-engine/.cache /home/digabi/digabi-top/nvm/versions/node/v$NODE_VERSION/bin/node /home/digabi/exam-engine/packages/cli/dist/index.js "\$@"
EOF
    chmod +x /home/digabi/bin/ee

    # Backwards compatibility: add a symlink to the old schema directory
    ln -sf /home/digabi/exam-engine/packages/mastering/schema /home/digabi/exam-engine/schema

    rm -rf /home/digabi/Työpöytä/mex-demo
    mkdir /home/digabi/Työpöytä/mex-demo

    # Link sample exams to the desktop.
    exams=( MexDocumentation FF A_X SC N )
    for exam in "${exams[@]}"
    do
        mkdir -p /home/digabi/Työpöytä/mex-demo/$exam
        cp /home/digabi/exam-engine/packages/exams/$exam/$exam.xml /home/digabi/Työpöytä/mex-demo/$exam/koe.xml
        sed -i 's|xsi:schemaLocation="http://ylioppilastutkinto.fi/exam.xsd ../../packages/mastering/schema/exam.xsd"|xsi:schemaLocation="http://ylioppilastutkinto.fi/exam.xsd file:///home/digabi/exam-engine/schema/exam.xsd"|' /home/digabi/Työpöytä/mex-demo/$exam/koe.xml
        sed -i 's|xsi:schemaLocation="http://ylioppilastutkinto.fi/exam.xsd https://abitti.net/schema/exam.xsd"|xsi:schemaLocation="http://ylioppilastutkinto.fi/exam.xsd file:///home/digabi/exam-engine/schema/exam.xsd"|' /home/digabi/Työpöytä/mex-demo/$exam/koe.xml
        cp -r /home/digabi/exam-engine/packages/exams/$exam/attachments /home/digabi/Työpöytä/mex-demo/$exam
    done

    cp -f /home/digabi/exam-engine/desktop/*.desktop "$(xdg-user-dir DESKTOP)"
}

export -f afterinstall
su digabi -c "bash -c afterinstall"
