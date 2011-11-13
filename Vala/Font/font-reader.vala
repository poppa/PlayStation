/* font-reader.vala
 *
 * Copyright (C) Pontus Östlund 2009 <pontus@poppa.se>
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along
 * with This program. If not, see <http://www.gnu.org/licenses/>.
 */
using Gee;

namespace Poppa
{
	namespace Font
	{
	  public errordomain Error {
		  UNKNOWN_FONT,
		  BAD_TYPE
	  }

    public static bool VERBOSE_OUTPUT = false;

		/**
		 * Font types
		 */
		public enum Type 
		{
			Unknown,
			TrueType,
			OpenType,
			AdobeType1
		}

		/**
		 * Font styles
		 */
		public enum Style
		{
			Bold,
			Italic,
			Regular,
			Strikeout,
			Underline
		}

		/**
		 * Mimetype of OTF fonts
		 */
		public const string OTF_CONTENT_TYPE = "application/x-font-otf";
		
		/**
		 * Mimetype of TTF fonts
		 */
		public const string TTF_CONTENT_TYPE = "application/x-font-ttf";
		
		/**
		 * Supported fonts (their mimetypes)
		 */
		private const string supported_fonts = OTF_CONTENT_TYPE + " " + 
		                                       TTF_CONTENT_TYPE;

		/**
		 * Font base class.
		 *
		 * @example
		 *  {{{
		 *  using Poppa.Font;
		 *
		 *  Font font = Font.create("my-font.ttf");
		 *  print("Family: %s\n", font.family);
		 *
		 *  ArrayList<Family> families = collect_fonts("/home/username/.fonts");
		 *
		 *  foreach (Family family in families) {
		 *    print("%s (%d)\n", family.name, family.size);
		 *    foreach (Font in family.fonts)
		 *      print("  - %s\n", font.subfamily);
		 *  }
		 *  }}}
		 */
		public class Font : GLib.Object
		{
			/**
			 * Getter for the font type
			 */
			public virtual Type TYPE { get { return Type.Unknown; } }

			/**
			 * Name table object
			 */
			protected NameTable nametable;

      /**
       * The font file object
       */
		  public File file { get; private set; }
		  
			/**
			 * The font's family
			 */
			public string? family { get { return nametable.family; } }

			/**
			 * The font's subfamily
			 */
			public string? subfamily { get { return nametable.subfamily; } }

			/**
			 * The font's uniq name
			 */
			public string? uniqname { get { return nametable.uniqname; } }

			/**
			 * The font's full name
			 */
			public string? fullname { get { return nametable.fullname; } }
		
			/**
			 * The font's version
			 */
			public string? version { get { return nametable.version; } }
		
			/**
			 * The font's psname 
			 */
			public string? psname { get { return nametable.psname; } }
		
			/**
			 * The font's trademark
			 */
			public string? trademark { get { return nametable.trademark; } }
		
			/**
			 * The font's manufacturer 
			 */
			public string? manufacturer { get { return nametable.manufacturer; } }
		
			/**
			 * The font's designer
			 */
			public string? designer { get { return nametable.designer; } }
		
			/**
			 * The font's copyright
			 */
			public string? copyright { get { return nametable.copyright; } }

			/**
			 * The size of the font file
			 */
			public int64 filesize { get { return _filesize; } }
			private int64 _filesize;
		
			/**
			 * Factory method for creating a new font object. The correct font type
			 * will be resolved automatically.
			 *
			 * @param path
			 *  Path to the font file
			 */		
			public static Font create(string path) throws GLib.Error, Poppa.Font.Error
			{
				File file = File.new_for_path(path);
				if (!file.query_exists(null)) {
					throw new IOError.NOT_FOUND(" \"%s\" doesn't exist!".printf(path));
				}
        
        FileInfo fi = file.query_info("*", FileQueryInfoFlags.NONE, null);

				switch (fi.get_content_type())
				{
				  case OTF_CONTENT_TYPE:
					  return new OpenType(path);

				  case TTF_CONTENT_TYPE:
					  return new TrueType(path);

					default:
				    throw new Error.UNKNOWN_FONT(
				      " \"%s\" is an unknown font type. Must be either TTF or OTF!"
					    .printf(path)
				    );
				}
			}
		
			/**
			 * Hidden constructor. This class must be derrived
			 *
			 * @param path
			 *  Path to font file
			 */
			protected Font(string path)
			{
				file = File.new_for_path(path);
				nametable = new NameTable();
				try {
				  _filesize = file.query_info("*", FileQueryInfoFlags.NONE, null)
				                  .get_size();
        }
        catch (GLib.Error e) {
          warning("Error querying file size on font file: %s", e.message);
        }
			}
		} // Font
	
		/**
		 * Class for reading true type fonts
		 */
		public class TrueType : Font
		{
			/**
			 * Getter for the font type
			 */
			public override Type TYPE { get { return Type.TrueType; } }

			/**
			 * Creates a new TrueType font object
			 *
			 * @param path
			 *  Path to font file
			 */
			public TrueType(string path)
			   throws GLib.Error, Poppa.Font.Error
			{
				base(path);
				parse();
			}
		
		  /**
		   * Parses the font file
		   */
			private void parse()
			{
				try {
					var fs = file.read(null);
					var s = new DataInputStream(fs);
				
					fs.skip(4, null); // version
					ushort numtables = s.read_uint16(null);
					fs.skip(6, null); // searchrange, entryselector, rangeshift

					string tag      = null;
					uint i          = 0;
					uint32 offset   = 0;

					while (++i < numtables) {
						uint8[] chunk = new uint8[4];
						s.read(chunk, 4, null);
						tag = (string)chunk;

						s.read_uint32(null); // checksum
						offset   = s.read_uint32(null);
						s.read_uint32(null); // length

						if (tag == "name" && offset > 0)
							nametable.read(fs, offset);
					}
				}
				catch (GLib.Error e) {
					warning("Error: %s", e.message);
				}
			}
		} // TrueType
	
		/**
		 * Class for reading Open Type fonts
		 */
		public class OpenType : Font
		{
			/**
			 * Getter for the font type
			 */
			public override Type TYPE { get { return Type.OpenType; } }

			/**
			 * Creates a new OpenType font object
			 *
			 * @param path
			 *  Path to font file
			 */
			public OpenType(string path)
			   throws GLib.Error, Poppa.Font.Error
			{
				base(path);
				parse();
			}
			
			private void parse()
			{
				try {
					var fs = file.read(null);
					var s = new DataInputStream(fs);
					
					uint8[] buf = new uint8[4];
					fs.read(buf, 4, null);
					
					switch ((string)buf)
					{
					  case "OTTO":
					  case "00010000":
					  case "00020000":
					    break;

					  default:
					    var m = "\"%s\" is not an OpenType font".printf(file.get_path());
					    throw new Error.BAD_TYPE(m);
					}

          ushort numtables = s.read_uint16(null);
          // searchrange, entryselector, rangeshift
          fs.skip(8, null);
          
          long i = 0;
          int tablebase = 12;

          while (i++ < numtables) {
            try { fs.seek(tablebase + ((i-1)*16), SeekType.SET, null); }
            catch (GLib.Error e) { break; }

            fs.read(buf, 4, null);

		        //! Naming table. See
		        //! http://partners.adobe.com/public/developer/opentype/
		        //! index_name.html
            if ((string)buf == "name") {
              fs.skip(4, null);
              uint32 offset = s.read_uint32(null);
              nametable.read(fs, offset);
            } 
          }
				}
				catch (GLib.Error e) {
					warning("Error: %s", e.message);
				}
			}
		} // OpenType
	
		/**
		 * Name table class
		 */
		public class NameTable : GLib.Object
		{
			/**
			 * The font's family
			 */
			public string? family { get; private set; }

			/**
			 * The font's subfamily
			 */
			public string? subfamily { get; private set; }
		
			/**
			 * The font's uniq name
			 */
			public string? uniqname { get; private set; }

			/**
			 * The font's full name
			 */
			public string? fullname { get; private set; }
		
			/**
			 * The font's version
			 */
			public string? version { get; private set; }
		
			/**
			 * The font's psname 
			 */
			public string? psname { get; private set; }
		
			/**
			 * The font's trademark
			 */
			public string? trademark { get; private set; }
		
			/**
			 * The font's manufacturer 
			 */
			public string? manufacturer { get; private set; }
		
			/**
			 * The font's designer
			 */
			public string? designer { get; private set; }

			/**
			 * The font's copyright
			 */
			public string? copyright { get; private set; }

			/**
			 * Reads the font's name table
			 *
			 * @param fs
			 * @param offset
			 */
			public void read(FileInputStream fs, uint32 offset)
			  throws GLib.Error
			{
				try {
					DataInputStream s = new DataInputStream(fs);

					fs.seek(offset, SeekType.SET, null);
					fs.skip(2, null); // format
					ushort count  = s.read_uint16(null);
					fs.skip(2, null); // string_offset

					uint tablebase   = offset + 6;
					long storagebase = tablebase + (count * 12);

					ArrayList<ushort> isset = new ArrayList<ushort>();
				
					int j = 0;
					while (++j <= count) {
						fs.seek(tablebase + ((j-1)*12), SeekType.SET, null);

						ushort name_platform_id = s.read_uint16(null);
						ushort name_encoding_id = s.read_uint16(null);
						ushort name_language_id = s.read_uint16(null);
						ushort name_id          = s.read_uint16(null);
						ushort name_length      = s.read_uint16(null);
						ushort name_offset      = s.read_uint16(null);

	          //! ID meanings : figured out from getttinfo
	          //!
	          //! Platform: 0=Apple  1=macintosh  3=microsoft
	          //! Encoding: 0=unicode(8) 1=unicode(16)
	          //! Language: 0=english 1033=English-US 1041=Japanese 2052=Chinese

						if (name_id in isset)
							continue;

            if (name_length < 1)
              continue;

            uint8[] chunk = new uint8[name_length];
						fs.seek(storagebase + name_offset, SeekType.SET, null);
						fs.read(chunk, (size_t)name_length, null);

            string name = (string)chunk;

            if (name.length > 0)
						  isset.add(name_id);
						else
						  continue;

            if (name_encoding_id == 1) {
              if (VERBOSE_OUTPUT)
                warning("Name needs to be UTF-16 decoded");
              //return;
            }

            if (name_language_id != 0 && name_language_id != 1033) {
              if (VERBOSE_OUTPUT)
                warning("Language id (%d) is non-english", name_language_id);
              //return;
            }
            
            if (name_platform_id < 1) {
              // nothing
            }
            
            name = name.normalize();
            
						switch (name_id)
						{
							case 0: copyright    = name; break;
							case 1: family       = name; break;
							case 2: subfamily    = name; break;
							case 3: uniqname     = name; break;
							case 4: fullname     = name; break;
							case 5: version      = name; break;
							case 6: psname       = name; break;
							case 7: trademark    = name; break;
							case 8: manufacturer = name; break;
							case 9: designer     = name; break;
						}
					}
				}
				catch (GLib.Error e) {
					warning("Error reading name table: %s", e.message);
				}	
			}
		} // NameTable

    /**
     * Collect all fonts in path //path//
     *
     * @param path
     */
		public ArrayList<Family> collect_fonts(string path)
		{
		  ArrayList<Family> fonts = new ArrayList<Family>((EqualFunc)Family.equals);
		  low_collect_fonts(path, ref fonts);

		  return fonts;
		}
		
		private void low_collect_fonts(string path, ref ArrayList<Family> cont)
		{
      try {
        var dir = File.new_for_path(path).enumerate_children(
          "standard::name,standard::type,standard::content-type",
          0, null
        );
        
        FileInfo fi;
        string p;
        //ArrayList<Family> isset = new ArrayList<Family>();
        while ((fi = dir.next_file(null)) != null) {
          p = Path.build_filename(path, fi.get_name());
          if (fi.get_file_type() == FileType.DIRECTORY)
            low_collect_fonts(p, ref cont);
          else {
            if (fi.get_content_type() in supported_fonts) {
              Font f;
              try { f = Font.create(p); }
              catch (Error e) {
                stderr.printf("Font load error: %s\n", e.message);
                continue;
              }

              if (f == null || f.family == null) {
                stdout.printf("Notice: Unable to parse \"%s\" correctly!\n", p);
                continue;
              }

              var fam = new Family(f.family);

#if DEBUG
              stdout.printf(">>>>>> Family is: %s (%s)\n", fam.name,
                      cont.contains(fam) ? "Exists":"New");
#endif

              if (fam in cont) {
                fam = cont.get(cont.index_of(fam));
                if (fam != null && !fam.contains(f))
                  fam.add(f);
              }
              else {
                fam.add(f);
                cont.add(fam);
              }

              //isset.add(fam);
            }
          }
        }
      }
      catch (GLib.Error e) {
        warning("File error: %s", e.message);
      }
		}

    /**
     * A collecion of @see{Font} of the same family
     */
		public class Family : Object
		{
		  /**
		   * The name of the font family
		   */
      public string name { get; private set; }
      public ArrayList<Font> fonts;
      public uint size { get { return fonts.size; } }

      /**
       * Creates a new //Family// object
       *
       * @param name
       */
      public Family(string? name)
      {
        this.name = name == null ? "" : name;
        fonts = new ArrayList<Font>();
      }
      
      public void add(Font f)
      {
        fonts.add(f);
      }
      
      public bool contains(Font f)
      {
        foreach (Font ff in fonts)
          if (ff == f)
            return true;
            
        return false;
      }

      /**
       * Checks if @see{Font} //a// equals @see{Font} //b//
       *
       * @param a
       *  A @see{Font} object
       * @param b
       *  A @see{Font} object
       */
      public static bool equals(void** a, void** b)
      {
        return ((Family)a).name == ((Family)b).name;
      }
		}
	} // NS Font
} // NS Poppa
