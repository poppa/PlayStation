/* keyfile.vala
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
 * Class for creating and reading key files:
 *
 * {{{
 * [application]
 * name=My app
 * dir=/home/poppa/.my-app
 *
 * [window]
 * width=500
 * height=300
 * }}}
 */
public class Poppa.KeyFile : Object
{
	GLib.List<Index> sections;
	string path;
	/**
	 * Delimiter to use for lists. Default is `;`
	 */
	public string delimiter { get; set; default = ";"; }

	/**
	 * Create a new KeyFile object. If **path** doesn't exist it will be 
	 * created.
	 *
	 * @param path
	 *  Path to the key file
	 */
	public KeyFile(string path)
	{
		sections = new GLib.List<Index>();
		this.path = path;
		File file = File.new_for_path(path);
		if (FileUtils.test(path, FileTest.EXISTS))
			parse();
		else {
			try {
				var fs = file.create_readwrite(FileCreateFlags.NONE, null);
				fs.close(null);
			}
			catch (GLib.Error e) {
				warning("Unable to create file \"%s\"!", path);
			}
		}
	}

	/**
	 * Set string value
	 *
	 * @param index
	 *  The section the value belong to
	 * @param key
	 *  The name of the value
	 * @param val
	 *  The value
	 */
	public void set_string(string index, string key, string val)
	{
		Index idx = get_index(index);
		if (idx == null) {
			idx = new Index(index);
			sections.append(idx);
		}

		idx.set_value(key, val);
	}

	/**
	 * Set interger value
	 *
	 * @param index
	 *  The section the value belong to
	 * @param key
	 *  The name of the value
	 * @param val
	 *  The value
	 */
	public void set_integer(string index, string key, int val)
	{
		Index idx = get_index(index);
		if (idx == null) {
			idx = new Index(index);
			sections.append(idx);
		}

		idx.set_value(key, val.to_string());
	}
	
	/**
	 * Set double value
	 *
	 * @param index
	 *  The section the value belong to
	 * @param key
	 *  The name of the value
	 * @param val
	 *  The value
	 */
	public void set_double(string index, string key, double val)
	{
		Index idx = get_index(index);
		if (idx == null) {
			idx = new Index(index);
			sections.append(idx);
		}

		idx.set_value(key, val.to_string());
	}
	
	/**
	 * Set boolean value
	 *
	 * @param index
	 *  The section the value belong to
	 * @param key
	 *  The name of the value
	 * @param val
	 *  The value
	 */
	public void set_boolean(string index, string key, bool val)
	{
		Index idx = get_index(index);
		if (idx == null) {
			idx = new Index(index);
			sections.append(idx);
		}

		idx.set_value(key, val ? "true" : "false");
	}
	
	/**
	 * Set string list value
	 *
	 * @param index
	 *  The section the value belong to
	 * @param key
	 *  The name of the value
	 * @param val
	 *  The value
	 */
	public void set_string_list(string index, string key, string[] val)
	{
		Index idx = get_index(index);
		if (idx == null) {
			idx = new Index(index);
			sections.append(idx);
		}

		int len = val.length;
		string s = "";
		for (uint i = 0; i < len; i++) {
			s += val[i];
			if (i+1 < len)
				s += delimiter;
		}

		idx.set_value(key, s);
	}
	
	/**
	 * Set integer list value
	 *
	 * @param index
	 *  The section the value belong to
	 * @param key
	 *  The name of the value
	 * @param val
	 *  The value
	 */
	public void set_integer_list(string index, string key, int[] val)
	{
		Index idx = get_index(index);
		if (idx == null) {
			idx = new Index(index);
			sections.append(idx);
		}

		int len = val.length;
		string s = "";
		for (uint i = 0; i < len; i++) {
			s += val[i].to_string();
			if (i+1 < len)
				s += delimiter;
		}

		idx.set_value(key, s);
	}
	
	/**
	 * Set double list value
	 *
	 * @param index
	 *  The section the value belong to
	 * @param key
	 *  The name of the value
	 * @param val
	 *  The value
	 */
	public void set_double_list(string index, string key, double[] val)
	{
		Index idx = get_index(index);
		if (idx == null) {
			idx = new Index(index);
			sections.append(idx);
		}

		int len = val.length;
		string s = "";
		for (uint i = 0; i < len; i++) {
			s += val[i].to_string();
			if (i+1 < len)
				s += delimiter;
		}

		idx.set_value(key, s);
	}

	/**
	 * Returns the value as a string
	 *
	 * @param index
	 *  The section the value belong to
	 * @param key
	 *  The name of the value
	 *
	 * @return
	 *  Returns `null` if the value isn't found
	 */
	public string? get_string(string index, string key)
	{
		Index.Value v = get_value(index, key);
		return v == null ? null : v.val;
	}

	/**
	 * Returns the value as an integer
	 *
	 * @param index
	 *  The section the value belong to
	 * @param key
	 *  The name of the value
	 *
	 * @return
	 *  Returns `null` if the value isn't found
	 */
	public int get_integer(string index, string key)
	{
		Index.Value v = get_value(index, key);
		return v == null ? 0 : v.val.to_int();
	}

	/**
	 * Returns the value as a double
	 *
	 * @param index
	 *  The section the value belong to
	 * @param key
	 *  The name of the value
	 *
	 * @return
	 *  Returns `null` if the value isn't found
	 */
	public double get_double(string index, string key)
	{
		Index.Value v = get_value(index, key);
		return v == null ? 0 : v.val.to_double();
	}
	
	/**
	 * Returns the value as a boolean
	 *
	 * @param index
	 *  The section the value belong to
	 * @param key
	 *  The name of the value
	 *
	 * @return
	 *  Returns `null` if the value isn't found
	 */
	public bool get_boolean(string index, string key)
	{
		Index.Value v = get_value(index, key);
		return v == null ? false : v.val == "true";
	}
	
	/**
	 * Returns the value as a string list
	 *
	 * @param index
	 *  The section the value belong to
	 * @param key
	 *  The name of the value
	 *
	 * @return
	 *  Returns `null` if the value isn't found
	 */
	public string[]? get_string_list(string index, string key)
	{
		Index.Value v = get_value(index, key);
		if (v != null)
			return v.val == null ? null : v.val.split(delimiter);
		
		return null;
	}
	
	/**
	 * Returns the value as an integer list
	 *
	 * @param index
	 *  The section the value belong to
	 * @param key
	 *  The name of the value
	 *
	 * @return
	 *  Returns `null` if the value isn't found
	 */
	public int[]? get_integer_list(string index, string key)
	{
		Index.Value v = get_value(index, key);
		if (v != null) {
			int[] r = new int[]{};
			string[] s = v.val.split(delimiter);
			for (uint i = 0; i < s.length; i++)
				r += s[i].to_int();
				
			return r;
		}
		
		return null;
	}
	
	/**
	 * Returns the value as a double list
	 *
	 * @param index
	 *  The section the value belong to
	 * @param key
	 *  The name of the value
	 *
	 * @return
	 *  Returns `null` if the value isn't found
	 */
	public double[]? get_double_list(string index, string key)
	{
		Index.Value v = get_value(index, key);
		if (v != null) {
			double[] r = new double[]{};
			string[] s = v.val.split(delimiter);
			for (uint i = 0; i < s.length; i++)
				r += s[i].to_double();
				
			return r;
		}
		
		return null;
	}
	
	/**
	 * Saves the values to the file
	 */
	public bool save()
	{
		try {
			var file = File.new_for_path(path);
			var fs = new DataOutputStream(file.open_readwrite(null).output_stream);
			fs.put_string(to_string(), null);
			fs.close(null);
		}
		catch (GLib.Error e) {
			warning("Failed saving file: %s", e.message);
			return false;
		}

		return true;
	}

	/**
	 * Turns the values into a string represenation
	 */
	public string to_string()
	{
		string s = "";
		foreach (Index i in sections)
			s += i.to_string() + "\n";

		return s.strip();
	}
	
	/**
	 * Returns the value object or null if it's not found
	 */
	private Index.Value? get_value(string index, string key)
	{
		Index i = get_index(index);
		if (i != null)
			return i.get_value(key);
		
		return null;	
	}
	
	/**
	 * Returns the Index object with name `key`
	 */
	private Index? get_index(string key)
	{
		foreach (Index idx in sections)
			if (idx.name == key)
				return idx;
				
		return null;
	}
	
	/**
	 * Parses the key file
	 */
	private void parse()
	{
		File f = File.new_for_path(path);
		try {
			string data;
			if (f.load_contents(null, out data, null, null)) {
				string[] lines = data.split("\n");
				Index idx = null;
				foreach (string line in lines) {
					line = line.strip();
					if (line.length == 0 || line[0] == ';')
						continue;

					string tmp = "";
					if (line.scanf("[%[^]]s]\n", tmp) == 1) {
						idx = new Index(tmp);
						sections.append(idx);
						continue;
					}

					if (idx == null)
						continue;

					string[] pts = line.split("=", 2);
					idx.set_value(pts[0], pts[1]);
				}
			}
		}
		catch (GLib.Error e) {
			warning("Failed parsing file: %s", e.message);
		}
	}

	/**
	 * Internal class representing a section
	 */
	internal class Index
	{
		public string name { get; set; } 
		GLib.List<Value> values;

		public Index(string name)
		{
			this.name = name;
			values = new GLib.List<Value>();
		}

		public void set_value(string k, string v)
		{
			Value val = get_value(k);
			if (val == null) {
				val = new Value(k, v);
				values.append(val);
			}
			else {
				val.key = k;
				val.val = v;
			}
		}
		
		public string to_string()
		{
			string s = "[" + name + "]\n";
			foreach (Value v in values)
				s += v.to_string() + "\n";
				
			return s;
		}
		
		public Value? get_value(string k)
		{
			foreach (Value v in values)
				if (v.key == k)
					return v;
					
			return null;
		}

		/**
		 * Internal class representing a key/value pair
		 */
		internal class Value
		{
			public string key;
			public string val;

			public Value(string k, string v)
			{
				key = k;
				val = v;
			}

			public string to_string()
			{
				return key + "=" + val;
			}
		}
	}
}
