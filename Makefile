# -*- Makefile -*-

PRINT_TARGET ?= @echo $@

# Prefixing with EE (Exam Engine) just in case we'll do includes later
EE_DIR = .
EE_NVM_DIR=$(HOME)/.nvm

EE_NVM_EXEC=$(EE_NVM_DIR)/nvm-exec
EE_NODE=$(EE_NVM_EXEC) node
EE_YARN=$(EE_NVM_EXEC) yarn
EE_YARN_INSTALLED=$(EE_DIR)/node_modules/.yarn_install_executed
EE_PKG_DIR=$(EE_DIR)/packages/exam-engine
EE_AMD_BUNDLE_DIR=$(EE_PKG_DIR)/dist
EE_EXAM_ENGINE_BUILT=$(EE_AMD_BUNDLE_DIR)/main-bundle.js
EE_MEX_PKG_DIR =$(EE_DIR)/packages/mex
EE_MEX_PKG_COMPILED=$(EE_MEX_PKG_DIR)/dist/index.js
EE_EXAM_ENGINE_PKG_DIR= $(EE_DIR)/packages/exam-engine
EE_MEXAMPLES_DIR =$(EE_DIR)/packages/mexamples
EE_MEXAMPLES_COMPILED=$(EE_MEXAMPLES_DIR)/dist/index.js

EE_EXAM_XML_FILES = $(shell find ./packages/mexamples/*/*.xml)
# Change @ to empty string "" if you want to see all commands echoed:
VERBOSE?=@

$(EE_YARN_INSTALLED): $(EE_DIR)/package.json $(EE_DIR)/yarn.lock $(EE_NVM_EXEC)
	$(PRINT_TARGET)
	$(VERBOSE)$(EE_NVM_EXEC) yarn install --pure-lockfile
	$(VERBOSE)touch $@

$(EE_EXAM_ENGINE_BUILT): $(EE_YARN_INSTALLED) $(shell find $(EE_EXAM_ENGINE_PKG_DIR)/src -type f) $(shell find packages/exam-engine/ -maxdepth 1 -name '*config*' -o -name '*.less' -o -name 'package.json')
	$(PRINT_TARGET)
	$(VERBOSE)cd $(EE_EXAM_ENGINE_PKG_DIR) && $(EE_NVM_EXEC) yarn build

$(EE_MEX_PKG_COMPILED): $(EE_YARN_INSTALLED) $(shell find $(EE_MEX_PKG_DIR)/src -type f)
	$(PRINT_TARGET)
	$(VERBOSE)cd $(EE_MEX_PKG_DIR) && $(EE_NVM_EXEC) yarn build

$(EE_MEXAMPLES_COMPILED): $(EE_YARN_INSTALLED) $(shell find $(EE_MEXAMPLES_DIR)/src -type f)
	$(PRINT_TARGET)
	$(VERBOSE)cd $(EE_MEXAMPLES_DIR) && $(EE_NVM_EXEC) yarn build

# In case you only want to create the amd bundle which is packaged into the .mex package:
create-amd-bundle: $(EE_EXAM_ENGINE_BUILT)

# Example on how to call this target:
#
# make create-mex e="packages/mexamples/A_X/A_X.xml" p="salasana" n=~/digabi-top/yo-tools/scripts/nsa-scripts.zip
# See https://www.gnu.org/software/make/manual/html_node/Target_002dspecific.html
create-mex: p?=salasana
create-mex: s?=$(EE_DIR)/test/security-codes.json
create-mex: n?=$(EE_DIR)/test/dummy-nsa-scripts.zip
create-mex: o?=$(EE_DIR)
create-mex: $(EE_EXAM_ENGINE_BUILT) $(EE_MEX_PKG_COMPILED)
	$(EE_NVM_EXEC) yarn create-mex -e $(e) -p $(p) -n $(n) -o $(o) -s $(s) -k $(k)

packages/mexamples/*/%.mex: packages/mexamples/*/%.xml
	@$(MAKE) create-mex e=$< o=$(@D)

start: build
	$(EE_NVM_EXEC) yarn start

build: $(EE_EXAM_ENGINE_BUILT) $(EE_MEX_PKG_COMPILED) $(EE_MEXAMPLES_COMPILED)

clean:
	$(PRINT_TARGET)
	$(VERBOSE)rm -rf $(EE_PKG_DIR)/dist
	$(VERBOSE)rm -rf $(EE_PKG_DIR)/node_modules
	$(VERBOSE)rm $(EE_PKG_DIR)/*lint.xml 2>/dev/null || true
	$(VERBOSE)rm -rf $(EE_AMD_BUNDLE_DIR)
	$(VERBOSE)rm -rf $(EE_MEX_PKG_DIR)/dist
	$(VERBOSE)rm -rf $(EE_MEX_PKG_DIR)/node_modules
	$(VERBOSE)rm $(EE_MEX_PKG_DIR)/*lint.xml 2>/dev/null || true
	$(VERBOSE)rm -rf $(EE_DIR)/node_modules

test: browser-tests unit-tests

browser-tests: build
	$(PRINT_TARGET)
	$(EE_NVM_EXEC) yarn browser-tests:dev

unit-tests: build
	$(PRINT_TARGET)
	$(EE_NVM_EXEC) yarn workspace @digabi/exam-engine unit-tests:dev
	$(EE_NVM_EXEC) yarn workspace @digabi/mex unit-tests:dev

unit-tests-ci: build
	$(PRINT_TARGET)
	$(EE_NVM_EXEC) yarn workspace @digabi/exam-engine unit-tests:ci
	$(EE_NVM_EXEC) yarn workspace @digabi/mex unit-tests:ci

browser-tests-ci: build
	$(PRINT_TARGET)
	$(EE_NVM_EXEC) yarn browser-tests:ci

publish-exam-engine: $(EE_EXAM_ENGINE_BUILT)
	$(PRINT_TARGET)
	$(EE_NVM_EXEC) yarn workspace @digabi/exam-engine publish --new-version $(version)

publish-mex-pkg: $(EE_MEX_PKG_COMPILED)
	$(PRINT_TARGET)
	$(EE_NVM_EXEC) yarn workspace @digabi/mex publish --new-version $(version)

publish-mexamples: $(patsubst %.xml,%.mex,$(EE_EXAM_XML_FILES)) $(EE_MEX_PKG_COMPILED) $(EE_MEXAMPLES_COMPILED)
	$(PRINT_TARGET)
	$(EE_NVM_EXEC) yarn workspace @digabi/mexamples publish --new-version $(version)

lint: $(EE_YARN_INSTALLED)
	$(PRINT_TARGET)
	$(EE_NVM_EXEC) yarn workspace @digabi/exam-engine lint
	$(EE_NVM_EXEC) yarn workspace @digabi/mex lint
	$(EE_NVM_EXEC) yarn workspace @digabi/mexamples lint

lint-ci: $(EE_YARN_INSTALLED)
	$(PRINT_TARGET)
	$(EE_NVM_EXEC) yarn workspace @digabi/exam-engine ci:lint
	$(EE_NVM_EXEC) yarn workspace @digabi/mex ci:lint
	$(EE_NVM_EXEC) yarn workspace @digabi/mexamples ci:lint
