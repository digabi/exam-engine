[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=digabi/exam-engine&identifier=223358056)](https://dependabot.com)
[![Travis](https://travis-ci.com/digabi/exam-engine.svg?branch=master)](https://travis-ci.com/digabi/exam-engine.svg?branch=master)
[![Gitter](https://badges.gitter.im/abitti-dev/exam-engine.svg)](https://gitter.im/abitti-dev/exam-engine?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

[![Abitti.dev](https://abitti.dev/images/abittidev_logo.svg)](https://abitti.dev/)

[Abitti.dev](https://abitti.dev)

[Use of Abitti Trademark policy](https://abitti.dev/abitti-trademark.html)

[Documentation](https://digabi.github.io/exam-engine/MexDocumentation/koe.html)

Engine for the MEX exam format.

Provides:

- Exam preview tools for exam developers
- MEX format documentation
- Tools for mastering an exam to run it in Matriculation examination board's environment

**Make sure you test any MEX format exam manually before publishing it or using it with Abitti in
production. This manual testing should include holding the exam, answering all questions, grading
it, and checking that all examinees' answers are available.**

**The MEX format and this engine is still under development: All functionalities of the MEX format
do not yet work in Abitti. Breaking changes are also still possible without prior warning.**

# Setup

Environment has been tested to work in Debian Linux, Mac OS and on Windows 10 in WSL. For Windows 10 check https://docs.microsoft.com/en-us/windows/wsl/install-win10 to install WSL.

Make sure the following are installed in your system:

- [git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en/) (Version 10 or later)
- [Firefox](https://www.mozilla.org/en-US/firefox/new/)

```
$ npm install --global yarn
$ git clone https://github.com/digabi/exam-engine.git
$ cd exam-engine
$ yarn
```

# Preview

To start live preview of any exam on your computer, use the following commands:

```
$ cd exam-engine
$ yarn
$ yarn start path/to/the/exam.xml
```

This starts web server that automatically updates the exam in Firefox while
the XML file is being edited.

# Using an exam in Abitti

**[Abitti](https://oma.abitti.fi/) does not at the moment support all the features available
in exam-engine. There are warnings about unsupported features in the
[MEX format documentation](https://digabi.github.io/exam-engine/MexDocumentation/koe.html). If you
attempt to upload such an exam to Abitti, you likely get a misleading general error message.
Abitti also has some additional limits, like maximum size of attachment files.**

**Because of this, only [packages/mexamples/A_X/](packages/mexamples/A_X/) in the
sample exams directory [packages/mexamples/](packages/mexamples/) currently works
with Abitti.**

To use an exam in Abitti, the exam must be packaged manually as a transfer zip. It is then possible
to import it to Abitti using "Tuo koe/För in prov" functionality:

```
$ cd packages/mexamples/A_X                           # Go to the exam directory
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

To create offline versions into subdirectories of `/tmp`, use:

```
$ yarn offline path/to/exam.xml /tmp
```

# Intellectual property rights

Most of the artifacts in this repository are licensed under [LICENSE](LICENSE). Exceptions are:

- XHTML-based XML Schema Definition files [packages/mex/schema](packages/mex/schema).
  See [packages/mex/schema/xhtml11.xsd](packages/mex/schema/xhtml11.xsd) for the license.
- Abitti and the Abitti logo are EU trademarks registered by the Finnish Matriculation Examination
  Board (FMEB) under the codes 015833742 and 015838915.
  For detailed use rights, see [https://abitti.dev/abitti-trademark.html](https://abitti.dev/abitti-trademark.html)
- Several attachments in the SC sample exam [packages/mexamples/SC/](packages/mexamples/SC/) are third party material. See
  the `<e:reference>` tags in [packages/mexamples/SC/SC.xml](packages/mexamples/SC/SC.xml) for details.

# Development

The information in this section is only relevant for developers of the exam-engine itself.

## Compilation

Before doing any changes, you'll always want to command TypeScript to compile
any changes within the whole project automatically.

```
$ yarn watch
```

## Lint

```
$ yarn lint
```

## Tests

To run all tests

```
$ yarn test
```

To run a specific test or a specific set of tests, use

```
$ yarn test packages/foo/__tests__/testFoo.ts
$ yarn test packages/foo
```

If you've made changes to the code that affect exam mastering or rendering,
you need to update the test snapshots by running

```
$ yarn test -u
```

Travis CI runs tests on all branches and pull requests in https://travis-ci.org/digabi/exam-engine

## NPM releases

Login to npm first with digabi user.

## exam-engine

```
$ env ANSWERS_PRIVATE_KEY=/path/to/answers-private-key.pem yarn lerna publish
```
