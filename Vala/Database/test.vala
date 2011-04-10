/* test.vala
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

using Poppa;

int main(string[] args)
{
  try {
    string dbstr = "mysql://root:w1yHjx@localhost/poppa_se";
    Sql.Database db;
    db = new Sql.MySQL.Database.from_string(dbstr);
    Sql.Result? res = db.query("SELECT * FROM wp_posts WHERE ID=@id", {
			new Sql.Param("id", "450")
		});
		
    if (res != null && res.num_rows > 0) {
      Sql.Row? row;
      while ((row = res.fetch_assoc()) != null) {
        if (res.last())
          message("Last row....");

        message("Row (%ld): %d, %s", row.length, row["ID"].to_int(), row["post_title"]);
      }
    }
  }
  catch (Sql.Error e) {
    message("Error: %s", e.message);
  }
    
  return 0;
}
