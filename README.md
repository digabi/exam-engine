[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=digabi/exam-engine&identifier=223358056)](https://dependabot.com)
[![Travis](https://travis-ci.org/digabi/exam-engine.svg?branch=master)](https://travis-ci.org/digabi/exam-engine)
[![Gitter](https://badges.gitter.im/abitti-dev/exam-engine.svg)](https://gitter.im/abitti-dev/exam-engine?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

[![Abitti.dev](https://abitti.dev/images/abittidev_logo.svg)](https://abitti.dev/)

[Abitti.dev](https://abitti.dev)

[Use of Abitti Trademark policy](https://abitti.dev/abitti-trademark.html)

[Documentation](https://digabi.github.io/exam-engine/MexDocumentation/)

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

Make sure the following are installed in your system:

- [Node.js](https://nodejs.org/en/) (Version 10 or later)
- [Firefox](https://www.mozilla.org/en-US/firefox/new/)

After Node.js has been installed, open a new terminal window and type the
following command.

```
$ npm install -g @digabi/exam-engine-cli
```

This installs the `ee` command-line program to your system.

# Creating a new exam

To create a new exam, use

```
$ ee new name-of-exam
```

This creates a `name-of-exam` directory, containing a basic `exam.xml` file and an
empty directory where to place attachments.

# Preview

To start a live preview of any exam on your computer, navigate to the exam
directory and run

```
$ ee preview
```

It's also possible to specify the exam explicitly.

```
$ ee preview path/to/exam.xml
```

# Using an exam in Abitti

To use an exam in Abitti, it must be first packaged as a transfer zip. It is
then possible to import it to Abitti by clicking "Tuo koe/För in prov".

To create a transfer zip, navigate to the exam directory and run

```
$ ee create-transfer-zip
```

Like before, it's also possible to specify the exam explicitly.

```
$ ee create-transfer-zip path/to/exam.xml
```

# Offline versions

Offline version refers to a static version of an exam that can be viewed in
a web browser without any additional tools.

To create an offline version of the exam, navigate to the exam directory and
use

```
$ ee create-offline
```

Like before, it's also possible to specify the exam explicitly.

```
$ ee create-offline path/to/exam.xml
```

# Intellectual property rights

Most of the artifacts in this repository are licensed under [LICENSE](LICENSE). Exceptions are:

- XHTML-based XML Schema Definition files [packages/mastering/schema](packages/mastering/schema).
  See [packages/mastering/schema/xhtml11.xsd](packages/mastering/schema/xhtml11.xsd) for the license.
- Abitti and the Abitti logo are EU trademarks registered by the Finnish Matriculation Examination
  Board (FMEB) under the codes 015833742 and 015838915.
  For detailed use rights, see [https://abitti.dev/abitti-trademark.html](https://abitti.dev/abitti-trademark.html)
- Several attachments in the SC sample exam [packages/exams/SC/](packages/exams/SC/) are third party material. See
  the `<e:reference>` tags in [packages/exams/SC/SC.xml](packages/exams/SC/SC.xml) for details.

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

Login to npm first with digabi user and run

```
$ env ANSWERS_PRIVATE_KEY=/absolute/path/to/answers-private-key.pem yarn lerna publish
```
