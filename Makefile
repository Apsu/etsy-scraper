export PYTHON=python2

all: | build

clean:
	rm -rf node_modules

build:
	@npm install
