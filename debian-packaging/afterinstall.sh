#!/usr/bin/env bash

function afterinstall() {
    # Backwards compatibility: add a symlink to the old schema directory
    rm /home/digabi/exam-engine/schema
    ln -s /home/digabi/exam-engine/packages/mastering/schema /home/digabi/exam-engine/schema

    rm -rf /home/digabi/Työpöytä/mex-demo
    mkdir /home/digabi/Työpöytä/mex-demo

    exams=( MexDocumentation FF A_X SC N )
    for exam in "${exams[@]}"
    do
        mkdir -p /home/digabi/Työpöytä/mex-demo/$exam
        cp /home/digabi/exam-engine/packages/exams/$exam/$exam.xml /home/digabi/Työpöytä/mex-demo/$exam/koe.xml
        sed -i 's|xsi:schemaLocation="http://ylioppilastutkinto.fi/exam.xsd ../../packages/mastering/schema/exam.xsd"|xsi:schemaLocation="http://ylioppilastutkinto.fi/exam.xsd file:///home/digabi/exam-engine/schema/exam.xsd"|' /home/digabi/Työpöytä/mex-demo/$exam/koe.xml
        sed -i 's|xsi:schemaLocation="http://ylioppilastutkinto.fi/exam.xsd https://abitti.dev/schema/exam.xsd"|xsi:schemaLocation="http://ylioppilastutkinto.fi/exam.xsd file:///home/digabi/exam-engine/schema/exam.xsd"|' /home/digabi/Työpöytä/mex-demo/$exam/koe.xml
        cp -r /home/digabi/exam-engine/packages/exams/$exam/attachments /home/digabi/Työpöytä/mex-demo/$exam
        ln -s /home/digabi/exam-engine/bin/start-mex /home/digabi/Työpöytä/mex-demo/$exam/start-mex
    done

    cp -f /home/digabi/exam-engine/desktop/*.desktop "$(xdg-user-dir DESKTOP)"
}

export -f afterinstall
su digabi -c "bash -c afterinstall"
