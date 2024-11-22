## Abitti.dev take-off hands-on

### 17.12.2019

- WiFi: ReittiPublic
- Tämä esitys: https://bit.ly/abittidev
- Gitter: https://gitter.im/abitti-dev/exam-engine (NB! The MEB team is not actively following this channel - updated 2024-NOV-21)

Pasi Huhtiniemi / Sakumatti Luukkonen / Aleksi Ahtiainen / Mikko Reinikainen / Eero Anttila

---

## Agenda

1. Setup environment
2. Initialize Exam Engine
   2.5. Glögi @ 16:00
3. Create exam
4. Use exam in Abitti
5. Exam editing, the MEB way
6. Q&A

---

## 1. Setup

- `git`
- Node.js 10+ (eg. from [NodeSource](https://github.com/nodesource/distributions#installation-instructions))
- Firefox

> Recommended: Visual Studio Code with XML Extension

---

## Windows / Mac / Linux ?

---

## Setup: Ubuntu @ WSL

https://gitter.im/abitti-dev/exam-engine?at=5df799fbe47fb31eb7c12cf3

## Setup: Debian 10 @ WSL

- Install `git` and NodeJS:

      sudo apt-get install git curl
      curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
      sudo apt-get install nodejs

- Recommended:

  - Install Firefox and VSCode on Windows
  - Install JDK for XML Extension in VSCode:

        sudo apt-get install wget openjdk-11-jdk

  - Start VSCode and install XML Extension

---

## Setup: Mac

- Install `git` and NodeJS (here from HomeBrew):

      brew install git node

- Install Firefox
- Recommended:

  - Install Visual Studio Code
  - Install JDK for XML Extension in VSCode:

        brew install openjdk

  - Start VSCode and install XML Extension

---

## Setup: Ubuntu 18.04.3 (LTS)

- Install `git` and NodeJS:

      sudo apt install git
      sudo snap install node --channel=12/stable --classic

- Firefox should already be installed
- Recommended: Install Visual Studio Code and JDK for XML Extension:

      sudo snap install code --classic
      sudo apt install openjdk-8-jdk

- Start VSCode and install XML Extension

---

## Goal 1

      15:55 $ node -v
      v12.8.0

---

## 2. Initialize Exam Engine

    git clone https://github.com/digabi/exam-engine
    cd exam-engine
    npm install

---

## 2.5 Updating Exam Engine

       cd exam-engine
       git pull
       npm install

- If you have made edits to exam-engine files, discard (`git checkout .`) or stash (`git stash`) your modifications

---

## 2.9 Get some Glögi

---

## 3. Create exam

- Create empty exam

      cd exam-engine
      npm run new hello

- Open exam in editor

      code hello/exam.xml

- Start exam preview

      npm run start hello

- Demo/hands-on: See changes or error messages (try deleting section) in preview after (auto)save

---

## 4. Use exam in Abitti

- Create transfer.zip:

      cd exam-engine
      npm run create-transfer-zip hello
      ls -l hello

- Upload `hello_fi-FI_transfer.zip` to Abitti: `Tuo koe (.zip)`

- Demo/hand-on: Download exam. Have exam. Upload answers. Score. Grade. Return.

---

## 5. Exam editing the MEB way

- Good XML editor
- Preview
- Latest [documentation](https://digabi.github.io/exam-engine/MexDocumentation/)

---

## XML Editor

- Recommendation:

  - Visual Studio Code
  - and XML Extension (redhat.vscode-xml, needs JDK, openjdk-8-jdk ok)

- For:

  - Realtime validation
  - Realtime code completion

- Demo/hands-on:

       code hello/exam.xml

---

## Answer type examples

- See [Documentation](https://digabi.github.io/exam-engine/MexDocumentation/)

- Copy-paste to your exam

- Demo/hands-on

---

## Example exams: mother tongue

    cd exam-engine/packages/exams

- A_X
  - basic rich-text answer types
- A_E
  - global material

---

## Example exams: language (SC)

- both language version in same exam file
- audio-test
- audio attachment with limited listening times
- choice answer
- dropdown answer
- single-line text answer (productive, not centrally graded)
- scored-text-answer (productive answer, centrally graded)

---

## Example exams: real (FF)

- max-answers (not supported Abitti)

---

## Example exams: math (N)

    <e:section cas-forbidden="true">

---

## 6. Questions?

---

## Thank you!
