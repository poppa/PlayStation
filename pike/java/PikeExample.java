import java.util.*;

public class PikeExample
{
  public PikeExample() {}
  
  public String getString()
  {
    return "Hello from Java";
  }
  
  public int getInt()
  {
    return 24;
  }

  public int getRandomInt()
  {
    return new Random().nextInt();
  }

  public int getRandomInt(int max)
  {
    return new Random().nextInt(max);
  }
  
  public Hashtable getHashtable()
  {
    Hashtable<String,String> ht = new Hashtable<String,String>();
    ht.put("key1", "Value 1");
    ht.put("key2", "Value 2");
    ht.put("key3", "Value 3");
    ht.put("key4", "Value 4");
    ht.put("key5", "Value 5");
    
    return ht;
  }
  
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
}