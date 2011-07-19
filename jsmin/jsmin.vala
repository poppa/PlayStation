/* jsmin.vala
 * 
 * Removes unneccessary whitespace and comments from JavaScript files.
 * Compile with: valac --pkg gio-2.0 -o jsmin jsmin.vala
 *
 * On windows compile like:
 * valac -D WINNT --pkg gio2.0 -o jsmin jsmin.vala
 *
 * Copyright (C) 2002 Douglas Crockford  (www.crockford.com)
 * Copyright (C) 2010 Pontus Östlund (http://www.poppa.se)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy 
 * of this software and associated documentation files (the "Software"), to 
 * deal in the Software without restriction, including without limitation the 
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or 
 * sell copies of the Software, and to permit persons to whom the Software is 
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in 
 * all copies or substantial portions of the Software.
 *
 * The Software shall be used for Good, not Evil.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
 * THE SOFTWARE.
 *
 * Author:
 * 	Pontus Östlund <pontus@poppa.se>
 */

using GLib;

namespace JSMin
{
#if WINNT
	private const string DIR_SEPARATOR = "\\";
#else
	private const string DIR_SEPARATOR = "/";
#endif

	private int a;
	private int b;
	private int lookahead;
	private FileStream input;
	private FileStream output;
	private const int EOF = FileStream.EOF;
	private const string HELP = "Usage:\n %s input-file [output-file]\n";

	int main (string[] args) 
	{
		foreach (string arg in args) {
			if (arg == "--help" || arg == "-h") {
				stdout.printf(HELP, args[0]);
				return 0;
			}
		}

		if (args.length < 2) {
			stderr.printf("Missing required arguments!\n" + HELP, args[0]);
			return 1;
		}

		string outfile, infile;
		infile = args[1];

		if (!FileUtils.test(infile, FileTest.EXISTS)) {
			stderr.printf("Input file \"%s\" doesn't exist!\n", infile);
			return 1;
		}

		if (args.length > 2)
			outfile = args[2];
		else {
			File f = File.new_for_path(infile);
			string dir = f.get_parent().get_path();
			
			string basename = f.get_basename();
			long dot = (long)basename.last_index_of(".");;
			string name = basename.substring(0, dot)+"-min"+basename.substring(dot);
			outfile = dir + DIR_SEPARATOR + name;
		}

		input = FileStream.open(infile, "r");
		output = FileStream.open(outfile, "w");

		jsmin();

		return 0;
	}

	private void jsmin()
	{
		a = 0;
		action(3);
		while (a != EOF) {
			switch (a)
			{
				case ' ':
					if (is_alnum(b)) action(1);
					else action(2);
					break;
				
				case '\n':
					switch (b)
					{
						case '{':
						case '[':
						case '(':
						case '+':
						case '-':
							action(1);
							break;

						case ' ':
							action(3);
							break;

						default:
							if (is_alnum(b)) action(1);
							else action(2);
							break;
					}
					break;
				
				default:
					switch (b) 
					{
						case ' ':
							if (is_alnum(a)) action(1);
							else action(3);
							break;
						
						case '\n':
							switch (a)
							{
								case '}':
								case ']':
								case ')':
								case '+':
								case '-':
								case '"':
								case '\'':
									action(1);
									break;
								default:
									if (is_alnum(a)) action(1);
									else action(3);
									break;
							}
							break;
						
						default:
							action(1);
							break;
					}
					break;
			}
		}
	}

	private int get()
	{
		int c = lookahead;
		lookahead = EOF;

		if (input.eof())
			return c;
	
		if (c == EOF) {
			uint8[] buf = new uint8[1];
			size_t rd = input.read(buf, 1);

			// End of file
			if (rd != buf.length)
				return EOF;

			c = (int)buf[0];
		}

		if (c >= ' ' || c == '\n' || c == EOF)
			return c;
		
		if (c == '\r')
			return '\n';

		return ' ';
	}

	private int next()
	{
		int c = get();
		if (c == '/') {
			switch (peek())
			{
				case '/':
					for (;;) {
						c = get();
						if (c <= '\n')
							return c;
					}
				
				case '*':
					get();
					int cc = peek();
					// Skip removing comments starting with /*!
					if (cc == '!') {
						add('\n'); add('/'); add('*');
						for (;;) {
							switch (cc = get()) 
							{
								case '*':
									if (peek() == '/') {
										add('*'); add(get()); add('\n');
										return ' ';
									}
									break;
									
								case EOF:
									error("Unclosed block comment");
							}
							add(cc);
						}
					}

					for (;;) {
						switch (get())
						{
							case '*':
								if (peek() == '/') {
									get();
									return ' ';
								} 
								break;

							case EOF:
								error("Unterminated string literal");
						}
					}

				default:
					return c;
			}
		}

		return c;
	}

	private int peek()
	{
		lookahead = get();
		return lookahead;
	}

	private void add(int c)
	{
		if (c > 0)
			output.putc((char)c);
	}

	void action(int d)
	{
		if (d == 1) {
			d = 2;
			add(a);
		}

		if (d == 2) {
			d = 3;
			a = b;
			if (a == '\'' || a == '"') {
				for (;;) {
					add(a);
					a = get();
					if (a == b)
						break;
					if (a == '\\') {
						add(a);
						a = get();
					}
					if (a == EOF)
						error("Unterminated string literal!");
				}
			}
		}

		if (d == 3) {
			b = next();
			if (b == '/' && (a == '(' || a == ',' || a == '=' || a == ':' ||
				               a == '[' || a == '!' || a == '&' || a == '|' ||
				               a == '?' || a == '{' || a == '}' || a == ';' ||
				               a == '\n'))
			{
				add(a);
				add(b);
				for(;;) {
					a = get();
					if (a == '/')
						break;

					if (a == '\\') {
						add(a);
						a = get();
					}

					if (a == EOF)
						error("Unterminated regexp literal!");

					add(a);
				}

				b = next();   	
			}
		}
	}

	private bool is_alnum(int c)
	{
		return ((c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') ||
		        (c >= 'A' && c <= 'Z') || c == '_' || c == '$' || c == '\\' ||
		         c > 126); 
	}
}

