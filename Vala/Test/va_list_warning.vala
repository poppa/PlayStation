/* (filename).vala
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

public class Program
{
	public static int main(string[] args)
	{
		Child obj  = new Child();
		PParam p1   = new PParam("id", "12");
		PParam p2   = new PParam("uid", "poppa");

		string res = obj.query("SELECT * FROM tbl WHERE id=@id AND uid=@user",
			                     p1, p2);

		message("res: %s", res);
		
		return 0;
	}
}

public abstract class Base : Object
{
	public Base() {}
	public abstract string query(string q, ... );
}

public class Child : Base
{
	public Child()
	{
		base();
	}
	
	public override string query(string q, ... )
	{
		var l = va_list();
		string nq = q.dup();

		while (true)
		{
			PParam? p = l.arg();

			if (p == null)
				break;

			nq.replace("@" + p.name, p.value);
		}

		return nq;
	}
}

public class PParam : Object
{
	public string name;
	public string value;

	public PParam(string name, string value)
	{
		this.name = name;
		this.value = value;
	}
}