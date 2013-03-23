/* Polish Prefix Calculator */
/* Flex-only Implementation */
/* Author: Maria Markhelyuk */
/* March 1, 2013 */ 

%{
#include <math.h>
#include <stack>
#include <iostream>
using namespace std;

/* Stack to store numbers and the end result */
stack<float> fstack;

/* Counter to keep track of valid symbols in a given expression */
/* Resets to 0 at the end of each calculation */
int i = 0;

/* Counter to keep track of the number of operands */
int num = 0;

/* Variables to store the operands and the result */
float operand1;
float operand2;
float result;

/* Flag for unrecognized characters */
bool unrecChar = false;

/* Arrays to temporarily store the operators and the numbers as they're read in */
/* Set to size 10 since calculator doesn't need to work with longer expressions (per requirements) */ 
char clist[10];
float flist[10];
%}

%option noyywrap
%array

	/* Definitions Section */
ws [ \t]+
operator "+"|"*"|"-"|"/"
num [0-9]+|[0-9]*\.[0-9]+
error .

%%
	/* Rules Section */
{ws}  /* ignore white space */
{operator} { 
	clist[i] = *yytext;  /* Store operator in character array */
	flist[i] = 0;  /* Store a 0 in the float array when see an operator */
	i++;
} 
{num} {
	clist[i] = 'e';	 /* Store 'e' (just a random character) in the character array when see a number */
	flist[i] = atof(yytext);  /* Store number (float or int) in float array */
	i++;
	num++;
}
{error} unrecChar = true;  /* Set flag to true when see unrecognized character */
\n {
	if (num == 0 || num == 1 || unrecChar) {  /* Error if not enough symbols given or if unrecognized character */
		unrecChar = false;
		i = 0;
		num = 0;
		while(!fstack.empty()) {
			fstack.pop();
		}
		printf("Invalid expresion. Please try again or press CTRL+C to exit.\n");
		printf("\nExpression: ");
	} else {
		while (i != 0) {
			for (int k = i - 1; k >= 0; k--) {
				if (clist[k] == 'e') {
					fstack.push(flist[k]);
				} else if (clist[k] == '+') {   /* Identify operator, evaluate if enough numbers on stack */
					operand1 = fstack.top();
					fstack.pop();
					operand2 = fstack.top();
					fstack.pop();
					result = operand1 + operand2;
					fstack.push(result);	
				} else if (clist[k] == '-') {   /* Identify operator, evaluate if enough numbers on stack */
					operand1 = fstack.top();
					fstack.pop();
					operand2 = fstack.top();
					fstack.pop();
					result = operand1 - operand2;
					fstack.push(result);
				} else if (clist[k] == '*') {   /* Identify operator, evaluate if enough numbers on stack */
					operand1 = fstack.top();
					fstack.pop();
					operand2 = fstack.top();
					fstack.pop();
					result = operand1 * operand2;
					fstack.push(result);
				} else if (clist[k] == '/') {   /* Identify operator, evaluate if enough numbers on stack */
					operand1 = fstack.top();
					fstack.pop();
					operand2 = fstack.top();
					if (operand2 != 0.0) {  /* Check for divide by zero error */
						fstack.pop();
						result = operand1 / operand2;
						fstack.push(result);
					} else {
						fstack.push(operand1);  /* Push last number back on stack to make sure error below occurs */ 
						printf("Error: zero divisor\n");
					}
				}
			}
			if (fstack.size() == 0 || fstack.size() > 1) {  /* Result should be the only number left in the stack, error if otherwise */
				printf("Invalid expresion. Please try again or press CTRL+C to exit.\n");	
				while(!fstack.empty()) {
					fstack.pop();
				}
				num = 0;
			} else {  /* Print result only if everything evaluated fine, empty the stack */
				printf("Result: %.2f\n", result);
				fstack.pop();
				num = 0;
			}
			i = 0;  /* Reset counter and prompt for another expression */
			printf("\nExpression: ");
		}
	}
}
%%

int main()
{
	printf("\nWelcome to the Polish Prefix Notation Calculator.\n");
	printf("\nPlease enter an expression using polish notation below and\n");
	printf("press ENTER to evaluate. Include spaces between numbers to\n");
	printf("distinguish between single- and multi-digit numbers.\n");
	printf("Press CTRL+C at any time to exit.\n");
	printf("\nExpression: ");
	yylex();
}
