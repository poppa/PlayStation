#!/usr/bin/env pike
/* -*- Mode: Pike; indent-tabs-mode: t; c-basic-offset: 2; tab-width: 8 -*- */

#ifdef JDEBUG
# define TRACE(X...) werror("%s:%d: %s",basename(__FILE__),__LINE__,sprintf(X))
#else
# define TRACE(X...) 0
#endif

int main(int argc, array(string) argv)
{
  object java = Java.pkg.PikeExample();
  
  string str = java_to_pike(java->getString());
  write("String: %s\n\n", str);
  
  int rnd = java_to_pike(java->getRandomInt(12));
  write("Random int: %d\n\n", rnd);
  
  mapping(string:string) table = java_to_pike(java->getHashtable());
  write("Hashtable: %O\n\n", table);

  array(string) arr = java_to_pike(java->getArrayList());
  write("ArrayList: %O\n\n", arr);

  array(mapping(string:string|int)) arr2 =
    java_to_pike(java->getArrayOfHashtables());
  write("ArrayList of Hashtables: %O\n", arr2);
  
  return 0;
}

//! Decodes a result from Java to Pike datatypes.
//!
//! Handles: 
//! @ul
//!  @item java.util.ArrayList
//!  @item java.util.Hashtable
//!  @item java.lang.String
//!  @item java.lang.Integer
//!  @item java.lang.Double
//!  @item java.lang.Boolean
//! @endul
//!
//! @param jobj
//!  Result from a Java method call
mixed java_to_pike(mixed jobj) // {{{
{
  mixed ret;
  string type;
  if (objectp(jobj))
    type = (string)jobj->getClass()->getName();
  else
    return jobj;

  TRACE("Java type is: %s\n", type);
  
  switch (type)
  {
    case "java.util.ArrayList":
      ret = ({});
      foreach (values(jobj->toArray()), object o)
      	ret += ({ java_to_pike(o) });

      break;

    case "java.util.Hashtable":
      ret = ([]);
      foreach (values(jobj->entrySet()->toArray()), object set)
	ret[(string)set->getKey()] = java_to_pike(set->getValue());

      break;

    case "java.lang.String":
      return (string)jobj;

    case "java.lang.Integer":
      return jobj->intValue();

    case "java.lang.Double":
      return jobj->floatValue();
      
    case "java.lang.Boolean":
      return jobj->booleanValue();

    default:
      error("Unhandled Java type: %O\n", type);
  }

  return ret;
} // }}}