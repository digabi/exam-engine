[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=digabi/exam-engine&identifier=223358056)](https://dependabot.com)
[![Travis](https://travis-ci.com/digabi/exam-engine.svg?branch=master)](https://travis-ci.com/digabi/exam-engine.svg?branch=master)
[![Gitter](https://badges.gitter.im/abitti-dev/exam-engine.svg)](https://gitter.im/abitti-dev/exam-engine?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

[![Abitti.dev](https://abitti.dev/images/abittidev_logo.svg)](https://abitti.dev/)

[Abitti.dev](https://abitti.dev)

[Use of Abitti Trademark policy](https://abitti.dev/abitti-trademark.html)

Engine for the MEX exam format.

Provides:
* Exam preview tools for exam developers
* MEX format documentation
* Tools for mastering an exam to run it in Matriculation examination board's environment

**Make sure you test any MEX format exam manually before publishing it or using it with Abitti in
production. This manual testing should include holding the exam, answering all questions, grading
it, and checking that all examinees' answers are available.**

**The MEX format and this engine is still under development: All functionalities of the MEX format
do not yet work in Abitti. Breaking changes are also still possible without up-front warning.**

# Setup

Environment has been tested to work in Debian Linux, Mac OS and on Windows 10 in WSL. For Windows 10 check https://docs.microsoft.com/en-us/windows/wsl/install-win10 to install WSL.

Make sure the following are installed in your system:

* git (`sudo apt install git`)
* make (`sudo apt install make`)
* nvm from https://github.com/nvm-sh/nvm/blob/master/README.md#install--update-script
* node. Use:
```
$ nvm install
```
to install the version specified in [.nvmrc](.nvmrc)
* yarn and npm:
```
$ nvm use
$ npm install --global yarn
$ npm install --global npm
```
* Firefox web browser

# MEX format documentation

The MEX format documentation is written as an exam itself. To open it using the preview, run:
```
$ git clone git@github.com:digabi/exam-engine.git
$ cd exam-engine
$ make start              # Makefile runs nvm, yarn, and necessary scripts from package.json
```

This starts the preview of
[packages/mexamples/exams/MexDocumentation/MexDocumentation.xml](packages/mexamples/exams/MexDocumentation/MexDocumentation.xml)

Offline version of the documentation exam is hosted at
[https://digabi.github.io/exam-engine/MexDocumentation/koe.html](https://digabi.github.io/exam-engine/MexDocumentation/koe.html).

# Preview

To start live preview of any exam, use commands:

```
$ nvm use
$ yarn install
$ yarn start packages/mexamples/exams/MexDocumentation/MexDocumentation.xml
```

This starts `webpack-dev-server` that automatically updates the exam in Firefox when
the XML file is being edited.

# XML schema

Customized XML schema in directory `packages/mex/schema` is helpful when editing MEX format. For example,
editor can warn you when a mandatory element like `<e:languages>` is missing. With Visual Studio Code you
can use https://marketplace.visualstudio.com/items?itemName=redhat.vscode-xml , and add the local path
to `packages/mex/schema/exam.xsd` in `xsi:schemaLocation`:

```
<e:exam
  ...
  xsi:schemaLocation="http://ylioppilastutkinto.fi/exam.xsd ../../packages/mex/schema/exam.xsd"
  ...
  >
```

# Using an exam in Abitti

**[Abitti](https://oma.abitti.fi/) does not at the moment support all the features available
in exam-engine. There are warnings about unsupported features in the
[MEX format documentation](https://digabi.github.io/exam-engine/MexDocumentation/koe.html). If you
attempt to upload such an exam to Abitti, you likely get a misleading general error message.
Abitti also has some additional limits, like maximum size of attachment files.**

**Because of this, only [exams/A_X/](exams/AX/) in the sample exams directory [exams/](exams/)
currently works with Abitti.**

To use an exam in Abitti, the exam must be packaged manually as a transfer zip. It is then possible
to import it to Abitti using "Tuo koe/För in prov" functionality:

```
$ cd exams/A_X                                        # Go to the exam directory
$ mkdir tmp                                           # Create a new empty temporary directory
$ cp A_X.xml tmp/exam.xml                             # Copy xml to exam.xml
$ cd attachments
$ zip -r ../tmp/attachments.zip *                     # Create the attachments.zip
$ cd ../tmp
$ zip ../MyExam_transfer.zip exam.xml attachments.zip # Create the transfer zip
$ cd ..
```

# Offline version

Offline version refers to a standalone version of an exam that can be viewed in web browser without
additional tools.

To create offline versions into subdirectories of `tmp/`, use:

```
$ yarn offline packages/mexamples/exams/MexDocumentation/MexDocumentation.xml tmp
```

# Intellectual property rights

Most of the artifacts in this repository are licensed under [LICENSE](LICENSE). Exceptions are:

* XHTML-based XML Schema Definition files [packages/mex/schema](packages/mex/schema).
  See [packages/mex/schema/xhtml11.xsd](packages/mex/schema/xhtml11.xsd) for the license.
* Abitti and the Abitti logo are EU trademarks registered by the Finnish Matriculation Examination
  Board (FMEB) under the codes 015833742 and 015838915.
  For detailed use rights, see [https://abitti.dev/abitti-trademark.html](https://abitti.dev/abitti-trademark.html)

# Development

The information in this section is only relevant for developers of the exam-engine itself.

## Lint

```
$ make lint
```

## Tests

To run all tests
```
$ make test
```

To update the fixtures:
```
$ OVERWRITE_FIXTURES=true make test
```

To run only unit-tests:
```
$ make unit-tests
```

To run browser tests with puppeteer debug window:
```
$ PUPPETEER_DEBUG=1 make browser-tests
```

You can use grep to run subset of tests. Note: Run tests using `make` commands first to handle dependencies.
```
$ yarn browser-tests:dev --grep "MexDocumentation"
```

## npm releases
Login to npm first with digabi user.
Makefile has commands for npm releases that take version as a parameter and will
automatically update the version in package.json. The parameter can also be
"major", "minor" or "patch"

Pre-releases are published by postfixing the version number with "-0" where 0 is
the pre-release version. i.e. 2.1.0-0, 2.1.0-1, 2.1.0-2 and so on.

**When updating `@digabi/exam-engine`: Note that `@digabi/mex` depends on it and new version
will not be used in mastered exams unless you update @digabi/exam-engine version
in `packages/mex/package.json` and publish a new version of `@digabi/mex`, too.**

## exam-engine
```
$ make publish-exam-engine version=2.3.0
```
## mex
```
$ make publish-mex-pkg version=1.2.0
```
## mexamples
```
$ make publish-mexamples version=2.4.5 k=path/to/secret/private-key.pem
```
