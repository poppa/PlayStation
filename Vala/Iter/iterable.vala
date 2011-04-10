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

using Gee;

int main(string[] args)
{

  Test t = new Test();
  t.add(new Item("Poppa", "Cool"));
  t.add(new Item("Poppa", "Way"));
  return 0;
}

class Item : Object
{
  public string name { get; set; }
  public string title { get; set; }
  
  public Item(string name, string title)
  {
    this.name = name;
    this.title = title;
  }
}

class Test : Object
{
  private ArrayList<Item> list;
  
  public Test()
  {
    list = new ArrayList<Item>();
  }
  
  public void add(Item i)
  {
    list.add(i);
  }
}