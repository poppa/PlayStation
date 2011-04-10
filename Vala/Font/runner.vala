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

using Poppa;

int main(string[] args)
{
  //var f = Font.collect_fonts("/home/poppa/.fonts");
  var f = Font.collect_fonts("/usr/share/fonts");
  
  foreach (Font.Family fam in f) {
    stdout.printf("Family: %s (%ld)\n", fam.name, fam.size);
    foreach (Font.Font font in fam.fonts)
      stdout.printf("  Font: %-35s [%s | %s]\n", font.subfamily, font.version, font.uniqname);
  } 
  return 0;
}