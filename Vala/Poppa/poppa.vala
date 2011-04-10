/* poppa.vala
 *
 * This file contains various utility methods and classes
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

namespace Poppa
{
  errordomain Error
  {
    ANY
  }

  /**
   * Returns the content of file //file//.
   *
   * @param file
   */
  public string? file_get_contents(string file)
  {
    if (!FileUtils.test(file, FileTest.EXISTS)) {
      warning("No such file: %s", file);
      return null;
    }

    string output;
    try { FileUtils.get_contents(file, out output, null); }
    catch (GLib.Error e) {
      warning("%s", e.message);
    }
    return output;
  }
  
  /**
   * Checks if file //file// exists.
   *
   * @param file
   */
  public bool file_exists(string file)
  {
    return FileUtils.test(file, FileTest.EXISTS);
  }

  /**
   * Joins array //s// with //glue//.
   *
   * param s
   * param glue
   */
  public string array_implode(string[] s, string glue)
  {
    long len = s.length;
    var str = "";
    for (int i = 0; i < len; i++) {
      str += s[i];
      if (i < len-1)
        str += glue;
    }

    return str;
  }

  /**
   * Returns a slice of array //s// from //from// to //to//. If //to// is 
   * omitted the slice will be to the end of the array
   *
   * @param s
   * @param from
   * @param to
   *
   * @throw
   *  Throws an error if //to// is larger than  //s// length
   */
  public string[] array_slice(string[] s, uint from, uint to=0) 
  	throws Poppa.Error
  {
    if (to == 0) to = s.length - from;
    if (from+to > s.length) {
      throw new Poppa.Error.ANY("array_slice(): \"to\" is larger than " +
                                "array length");
    }

    string[] ss = {};
    var limit = from+to;
    for (uint i = from; i < limit; i++)
      ss += s[i];

    return ss;
  }
  
  /**
   * Trims string //s// of //tail// from the end. If //tail// is omitted white 
   * space characters will be removed.
   *
   * @param s
   * @param tail
   */
  public string rtrim(string s, string tail="")
  {
    if (tail == "")
      return s.chomp();

    var str = s.dup();
    long len = tail.length;
    while (str.has_suffix(tail))
      str = str.substring(0, str.length-len);
      
    return str; 
  }
  
  /**
   * Trims string //s// of //head// from the start. If //tail// is omitted white 
   * space characters will be removed.
   *
   * @param s
   * @param head
   */
  public string ltrim(string s, string head="")
  {
    if (head == "")
      return s.chug();

    var str = s.dup();
    long len = head.length;
    while (str.has_prefix(head))
      str = str.substring(len);
      
    return str;
  }

  /**
   * Trims string //s// of //chars//. If //tail// is omitted white space 
   * characters will be removed.
   *
   * @param s
   * @param tail
   */  
  public string trim(string s, string chars="")
  {
    if (chars == "")
      return s.strip();

    return ltrim(rtrim(s, chars), chars);
  }
  
  /**
   * Returns the last modified time of //path// as a DateTime object
   *
   * @param path
   */
  public DateTime? filemtime(string path)
  {
    try {
      var f = File.new_for_path(path);
      if (f.query_exists(null)) {
        var fi = f.query_info(FILE_ATTRIBUTE_TIME_MODIFIED, 
                              FileQueryInfoFlags.NONE, null);
        TimeVal tv;
        fi.get_modification_time(out tv);
        return DateTime.timeval(tv);
      }
    }
    catch (GLib.Error e) {
      warning("get_fileinfo(): %s", e.message);
    }
    
    return null;
  }

  /**
   * Returns the creation time of //path// as a DateTime object
   *
   * @param path
   */ 
  public DateTime? filectime(string path)
  {
    try {
      var f = File.new_for_path(path);
      if (f.query_exists(null)) {
        var fi = f.query_info(FILE_ATTRIBUTE_TIME_CREATED,
                              FileQueryInfoFlags.NONE, null);

        var ts = fi.get_attribute_uint64(FILE_ATTRIBUTE_TIME_CREATED);
        return DateTime.unixtime((time_t)ts);
      }
    }
    catch (GLib.Error e) {
      warning("get_fileinfo(): %s", e.message);
    }
    
    return null;
  }

  /**
   * Simple date and time class
   */
  public class DateTime : Object
  {
    TimeVal tv = TimeVal();
    Time time;

    /**
     * Creates a new DateTime object with the current time
     *
     * @return
     */
    public static DateTime now()
    {
      return new DateTime.from_now();
    }

    /**
     * Creates a new DateTime object from ++timestamp++
     *
     * @param timestamp
     * @return
     */
    public static DateTime unixtime(time_t timestamp)
    {
      return new DateTime.from_unixtime(timestamp);
    }
    
    /**
     * Creates a new DateTime object from a {@see TimeVal} struct
     *
     * @param timeval
     * @return
     */
    public static DateTime timeval(TimeVal timeval)
    {
      return new DateTime.from_timeval(timeval);
    }

    /**
     * Creates a new DateTime object.
     *
     * @param year
     * @param month
     * @param date
     * @param hour
     * @param minute
     * @param second
     */
    public DateTime(uint year=1970, uint month=1, uint date=1, uint hour=1,
                    uint minute=0, uint second=0)
    {
      var a = "%ld-%ld-%ld %ld:%ld:%ld".printf(year, month, date, hour,
                                               minute, second);
      var s = "%Y-%m-%d %T.000000Z";
      time = Time();
      time.strptime(a,s);
      tv.from_iso8601(time.format(s).replace(" ", "T"));
    }
    
    /**
     * Creates a new DateTime object from the current time
     */
    public DateTime.from_now()
    {
      tv.get_current_time();
      time = Time.local(tv.tv_sec);
    }
    
    /**
     * Creates a new DateTime object from a unix timestamp
     */
    public DateTime.from_unixtime(time_t unixtime)
    {
      time = Time.local(unixtime);
      tv.tv_sec = time.mktime();
    }
    
    /**
     * Creates a new DateTime object from a {@see TimeVal} struct
     */
    public DateTime.from_timeval(TimeVal timeval)
    {
      tv = timeval;
      time = Time.local(tv.tv_sec);
    }

    /**
     * Format time according to ++fmt++
     *
     * @param fmt
     * @return
     */
    public string format(string fmt)
    {
      return time.format(fmt);
    }
    
    /**
     * Returns the time as a string according to the current locale
     *
     * @return
     */
    public string to_string()
    {
      return time.to_string();
    }
    
    /**
     * Returns the date formatted as a ISO 8601 date
     *
     * @return
     */
    public string to_iso8601()
    {
      return tv.to_iso8601();
    }

    /**
     * Returns the date as a unix timestamp struct
     */
    public time_t to_unixtime()
    {
      return time.mktime();
    }
  }
}
