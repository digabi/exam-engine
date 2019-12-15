## Abitti.dev take-off hands-on

### 17.12.2019

---

# Agenda

- Setup
- Creating exam
- Using exam in Abitti
- Advanced exam editing

---

## Setup

- Command line knowledge is a must
- `git`
- Node.js 10+
- Firefox
- Visual Studio Code with XML Extension **highly** recommended, but other editors with good XML schema support should work as well

> https://github.com/digabi/exam-engine#setup

---

## Setup: Mac

- Install `git` and NodeJS (here from HomeBrew):

      brew install git node
      npm install -g yarn

- Install Firefox
- Install Visual Studio Code
- Install JDK for XML Extension in VSCode:

      brew install openjdk

- Start VSCode and install XML Extension

---

## Setup: Ubuntu 18.04.3 (LTS)

- Install `git` and NodeJS:

      sudo apt install git
      sudo snap install node --channel=12/stable --classic
      # yarn got installed above

- Firefox should already be installed
- Install Visual Studio Code and JDK for XML Extension:

      sudo snap install code --classic
      sudo apt install openjdk-8-jdk

- Start VSCode and install XML Extension

---

## Setup: Debian 10 @ WSL

- Install `git` and NodeJS:

      sudo apt-get install git curl
      curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
      sudo apt-get install nodejs

- Install Firefox and Visual Studio Code on Windows
- Install JDK for XML Extension in VSCode:

      sudo apt-get install wget openjdk-11-jdk
      # (wget is needed by vscode server)

- Start VSCode and install XML Extension

---

## Creating exam

- Create empty exam

      cd exam-engine
      yarn new hello

- Open exam in editor

      code hello/exam.xml

- Start exam preview

      yarn start hello/exam.xml

- Edit: See changes or error messages (try deleting section) in preview after (auto)save

---

## Using exam in Abitti

- Create transfer.zip:

      cd hello
      mkdir tmp; cp *xml tmp/exam.xml; cd attachments; \
      zip attachments.zip *; cd ../tmp; zip ../transfer.zip *;\
      cd ..; unzip -l transfer.zip

- Upload it to Abitti: `Tuo koe (.zip)`

- Download exam. Have exam. Upload answers.

> https://github.com/digabi/exam-engine/tree/feature/2020#using-an-exam-in-abitti

---

## Advanced exam editing

- Visual Studio Code
  - XML Extension (redhat.vscode-xml, needs JDK, openjdk-8-jdk ok)

---

## Answer type examples
