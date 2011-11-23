/* main.vala
 *
 * Copyright (C) 2011  Pontus Östlund
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

using Gtk;

class Test.Main
{
	/**
	 * Program entry point
	 *
	 * @param args
	 *  Command line arguments
	 */
	public static int main (string[] args)
	{
		Gtk.init (ref args);
		return new Main ().run (args);
	}

	/**
	 * Column order in the treeview
	 */
	enum TreeViewCols
	{
		ICON,
		APP_NAME,
		COMMAND,
		N_COLS
	}

	/**
	 * Default icon theme used to load icons
	 */
	IconTheme theme;

	/**
	 * Counter keeping track of inserted CellRenderers
	 */
	int pos = 0;

	/**
	 * The data model of the treeview
	 */
	Gtk.ListStore ls;

	/**
	 * Run the application.
	 *
	 * @param args
	 *  Command line arguments
	 */
	int run (string[] args)
	{
		Builder builder = new Builder ();

		try { builder.add_from_file ("treeview.ui"); }
		catch (GLib.Error e) {
			error ("Error: %s", e.message);
		}

		theme = IconTheme.get_default ();

		Window    win = builder.get_object ("window")    as Window;
		TreeView  tv  = builder.get_object ("treeview1") as TreeView;

		// Setup the model:
		//   First column is the application icon
		//   Second column is the application name
		//   Third column is the commandline for starting the application
		ls = new ListStore (TreeViewCols.N_COLS,
			                  typeof (Gdk.Pixbuf),
			                  typeof (string),
			                  typeof (string));

    //ls.set_sort_column_id (TreeViewCols.APP_NAME, SortType.ASCENDING);
		tv.set_model (ls);

		tv.insert_column (get_column ("Application", true), -1);
		tv.insert_column (get_column ("Command"), -1);

		message (" Beginning async collection");

    list_apps_async.begin ();

		win.destroy.connect (main_quit);
		win.set_default_size (750, 500);
		win.show_all ();

    message ("Window loaded");

		Gtk.main ();

		return 0;
	}

  /**
   * List all installed applications
   */
  async void list_apps_async ()
  {
    List<AppInfo> ai = AppInfo.get_all ();
    ai.sort ((CompareFunc) compare_app);

    foreach (AppInfo app in ai)
      yield add_row (app);

    message ("Async collection ended");
    yield;
  }

  /**
   * Comparer function. Compares the displayname of a to b
   *
   * @param a
   * @param b
   */
  public static int compare_app (AppInfo a, AppInfo b)
  {
    string x, y;
    x = a.get_display_name ().down ();
    y = b.get_display_name ().down ();

    return x != y ? x < y ? -1 : 1 : 0;
  }

	/**
	 * Append an application to the model
	 *
	 * @param app
	 */
	async void add_row (AppInfo app)
	{
		Gdk.Pixbuf ico = null;
		Icon aicon = null;
		string icon_name = null;

		if ((aicon = app.get_icon ()) == null)
			icon_name = Gtk.Stock.EXECUTE;
		else
			icon_name = aicon.to_string ();

		try { ico = theme.load_icon (icon_name, 16, 0); }
		catch (GLib.Error ea) {
			try { ico = theme.load_icon (Gtk.Stock.EXECUTE, 16, 0); }
			catch (GLib.Error eb) {}
		}

		TreeIter iter;
		ls.append (out iter);
		ls.set (iter,
			      TreeViewCols.ICON,     ico,
			      TreeViewCols.APP_NAME, app.get_display_name (),
			      TreeViewCols.COMMAND,  app.get_commandline (),
			      -1);
	}

	/**
	 * Creates a TreeViewColumn object.
	 *
	 * @param title
	 *  The title of the column
	 * @param with_icon
	 *  If true the column will get a Gdk.Pixbuf CellRenderer appended
	 */
	TreeViewColumn get_column (string title, bool with_icon=false)
	{
		var col = new TreeViewColumn ();
		col.title = title;
		col.resizable = true;

		if (with_icon) {
			var crp = new CellRendererPixbuf ();
			col.pack_start (crp, false);
			col.add_attribute (crp, "pixbuf", pos++);
		}

		col.sort_column_id = pos;

		var crt = new CellRendererText ();
		col.pack_start (crt, false);
		col.add_attribute (crt, "text", pos++);

		return col;
	}
}
