#
.PHONY: clean obj
# C compiler, linker
CC=gcc
# C++ compiler and linker
CPP=g++
LEX=flex
YACC=bison
SRC=pp_draft.lex
OBJ=$(SRC:%.lex=%.o)
PROG=pp_draft

default: $(PROG)

obj: $(OBJ)

%.o: %.lex
	$(LEX) $<
	$(CPP) -g -c lex.yy.c -o pp_draft.o 
	
$(PROG): $(OBJ)
	$(CPP) -g -o $(@) $(^) -lfl

clean:
	rm -f $(PROG) lex.yy.c *.tab.* *.o
