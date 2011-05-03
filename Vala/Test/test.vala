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
 * along with this library. If not, see <http://www.gnu.org/licenses/>.
 *
 * Author:
 * 	Pontus Östlund <pontus@poppa.se>
 */

int main(string[] args)
{
	Param p1 = new Param.as_int("id", 12);
	Param p2 = new Param.as_string("name", "Poppa's p");

	//stdout.printf("Value: %d:%s\n", p1.get_int(), p2.get_string());

	string q = query("SELECT * FROM hepp WHERE id=@id AND user=@name", p1, p2);

	stdout.printf("%s\n", q);

  return 0;
}

string query(string q, ...)
{
	var l = va_list();
	Param[] list = new Param[]{};
	while (true)
	{
		Param? p = l.arg();
		if (p == null)
			break;

		list += p;		
	}

	if (list.length > 0) {
		string qq = q.dup();
		foreach (Param p in list) {
			string v = null;
			switch (p.param_type) 
			{
				case Param.Type.STRING:
					string s = p.get_string();
					if (s != null)
						v = "'%s'".printf(p.get_string().escape("").replace("'", "\\\'"));
					else
						v = "NULL";

					break;

				case Param.Type.INT:
					v = "%d".printf(p.get_int());
					break;
			}

			if (v == null)
				continue;

			qq = qq.replace("@" + p.name, v);
		}

		return qq;
	}
	
	return q;
}

public class Param : Object
{
	public enum Type {
		NONE,
		INT,
		UINT,
		LONG,
		ULONG,
		FLOAT,
		DOUBLE,
		STRING
	}

	public string name;
	public Type param_type { get; private set; }
	private int int_value;
	private uint uint_value;
	private long long_value;
	private ulong ulong_value;
	private float float_value;
	private double double_value;
	private string string_value;

	protected Param() {}

	public Param.as_int(string name, int val)
	{
		this.name = name;
		this.int_value = val;
		this.param_type = Type.INT;
	}

	public Param.as_uint(string name, uint val)
	{
		this.name = name;
		this.uint_value = val;
		this.param_type = Type.UINT;
	}

	public Param.as_long(string name, long val)
	{
		this.name = name;
		this.long_value = val;
		this.param_type = Type.LONG;
	}

	public Param.as_ulong(string name, ulong val)
	{
		this.name = name;
		this.ulong_value = val;
		this.param_type = Type.ULONG;
	}

	public Param.as_float(string name, float val)
	{
		this.name = name;
		this.float_value = val;
		this.param_type = Type.FLOAT;
	}

	public Param.as_double(string name, double val)
	{
		this.name = name;
		this.double_value = val;
		this.param_type = Type.DOUBLE;
	}

	public Param.as_string(string name, string val)
	{
		this.name = name;
		this.string_value = val;
		this.param_type = Type.STRING;
	}

	public int get_int()
	{
		return int_value;
	}

	public int get_uint()
	{
		return int_value;
	}

	public long get_long()
	{
		return long_value;
	}

	public ulong get_ulong()
	{
		return ulong_value;
	}

	public float get_float()
	{
		return float_value;
	}

	public double get_double()
	{
		return double_value;
	}

	public string get_string()
	{
		return string_value;
	}
}