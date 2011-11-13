/* mysql.vala
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

/**
 * Mysql wrapper
 */
public class Poppa.Sql.MySQL.Database : Poppa.Sql.Database
{
  /**
   * The real connection object
   */
  protected new Mysql.Database db;

  /**
   * Constructs a new MySQL object
   *
   * @throws
   *  A Poppa.Sql.Error if the connection fails
   *
   * @param host
   * @param username
   * @param password
   * @param database
   */
  public Database(string host, string? username, string? password, 
                  string database) throws Poppa.Sql.Error
  {
    db = new Mysql.Database();
    if (!db.real_connect(host, username, password, database, 0, null, 0)) {
      throw new Poppa.Sql.Error.ANY("Unable to connect to database: %s"
                                    .printf(db.error()));
		}
  }

	/**
	 * Creates a new MySQL object from a connection string
	 *
	 * @param connection_string
	 *  E.g mysql://user:pass@host/dbname
	 */
  public Database.from_string(string connection_string) throws Poppa.Sql.Error
  {
    try {
      Regex re = new Regex("mysql://"             +
                           "(?<cred>"             +
                             "(?<uname>.[^:]*):?" +
                             "(?<pword>.[^@]*)?"  +
                           "@)?"                  +
                           "(?<dba>"              +
                             "(?<host>.[^/]*)/?"  +
                             "(?<db>.*)"          +
                           ")");
			MatchInfo m;
			if (re.match(connection_string, RegexMatchFlags.ANCHORED, out m)) {
				string uname = null, pword = null, host = null, dbname = null;
				string cred = m.fetch_named("cred");
				if (cred != null && cred.length > 0) {
					uname = m.fetch_named("uname");
					pword = m.fetch_named("pword");
					if (pword != null && pword.length == 0)
						pword = null;
				}

				host = m.fetch_named("host");
				dbname = m.fetch_named("db");

				if (dbname == null || dbname.length == 0)
					throw new Poppa.Sql.Error.ANY("Missing required database name");
				
				this(host, uname, pword, dbname);
			}
			else throw new Poppa.Sql.Error.ANY("Bad connection string!");
    }
    catch (GLib.Error e) {
      throw new Poppa.Sql.Error.ANY(e.message);
    }
  }

  /**
   * Query the database
   *
   * @throws
   *  A Poppa.Sql.Error if the query fails.
   *
   * @param query
   * @param params
   */
  public override Poppa.Sql.Result? query(string query,
                                          Poppa.Sql.Param[]? params=null)
    throws Poppa.Sql.Error
  {
    string q = base.build_query(query, params);

    if (this.db.query(q) != 0)
      throw new Poppa.Sql.Error.ANY("MySQL query error: %s".printf(db.error()));

    try { return new Result(db); }
    catch (Poppa.Sql.Error e) {
      return null;
    }
  }

	/**
	 * Returns the last inserted id
	 */
	public override ulong insert_id()
	{
		assert(db != null);
		return db.insert_id();
	}
}

/**
 * Mysql result class
 */
protected class Poppa.Sql.MySQL.Result : Poppa.Sql.Result
{
  /**
   * The real result object
   */
  Mysql.Result? res = null;
  Mysql.Field[]? fields = null;
  string[] keys;

  /**
   * Constructor
   *
   * @param result
   */
  public Result(Mysql.Database db) throws Poppa.Sql.Error
  {
    if (db != null) {
      res = db.store_result();
      if (res == null)
        throw new Poppa.Sql.Error.ANY("No result");

      num_fields = res.num_fields();
      num_rows = length = res.num_rows();
      unowned Mysql.Field[]? flds = res.fetch_fields();

      if (flds != null) {
        fields = {};
        int i;
        for (i = 0; i < num_fields; i++) {
          fields += flds[i];
          keys += flds[i].name;
        }
      }
    }
  }

  /**
   * Fetch result row
   */
  public override string[]? fetch()
  {
    string[] ret = {};
    unowned string[]? row = null;

    if ((row = res.fetch_row()) != null) {
      uint i;
      for (i = 0; i < num_fields; i++)
        ret += row[i].dup();

      counter++;
      return ret;
    }

    return null;
  }

  /**
   * Fetch assoc row
   */
  public override Poppa.Sql.Row? fetch_assoc()
  {
    unowned string[]? row = null;

    if ((row = res.fetch_row()) != null) {
      uint i;
      string[] r = {};
      for (i = 0; i < num_fields; i++)
        r += row[i].dup();

      counter++;
      return new Poppa.Sql.Row(keys, r);
    }

    return null;
  }
}

