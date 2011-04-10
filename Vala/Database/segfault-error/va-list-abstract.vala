int main(string[] args)
{
  return 0;
}

public abstract class Base : GLib.Object
{
  public abstract int query(string query, ... );
}

public class Child : Base
{
  public override int query(string query, ... )
  {
    return 1;
  }
}
