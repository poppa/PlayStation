/**
 * Class for testing the Java binding in Pike {@link http://pike.ida.liu.se}
 *
 * @author Pontus Östlund - www.poppa.se
 * @version 0.1
 */
/* Copyright (C) 2011 Pontus Östlund (www.poppa.se)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * The Software shall be used for Good, not Evil.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import java.util.ArrayList;
import java.util.Hashtable;
import java.util.Date;
import java.util.TimeZone;
import java.text.SimpleDateFormat;

/**
 * Class for testing the Java binding in Pike {@link http://pike.ida.liu.se}
 *
 * @author Pontus Östlund - www.poppa.se
 * @version 0.1
 */
public class PikeExample
{
  /**
   * Purpose less constructor
   */
  public PikeExample() {}

  /**
   * Antoher purpose less constructor.
   * Sets intField to num
   *
   * @param num
   */  
  public PikeExample(int num) 
  {
    intField = num;
  }

  /**
   * Version string
   */
  public static String version = "0.1";

  /**
   * A string
   */
  public String stringField = "A string";
  
  /**
   * An integer
   */
  public int intField = 412;

  /**
   * An instance of self
   */
  private static PikeExample instance = null;
  
  /**
   * A static method that returns a string
   */
  public static String whoAmI()
  {
    return "I am PikeExample";
  }
  
  /**
   * Returns an instance of this class
   */
  public static PikeExample getInstance()
  {
    if (instance == null)
      instance = new PikeExample();
    
    return instance;
  }
  
  /**
   * Returns a string value
   */
  public String getString()
  {
    return "Hello from Java";
  }

  /**
   * Returns an integer value
   */
  public int getInt()
  {
    return 666;
  }

  /**
   * Returns a double value
   */
  public double getDouble()
  {
    return 1345.134;
  }

  /**
   * Returns a float value
   */
  public float getFloat()
  {
    return new Float(12.3);
  }

  /**
   * Returns a boolean value
   */
  public boolean getBoolean()
  {
    return true;
  }

  /**
   * Returns a Hashtable where both indices and values are strings
   */
  public Hashtable getHashtable()
  {
    Hashtable<String,String> ht = new Hashtable<String,String>();
    ht.put("index-1", "Value 1");
    ht.put("index-2", "Value 2");
    ht.put("index-3", "Value 3");
    
    return ht;
  }
  
  /**
   * Returns an ArrayList of strings
   */
  public ArrayList<String> getArrayList()
  {
    ArrayList<String> a = new ArrayList<String>();
    a.add("Pike");
    a.add("PHP");
    a.add("PERL");
    a.add("Python");
    a.add("Pascal");

    return a;
  }

  /**
   * Returns an ArrayList of Hashtables where the indices in the
   * Hashtables are strings and the values are of mixed types
   */
  public ArrayList<Hashtable<String,Object>> getArrayOfHashtables()
  {
    ArrayList<Hashtable<String,Object>> a = 
      new ArrayList<Hashtable<String,Object>>();

    Hashtable<String,Object> ht1 = new Hashtable<String,Object>();
    ht1.put("name", "Sylvester Stallone");
    ht1.put("born", 1946);
    ht1.put("acting-in-movies", 59);
    ht1.put("alive", true);

    a.add(ht1);
    
    Hashtable<String,Object> ht2 = new Hashtable<String,Object>();
    ht2.put("name", "Arnold Schwarzenegger");
    ht2.put("born", 1947);
    ht2.put("acting-in-movies", 43);
    ht2.put("alive", true);
    
    a.add(ht2);
    
    Hashtable<String,Object> ht3 = new Hashtable<String,Object>();
    ht3.put("name", "Julianne Moore");
    ht3.put("born", 1960);
    ht3.put("acting-in-movies", 67);
    ht3.put("alive", true);
    
    a.add(ht3);
    
    Hashtable<String,Object> ht4 = new Hashtable<String,Object>();
    ht4.put("name", "Heath Ledger");
    ht4.put("born", 1979);
    ht4.put("acting-in-movies", 23);
    ht4.put("alive", false);
    
    a.add(ht4);
    
    return a;
  }

  /**
   * Returns the current date and time
   */
  public Date getDate()
  {
    return new Date();
  }
  
  /**
   * Returns a Date object of the date/datetime <code>isoDate</code>.
   * 
   * @param isoDate
   *  Can be <code>yyyy-mm-dd</code>, <code>yyyy-mm-dd hh:mm</code>,
   *  <code>yyyy-mm-dd hh:mm:ss</code> or <code>yyyy-mm-dd hh:mm:ss tz</code>
   */
  public Date getDate(String isoDate)
  {
    return getDate(isoDate, "Europe/Stockholm");
  }
  
  /** 
   * Returns a Date object of the date/datetime <code>isoDate</code>.
   * 
   * @param isoDate
   *  Can be <code>yyyy-mm-dd</code>, <code>yyyy-mm-dd hh:mm</code>,
   *  <code>yyyy-mm-dd hh:mm:ss</code> or <code>yyyy-mm-dd hh:mm:ss tz</code>
   * @param timezone
   *  Like Europe/Stockholm, Australia/Melbourne, GMT+2 e t c.
   */
  public Date getDate(String isoDate, String timezone)
  {
    String sfmt = "yyyy-MM-dd";
    
    // Ok, this is an ugly hack ;)
    String[] parts = isoDate.split(":");
    if (parts.length == 2)
      sfmt += " HH:mm";
    else if (parts.length == 3)
      sfmt += " HH:mm:ss";

    if (isoDate.indexOf("+") > -1)
      sfmt += " Z";
    
    SimpleDateFormat fmt = new SimpleDateFormat(sfmt);
    fmt.setTimeZone(TimeZone.getTimeZone(timezone));

    try {
      return fmt.parse(isoDate);
    }
    catch (Exception e) {
      System.err.printf("Date parse error: %s\n", e.getMessage());
    }
    
    return null;
  }
  
  /**
   * Dumps a String to stdout
   * @param s
   */
  public void dumpString(String s)
  {
    System.out.printf("Got string: %s\n", s);
  }
  
  /**
   * Dumps an Integer to stdout
   * @param i
   */
  public void dumpInteger(Integer i)
  {
    System.out.printf("Got Integer: %d\n", i);
  }

  /**
   * Dumps an int to stdout
   * @param i
   */
  public void dumpInteger(int i)
  {
    System.out.printf("Got int: %d\n", i);
  }

  /**
   * Dumps a Float to stdout
   * @param f
   */
  public void dumpFloat(Float f)
  {
    System.out.printf("Got Float: %f\n", f);
  }

  /**
   * Dumps a Double to stdout
   * @param d
   */
  public void dumpDouble(Double d)
  {
    System.out.printf("Got Double: %f\n", d);
  }

  /**
   * Dumps a double to stdout
   * @param d
   */
  public void dumpDouble(double d)
  {
    System.out.printf("Got double: %f\n", d);
  }

  /**
   * Dumps a boolean to stdout
   * @param b
   */
  public void dumpBoolean(boolean b)
  {
    System.out.printf("Got boolean: %s\n", b ? "TRUE" : "FALSE");
  }
  
  /**
   * Dumps a Boolean to stdout
   * @param b
   */
  public void dumpBoolean(Boolean b)
  {
    System.out.printf("Got Boolean: %s\n", b ? "TRUE" : "FALSE");
  }

  /**
   * Dumps an ArrayList to stdout
   * @param al
   */
  public void dumpArrayList(ArrayList al)
  {
    System.out.printf("Got ArrayList: %s\n", al);
  }

  /**
   * Dumps a Hashtable to stdout
   * @param ht
   */
  public void dumpHashtable(Hashtable ht)
  {
    System.out.printf("Got Hashtable: %s\n", ht);
  }
  
  /**
   * Dumps a date object to stdout
   * @param date
   */
  public void dumpDate(Date date)
  {
    System.out.printf("%s\n", date);
  }
}