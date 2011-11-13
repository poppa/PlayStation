//  
//  database.vala
//
//  Author:
//       Pontus Östlund <pontus@poppa.se>
// 
//  Copyright (c) 2011 Pontus Östlund
// 
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
// 
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
// 
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.

/**
 * SQL error domain
 */
public errordomain Poppa.Sql.Error
{
	ANY
}

/**
 * Database base class. 
 */
public abstract class Poppa.Sql.Database : GLib.Object
{
	/**
	 * The real database connection object
	 */
	protected Object db;

	/**
	 * Builds the SQL query. Replaces all <code>@field</code> in 
	 * <code>query</code> with the params in <code>params</code>
	 *
	 * @param query
	 * @param params
	 */
	protected string build_query(string query, Param[]? params=null)
	{
		string q = query.dup();
		if (params != null && params.length > 0) {
			foreach (Param p in params) {
				string v = null;
				switch (p.param_type)
				{
					case Param.Type.STRING:
						string s = p.get_string();
						if (s != null) {
							v = "'%s'".printf(s.escape("").replace("'", "\\\'")
							                              .replace("\"", "\\\""));
						}
						else v = "NULL";
						break;

					case Param.Type.INT:
						v = "%d".printf(p.get_int());
						break;

					case Param.Type.ULONG:
						v = "%lld".printf(p.get_ulong());
						break;

					case Param.Type.LONG:
						v = "%ld".printf(p.get_long());
						break;
				}

				if (v == null) {
					warning("Value is null for sql param \"%s\"", p.name);
					continue;
				}

				q = q.replace("@" + p.name, v);
			}
		}

		return q;
	}

	/**
	 * Execute an SQL query.
	 * NOTE! The field representations in in the query doen's need to be quoted
	 * even when they are strings.
	 *
	 * <code>
	 *  dbobj.query("SELECT * FROM tbl WHERE str=@mystr",
	 *              new Param.as_string("mystr", "foobar"));
	 * </code>
	 *
	 * @param query
	 *  The query to execute. 
	 * @param params
	 *  The parameters to populate the replacements in <code>query</code>
	 *  with.
	 */
	public abstract Poppa.Sql.Result? query(string query, Param[]? params=null)
		throws Poppa.Sql.Error;

	/**
	 * Should return the ID of the last inserted item
	 */
	public abstract ulong insert_id();
}

/**
 * Abstract class for a database query result
 */
public abstract class Poppa.Sql.Result : GLib.Object
{
	/**
	 * When looping through the result in an inherting class update
	 * this member for every iteration
	 */
  protected uint counter = 0;
  /**
   * Returns the number of fields
   */
  public uint num_fields { get; protected set; }
  /**
   * Returns the number of rows in the last query
   */
  public uint num_rows { get; protected set; }
  /**
   * Same as num_rows
   */
  public uint length { get; protected set; }

  /**
   * Fetch row
   */
  public abstract string[]? fetch();

  /**
   * Fetch row as an associative array
   */
  public abstract Sql.Row? fetch_assoc();

  /**
   * Returns true if the we're at the last row
   */
  public bool last()
  {
    return counter == num_rows;
  }
}

/**
 * Class representing a row as an associative array
 */
protected class Poppa.Sql.Row : GLib.Object
{
  /**
   * Array indices
   */
  protected string[] keys;
  /**
   * Values
   */
  protected string[] values;

  /**
   * Number of columns in the row
   */
  public uint length { get { return values.length; } }
  
  /**
   * Number of fields
   */
  private int len;

  /**
   * Constructor
   *
   * @param keys
   * @param org_keys
   * @param values
   */
  public Row(string[] keys, string[] values)
  {
    this.keys = keys;
    this.values = values;
    len = keys.length;
  }

  /**
   * Getter
   *
   * @param key
   */
  public new string get(string key)
  	throws Poppa.Sql.Error
  {
    int i;
    for (i = 0; i < len; i++)
      if (key == keys[i])
        return values[i];
      
    throw new Poppa.Sql.Error.ANY("Unknown database table field \"%s\"!", key);
  }

	/**
	 * Returns the value as a //ulong//
	 *
	 * @param key
	 */
  public ulong get_ulong(string key) throws Poppa.Sql.Error
  {
	  return (ulong)uint64.parse(get(key));
  }

	/**
	 * Returns the value as a //long//
	 *
	 * @param key
	 */
  public long get_long(string key) throws Poppa.Sql.Error
  {
	  return long.parse(get(key));
  }

	/**
	 * Returns the value as an //int//
	 *
	 * @param key
	 */
  public int get_int(string key) throws Poppa.Sql.Error
  {
	  return int.parse(get(key));
  }

	/**
	 * Returns the value as an //uint//
	 *
	 * @param key
	 */
  public uint get_uint(string key) throws Poppa.Sql.Error
  {
	  return (uint)int.parse(get(key));
  }
}

/**
 * SQL parameter class. 
 */
public class Poppa.Sql.Param : GLib.Object
{
	/**
	 * Available parameter types
	 */
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

	/**
	 * Parameter name
	 */
	public string name;
	/**
	 * Parameter type
	 */
	public Type param_type { get; private set; }
	/**
	 * Value storage for int type
	 */
	private int int_value;
	/**
	 * Value storage for uint type
	 */
	private uint uint_value;
	/**
	 * Value storage for long type
	 */
	private long long_value;
	/**
	 * Value storage for ulong type
	 */
	private ulong ulong_value;
	/**
	 * Value storage for float type
	 */
	private float float_value;
	/**
	 * Value storage for double type
	 */
	private double double_value;
	/**
	 * Value storage for string type
	 */
	private string string_value;

	/**
	 * Hidden constructor
	 */
	protected Param() {}

	/**
	 * Constructor for int type
	 *
	 * @param name
	 * @param value
	 */ 
	public Param.as_int(string name, int val)
	{
		this.name = name;
		this.int_value = val;
		this.param_type = Type.INT;
	}

	/**
	 * Constructor for uint type
	 *
	 * @param name
	 * @param value
	 */
	public Param.as_uint(string name, uint val)
	{
		this.name = name;
		this.uint_value = val;
		this.param_type = Type.UINT;
	}

	/**
	 * Constructor for long type
	 *
	 * @param name
	 * @param value
	 */
	public Param.as_long(string name, long val)
	{
		this.name = name;
		this.long_value = val;
		this.param_type = Type.LONG;
	}

	/**
	 * Constructor for ulong type
	 *
	 * @param name
	 * @param value
	 */
	public Param.as_ulong(string name, ulong val)
	{
		this.name = name;
		this.ulong_value = val;
		this.param_type = Type.ULONG;
	}

	/**
	 * Constructor for float type
	 *
	 * @param name
	 * @param value
	 */
	public Param.as_float(string name, float val)
	{
		this.name = name;
		this.float_value = val;
		this.param_type = Type.FLOAT;
	}

	/**
	 * Constructor for double type
	 *
	 * @param name
	 * @param value
	 */
	public Param.as_double(string name, double val)
	{
		this.name = name;
		this.double_value = val;
		this.param_type = Type.DOUBLE;
	}

	/**
	 * Constructor for string type
	 *
	 * @param name
	 * @param value
	 */
	public Param.as_string(string name, string val)
	{
		this.name = name;
		this.string_value = val;
		this.param_type = Type.STRING;
	}

	/**
	 * Getter for the int value
	 */
	public int get_int()
	{
		return int_value;
	}

	/**
	 * Getter for the uint value
	 */
	public uint get_uint()
	{
		return uint_value;
	}

	/**
	 * Getter for the long value
	 */
	public long get_long()
	{
		return long_value;
	}

	/**
	 * Getter for the ulong value
	 */
	public ulong get_ulong()
	{
		return ulong_value;
	}

	/**
	 * Getter for the float value
	 */
	public float get_float()
	{
		return float_value;
	}

	/**
	 * Getter for the double value
	 */
	public double get_double()
	{
		return double_value;
	}

	/**
	 * Getter for the string value
	 */
	public string get_string()
	{
		return string_value;
	}
}
