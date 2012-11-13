/* main.vala
 *
 * Copyright (C) 2011  Pontus Östlund
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *  
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * Author:
 *  Pontus Östlund <pontus@poppa.se>
 */

using GLib;
using Gdk;

class Imgopt.Main
{
  static int  arg_width = 0;
  static int  arg_height = 0;
  static bool arg_recurse = false;
  static bool arg_version = false;
  public static bool arg_silent = false;
  public static string arg_outdir = null;

  public static const OptionEntry[] options = {
    { "width", 'w',  0, OptionArg.INT, ref arg_width,
      "Set the max width of images", null },
    { "height", 'h', 0, OptionArg.INT, ref arg_height,
      "Set the max height of images", null },
    { "outdir", 'o', 0, OptionArg.STRING, ref arg_outdir,
      "Directory to put optimized images in", null },
    { "recurse", 'r', 0, OptionArg.NONE, ref arg_recurse,
      "Do recursive scanning in directories", null },
    { "silent", 's', 0, OptionArg.NONE, ref arg_silent,
      "Run the program silently. No output to stdout.", null },
    { "version", 'v', 0, OptionArg.NONE, ref arg_version,
      "Print the version number", null },
    { null }
  };

  /**
   * Program entry point
   *
   * @param args
   *  Command line arguments
   */
  public static int main (string[] args)
  {
    return new Main ().run (args);
  }

  /**
   * Run the application
   *
   * @param args
   */
  public int run (string[] args)
  {
    try {
      var opt = new OptionContext ("path [path [...]]]");
      opt.set_help_enabled (true);
      opt.add_main_entries (options, null);
      opt.parse (ref args);

      if (arg_version) {
        stdout.printf ("%s version %s\n", Config.PACKAGE, Config.VERSION);
        return 0;
      }
    
      if (arg_width > 0)  Image.MAX_WIDTH  = arg_width;
      if (arg_height > 0) Image.MAX_HEIGHT = arg_height;

      Dir.recurse = arg_recurse;
    }
    catch (GLib.Error e) {
      stderr.printf ("Argument error: %s\n", e.message);
      stderr.printf ("Try -? or --help for options\n");
      return 1;
    }

    if (!arg_silent) {
      stdout.printf (
      "+-----------------------------------------------------------------+\n" +
      "|                                                                 |\n" +
      "|     Web Image Optimizer %s                                     |\n" +
      "|                                                                 |\n" +
      "+-----------------------------------------------------------------+\n\n",
      Config.VERSION
      );
    }

    // Put lowres images in directory. Setup the output directory...
    if (arg_outdir != null) {
      var p = File.new_for_path (arg_outdir);

      if (!p.query_exists ()) {
        if (!arg_silent) {
          stdout.printf ("Output directory \"%s\" doesn't exist.\nTrying to " +
                         "create...", p.get_path ());
        }

        if (DirUtils.create_with_parents (p.get_path (), 0750) == -1) {
          stderr.printf ("FAILED!\nCouldn't create directory\n");
          return 1;
        }

        if (!arg_silent)
          stdout.printf ("OK\n\n");
      }
      else {
        if (p.query_file_type (FileQueryInfoFlags.NONE) != FileType.DIRECTORY) {
          stderr.printf ("\"%s\" is not a directory!\n", p.get_path ());
          return 1;
        }
      }
    }

    GLib.List<Indexer> idx = new GLib.List<Indexer> ();

    if (!arg_silent)
      stdout.printf ("Starting scanning...might take a while!\n\n");

    if (args.length == 1) {
      var o = Indexer.get (".");
      if (o != null) idx.append (o);
    }
    else if (args.length == 2) {
      var o = Indexer.get (args[1]);
      if (o != null) idx.append (o);
    }
    else {
      for (int i = 1; i < args.length; i++) {
        string p = args[i];
        var o = Indexer.get (p);
        if (o != null) idx.append (o);
      }
    }

    if (!arg_silent) {
      stdout.printf ("\nFound %d director%s and %d image%s\n",
                     Dir.instances, Dir.instances != 1 ? "ies" : "y",
                     Image.instances, Image.instances != 1 ? "s" : "");
    }
                  
    if (Image.instances > 0) {
      if (!arg_silent)
        stdout.printf ("Starting image processing...\n\n");

      foreach (Indexer i in idx)
        i.run ();

      if (!arg_silent)
        stdout.printf ("\nDouble done!\n");

      if (Image.skipped_images.length () > 0) {
        if (!arg_silent)
          stdout.printf ("\nThe following images wasn't processed:\n");

        foreach (string s in Image.skipped_images)
          if (!arg_silent)
            stdout.printf ("  * %s\n", s);
      }
    }
    else {
      if (!arg_silent)
        stdout.printf ("\nNothing to process!\n\n");
    }

    return 0;
  }
}

/**
 * Indexer
 */
public abstract class Imgopt.Indexer : GLib.Object
{
  /**
   * Factory method for creating an indexer which can be either a directory
   * or an image
   *
   * @param path
   *  Path to the directory or file
   */
  public static new Indexer? get (string path)
  {
    var f = File.new_for_path (path);

    if (!f.query_exists ())
      return null;

    if (f.query_file_type (0) == FileType.DIRECTORY) {
      try { return new Dir (path); }
      catch (GLib.Error e) {
        stderr.printf ("Error creating indexer for directory: %s\n",
                       e.message);
        return null;
      }
    }
    else {
      try {
        Gdk.Pixbuf img;

        if (Image.is_allowed (path, out img))
          return new Image.with_pixbuf (path, img);
      }
      catch (GLib.Error e) {
        stderr.printf ("Error creating indexer: %s\n", e.message);
      }
    }

    return null;
  }

  /**
   * The //File// object 
   */
  public File path { get; private set; }
  /**
   * The //FileInfo// object
   */
  public FileInfo file_info { get; private set; }

  /**
   * Constructor
   *
   * @param path
   */ 
  public Indexer (string path) throws GLib.Error
  {
    this.path = File.new_for_path (path);
    file_info = this.path.query_info ("*", FileQueryInfoFlags.NONE, null);
  }

  /**
   * Loop through the directory or process the image depending on
   * the type of class
   */
  public abstract bool run ();
}

/**
 * Image
 */
public class Imgopt.Image : Indexer
{
  /**
   * Image instance counter
   */
  public static int instances { get; private set; }
  /**
   * Max width for images
   */
  public static int MAX_WIDTH = 1280;
  /**
   * Max height for images
   */
  public static int MAX_HEIGHT = 1024;
  /**
   * List of found images not processed
   */
  public static unowned List<string> skipped_images { 
    get;
    private set;
    default = new List<string> ();
  }

  /**
   * Handled extensions
   */
  const string[] EXTENSIONS = {
    ".jpg", ".jpeg", ".gif", ".png", ".tiff", ".tif", ".bmp" };

  /**
   * Handled mimetypes
   */
  const string[] MIMES = {
    "image/jpeg", "image/jpeg", "image/gif", "image/png", "image/tiff",
    "image/tiff", "image/bmp" };

  /**
   * Returns the correct extension for mimetype //mime//
   *
   * @param mime
   */
  public static string? get_extension_for_mimetype (string mime)
  {
    switch (mime)
    {
      case "image/jpeg":
      case "image/pjpeg":
        return ".jpg";

      case "image/tiff": return ".tif";
      case "image/png":  return ".png";
      case "image/gif":  return ".gif";
      case "image/bmp":  return ".bmp";
    }

    return null;
  }

  /**
   * Checks if //path// is an image that should be processed. If so
   * returns true, and //image// will be instantiated.
   *
   * @param path
   * @param image
   */
  public static bool is_allowed (string path, out Gdk.Pixbuf image)
  {
    image = null;
    var f = File.new_for_path (path);

    if (!Main.arg_silent)
      stdout.printf ("  + Checking if %s is allowed...", f.get_basename ());

    if (f.query_file_type (0) != FileType.REGULAR) {
      if (!Main.arg_silent)
        stdout.printf ("NO! File is not a regular file!\n");

      return false;
    }

    try {
      var fi = f.query_info ("*", FileQueryInfoFlags.NONE, null);
      var ct = fi.get_content_type ().down ();

      if ((ct in MIMES) == false) {
        // This is a Windows fallback solution since File.get_content_type()
        // will return the extension
        if ((ct in EXTENSIONS) == false) {
          if (!Main.arg_silent)
            stdout.printf ("NO! File type not allowed!\n");

          return false;
        }
      }

      image = new Pixbuf.from_file (path);

      if (image.get_width () <= MAX_WIDTH && 
          image.get_height () <= MAX_HEIGHT) 
      {
        if (!Main.arg_silent)
          stdout.printf ("NO! Not necessary to scale image!\n");

        skipped_images.append (f.get_path ());
        image = null;
        return false;
      }

      if (!Main.arg_silent)
        stdout.printf ("YES!\n");

      return true;
    }
    catch (GLib.Error e) {
      stderr.printf ("Error: %s\n", e.message);
    }

    return false;
  }

  /**
   * The //Pixbuf// object
   */
  public Gdk.Pixbuf image { get; private set; }
  /**
   * The image's mimetype
   */
  public string mimetype { get; private set; }

  /**
   * Constructor
   *
   * @param path
   */
  public Image (string path) throws GLib.Error
  {
    instances++;
    base (path);
    image = new Pixbuf.from_file (path);
  }

  /**
   * Constructor with //Pixbuf//
   *
   * @param path
   * @param pixbuf
   */
  public Image.with_pixbuf (string path, Gdk.Pixbuf pixbuf) throws GLib.Error
  {
    instances++;
    base (path);
    image = pixbuf;
  }

  /**
   * Process the image
   */
  public override bool run ()
  {
    if (!Main.arg_silent)
      stdout.printf ("  * Processing file: %s...", this.path.get_basename ());

    var d = path.get_parent ();
    var base_dir = d == null ? "" : d.get_path ();
    var name = file_info.get_name ();
    string mime = file_info.get_content_type ().down ();

    if (Main.arg_outdir != null)
      base_dir = Main.arg_outdir;

    if (("image/" in mime) == false) {
      for (int i = 0; i < EXTENSIONS.length; i++) {
        if (mime == EXTENSIONS[i]) {
          mime = MIMES[i];
          break;
        }
      }
    }

    switch (mime) {
      case "image/tiff":
      case "image/bmp":
        mime = "image/jpeg";
        break;
    }

    string next = null;
    for (var i = 0; i < EXTENSIONS.length; i++) {
      if (MIMES[i] == mime) {
        next = EXTENSIONS[i];
        break;
      }
    }

    string new_basename = remove_extension (name) + next;

    if (Main.arg_outdir == null)
      new_basename = remove_extension (name) + "-lowres" + next;
  
    string n = base_dir + "/" + new_basename;
    string[] mimes = mime.split ("/");

    int[] x = get_contraints (image.get_width (), image.get_height (),
                              MAX_WIDTH, MAX_HEIGHT);
    try {
      image = image.scale_simple (x[0], x[1], InterpType.BILINEAR);
      image.save (n, mimes[1]);

      if (!Main.arg_silent)
        stdout.printf ("copied to %s\n", new_basename);

      return true;
    }
    catch (GLib.Error e) {
      stderr.printf ("Failed scaling/saving image: %s\n", e.message);
    } 

    return false;
  }

  /**
   * Returns contraint size for an image with //org_x// width and
   * //org_y// height where the new size is //max_x// wide and
   * //max_y// high
   *
   * @param org_x
   *  The original width of the image
   * @param org_y
   *  The original height of the image
   * @param max_x
   *  The new max width of the image
   * @param max_y
   *  The new max height of the image
   *
   * @return
   *  An array with two indices where index 0 is the new width
   *  and index 1 the new height.
   */
  private int[] get_contraints (int org_x, int org_y, int max_x, int max_y)
  {
    int[] r  = new int[2];
    double s = Math.fmin ((double)max_x / (double)org_x,
                          (double)max_y / (double)org_y);

    r[0] = (int)Math.round (s * org_x);
    r[1] = (int)Math.round (s * org_y);

    return r;
  }

  /**
   * Remvoves the extension from filename //p//.
   *
   * @param p
   */
  private string remove_extension (string p)
  {
    string[] x = p.split (".");
    string[] y = new string[]{};
    for (int i = 0; i < x.length-1; i++)
      y += x[i];
  
    return string.joinv (".", y);
  }
}

/**
 * Directory
 */
public class Imgopt.Dir : Indexer
{
  /**
   * Do recursive scanning
   */
  public static bool recurse = false;
  /**
   * Instance counter
   */
  public static int instances { get; private set; }
  /**
   * List of images in the directory
   */
  public unowned GLib.List<Image> images { get; private set; }
  /**
   * List of sub directories
   */
  public unowned GLib.List<Dir> directories { get; private set; }

  /**
   * Constructor
   *
   * @param path
   */
  public Dir (string path) throws GLib.Error
  {
    instances++;
    base (path);
    images = new GLib.List<Image> ();
    directories = new GLib.List<Dir> ();

    try {
      var dirlist = this.path.enumerate_children ("*", 0);
      FileInfo fi;
      string b = this.path.get_path ();

      while ((fi = dirlist.next_file ()) != null) {
        string fn = b + "/" + fi.get_name ();
        if (File.new_for_path (fn).query_file_type (0) == FileType.DIRECTORY) {
          if (recurse) 
            directories.append (new Dir (fn));
        }
        else {
          Gdk.Pixbuf pb;
          if (Image.is_allowed (fn, out pb))
            images.append (new Image.with_pixbuf (fn, pb));
        }
      }
    }
    catch (GLib.Error e) {
      stderr.printf ("Error indexing directory: %s\n", e.message);
    }
  }

  /**
   * Process the images in this directory
   */
  public override bool run ()
  {
    if (!Main.arg_silent)
      stdout.printf ("Processing directory: %s\n", this.path.get_path ());

    foreach (Image i in images)
      i.run ();

    foreach (Dir d in directories)
      d.run ();

    return true; 
  }
}
