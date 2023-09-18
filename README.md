[![Build](https://github.com/digabi/exam-engine/workflows/Build/badge.svg)](https://github.com/digabi/exam-engine/actions?query=workflow%3ABuild)
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

- [Node.js](https://nodejs.org/en/) (Version 12 or later)
- [Firefox](https://www.mozilla.org/fi-FI/firefox/new/)

After Node.js has been installed, open a new terminal window and type the
following command.

```
$ npm install -g @digabi/exam-engine-cli
```

This installs the `ee` command-line program to your system.

# Creating a new exam

To create a new exam, use

```
$ ee new Esimerkkikoe
```

This creates a `Esimerkkikoe` directory, containing a basic `exam.xml` file and an
empty `attachments` directory where to place attachments.

# Preview

To start a live preview of any exam on your computer, navigate to the exam
directory and run

```
$ ee preview
```

# Importing an exam to Abitti

To use an exam in Abitti, it must be first packaged as a transfer zip. It is
then possible to import it to Abitti by clicking "Tuo koe/För in prov".

To create a transfer zip, navigate to the exam directory and run

```
$ ee create-transfer-zip
```

This creates a transfer zip file in the exam directory for each language
version of the exam.

# Offline versions

Offline version refers to a static version of an exam that can be viewed in
a web browser without any additional tools.

To create an offline version of the exam, navigate to the exam directory and
use

```
$ ee create-offline
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

The information in this section is only relevant for developers.

## Architecture

Exam-engine is structured as a monorepo containing several NPM packages.

| Component                                           | Purpose                                                                                                                                                                                                                                                                                 |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [@digabi/exam-engine-core](packages/core)           | The main UI code responsible for rendering a mastered exam into HTML. It produces an AMD bundle containing several React components and a CSS file. This AMD bundle is packaged to every exam .mex file and loaded dynamically when taking the exam.                                       |
| [@digabi/exam-engine-mastering](packages/mastering) | Mastering is a step in which we take a source XML file, validate its contents, do some processing (e.g. calculate the maximum score and assign IDs for each question). A single source XML file will produce a separate mastered XML file for each language defined in the source XML. |
| [@digabi/exam-engine-rendering](packages/rendering) | Contains webpack-related code for previewing an exam or converting one into a static HTML file (also known as an "offline exam").                                                                                                                                                       |
| [@digabi/exam-engine-exams](packages/exams)         | Contains sample exams in the mex format.                                                                                                                                                                                                                                                |
| [@digabi/exam-engine-cli](packages/cli)             | Contains the `ee` CLI tool.                                                                                                                                                                                                                                                             |

## Preview

The `ee` client can be run with `npm run ee`. So to preview an exam, run

```
$ npm run ee preview path/to/exam.xml
```

## Compilation

Before doing any changes to the code, you'll want to command TypeScript to compile
any changes within the whole project automatically.

```
$ npm run watch
```

## Lint

```
$ npm run lint
```

## Tests

To run all tests

```
$ npm run test
```

To run a specific test or a specific set of tests, use

```
$ npm run test packages/foo/__tests__/testFoo.ts
$ npm run test packages/foo
```

If you've made changes to the code that affect exam mastering or rendering,
you need to update the test snapshots by running. Review changes the snapshots manually.

```
$ npm run test -- -u
```

Travis CI runs tests on all branches and pull requests in https://travis-ci.org/digabi/exam-engine

## NPM releases

First, login to npm using:

```
$ npm login
```

When publishing a prerelease, use:

```bash
$ ANSWERS_PRIVATE_KEY=/absolute/path/to/answers-private-key.pem npm run lerna publish --dist-tag next
```

With official releases you need to skip the `dist-tag` parameter:

```bash
$ ANSWERS_PRIVATE_KEY=/absolute/path/to/answers-private-key.pem npm run lerna publish
```

The commands prompt you for details about the release: just running them does not publish
anything yet.
