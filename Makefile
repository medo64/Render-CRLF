#~ VSCE Project

.SILENT:
.NOTPARALLEL:
.ONESHELL:

all upgrade publish ~upgrade ~publish &:
	./Make.sh $(MAKECMDGOALS)
