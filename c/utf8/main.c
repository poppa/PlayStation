#include <stdio.h>
#include <stdlib.h>
#include "utf8.h"

int main (int argc, char** argv)
{
	char* str = "Pontus Östlund";
	char* ustr = utf8_decode (str);

	printf ("My name is: %s | %s\n", str, ustr);

	utf8_clean (ustr);

	return 0;
}
