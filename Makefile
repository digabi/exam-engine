# -*- Makefile -*-

PRINT_TARGET ?= @echo $@

# Prefixing with EE (Exam Engine) just in case we'll do includes later
EE_DIR = .
EE_NVM_DIR=$(HOME)/.nvm

EE_NVM_EXEC=$(EE_NVM_DIR)/nvm-exec
EE_NODE=$(EE_NVM_EXEC) node
EE_YARN=$(EE_NVM_EXEC) yarn
EE_YARN_INSTALLED=$(EE_DIR)/node_modules/.yarn_install_executed
EE_EXAM_ENGINE_BUILT=$(EE_DIR)/packages/exam-engine/dist/main-bundle.js

EE_EXAM_XML_FILES = $(shell find ./packages/mexamples/*/*.xml)
# Change @ to empty string "" if you want to see all commands echoed:
VERBOSE?=@

$(EE_YARN_INSTALLED): $(EE_DIR)/package.json $(EE_DIR)/yarn.lock $(EE_NVM_EXEC)
	$(PRINT_TARGET)
	$(VERBOSE)$(EE_NVM_EXEC) yarn install --pure-lockfile
	$(VERBOSE)touch $@

$(EE_EXAM_ENGINE_BUILT):
	$(PRINT_TARGET)
	$(EE_NVM_EXEC) yarn workspace @digabi/exam-engine build

# Example on how to call this target:
#
# make create-mex e="packages/mexamples/A_X/A_X.xml" p="salasana" n=~/digabi-top/yo-tools/scripts/nsa-scripts.zip
# See https://www.gnu.org/software/make/manual/html_node/Target_002dspecific.html
create-mex: p?=salasana
create-mex: s?=$(EE_DIR)/test/security-codes.json
create-mex: n?=$(EE_DIR)/test/dummy-nsa-scripts.zip
create-mex: o?=$(EE_DIR)
create-mex: build $(EE_EXAM_ENGINE_BUILT)
	$(EE_NVM_EXEC) yarn create-mex -e $(e) -p $(p) -n $(n) -o $(o) -s $(s) -k $(k)

packages/mexamples/*/%.mex: packages/mexamples/*/%.xml
	@$(MAKE) create-mex e=$< o=$(@D)

start: build
	$(EE_NVM_EXEC) yarn start

build: $(EE_YARN_INSTALLED)
	$(PRINT_TARGET)
	$(EE_NVM_EXEC) yarn build

clean:
	$(PRINT_TARGET)
	$(VERBOSE)rm -rf $(EE_DIR)/node_modules
	$(VERBOSE)rm -rf $(EE_DIR)/packages/*/dist
	$(VERBOSE)rm $(EE_DIR)/packages/*/tslint.xml 2>/dev/null || true	
	$(VERBOSE)rm $(EE_DIR)/packages/*/jest-report.xml 2>/dev/null || true		
	$(VERBOSE)rm $(EE_DIR)/packages/*/tsconfig.tsbuildinfo 2>/dev/null || true		

test: build
	$(PRINT_TARGET)
	$(EE_NVM_EXEC) yarn test

unit-tests-ci: build
	$(PRINT_TARGET)
	$(EE_NVM_EXEC) yarn test --test-path-ignore-patterns packages/rendering

browser-tests-ci: build
	$(PRINT_TARGET)
	$(EE_NVM_EXEC) yarn test packages/rendering

publish-exam-engine: $(EE_EXAM_ENGINE_BUILT)
	$(PRINT_TARGET)
	$(EE_NVM_EXEC) yarn workspace @digabi/exam-engine publish --new-version $(version)

publish-mex-pkg: build
	$(PRINT_TARGET)
	$(EE_NVM_EXEC) yarn workspace @digabi/mex publish --new-version $(version)

publish-mexamples: build $(patsubst %.xml,%.mex,$(EE_EXAM_XML_FILES))
	$(PRINT_TARGET)
	$(EE_NVM_EXEC) yarn workspace @digabi/mexamples publish --new-version $(version)

lint: $(EE_YARN_INSTALLED)
	$(PRINT_TARGET)
	$(EE_NVM_EXEC) yarn lint --fix

lint-ci: $(EE_YARN_INSTALLED)
	$(PRINT_TARGET)
	$(EE_NVM_EXEC) yarn lint -t checkstyle -o tslint.xml
