/* Runner
 *
 * Copyright (C) 2010  Pontus Östlund
 *
 * This library is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Author:
 * 	Pontus Östlund <pontus@poppa.se>
 */

int main(string[] args)
{
	Poppa.KeyFile c = new Poppa.KeyFile("config.cfg");
	string[] list = null;

	c.set_boolean("app", "enabled", true);

	list = new string[]{ "vim","emacs","jedit","gedit","testing" };
	c.set_string_list("app", "editors", list);

	c.set_integer_list("app", "numbers", new int[]{1,2,4,6,7,23,332});

	c.set_string("app", "name", "test");
	c.set_string("app", "path", "/home/poppa");
	
	c.set_integer("window", "width", 200);
	c.set_integer("window", "height", 499);

	c.set_double_list("window", "doubles", new double[]{1.2,21.34,4.3144});

	c.save();

	list = c.get_string_list("app","editors");

	if (list != null) {
		foreach (string ed in list)
			message("Editor: %s", ed);
	}
	
	int[] ilist = c.get_integer_list("app", "numbers");
	if (ilist != null)
		foreach (int i in ilist)
			message("Int value: %d", i);
			
	double[] dlist = c.get_double_list("window", "doubles");
	if (dlist != null)
		foreach (double i in dlist)
			message("Double value: %f", i);

	message("Val:\n%s", c.to_string());
	
	return 0;
}
