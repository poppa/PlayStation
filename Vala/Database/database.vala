/* database.vala
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

errordomain Poppa.Sql.Error
{
  ANY
}

/**
 * Database interface base class
 */
public abstract class Poppa.Sql.Database : Object
{
  /**
   * The real database connection object
   */
  protected Object db;

  /**
   * Do a database query
   *
   * @param query
   * @param ...
	 *  Variable length of Poppa.Sql.Param
   */
  public abstract Sql.Result? query(string query, Poppa.Sql.Param[]? args)
    throws Sql.Error;
	
  /**
   * Replaces the macros in //query// with the values in //params//
   *
   * @param query
   * @param params
   */
  protected string replace_params(string query, Poppa.Sql.Param[]? params)
  {
		if (params != null && params.length > 0) {
		  string q = query.dup();

		  foreach (Poppa.Sql.Param p in params)
		    q = q.replace("@" + p.name, p.value);
		  
		  return q;
		}

		return query;
  }
}

/**
 * Abstract class for a database query result
 */
public abstract class Poppa.Sql.Result : Object
{
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
 * Query parameter class
 */
public class Poppa.Sql.Param : Object
{
  /**
   * The parameter name
   */
  public string name { get; private set; }

  /**
   * The parameter value
   */
  public string? @value { 
    get { return _value; }
    set { _value = value == null ? null:value.escape("").replace("'", "\'"); }
  } private string _value = null;

  /**
   * Constructor
   *
   * @param name
   * @param val
   */
  public Param(string name, string val)
  {
    this.name = name;
    _value = val;
  }
}

/**
 * Class representing a row as an associative array
 */
protected class Poppa.Sql.Row
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
  public string? get(string key)
  {
    int i;
    for (i = 0; i < len; i++)
      if (key == keys[i])
        return values[i];
      
    return null;
  }
}
