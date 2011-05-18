//! Helper module for the Java binding in Pike.
//|
//| Copyright (C) 2011 Pontus Östlund (www.poppa.se)
//|
//| Permission is hereby granted, free of charge, to any person obtaining a copy
//| of this software and associated documentation files (the "Software"), to
//| deal in the Software without restriction, including without limitation the
//| rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
//| sell copies of the Software, and to permit persons to whom the Software is
//| furnished to do so, subject to the following conditions:
//|
//| The above copyright notice and this permission notice shall be included in
//| all copies or substantial portions of the Software.
//|
//| The Software shall be used for Good, not Evil.
//|
//| THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//| IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//| FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//| AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//| LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//| OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//| THE SOFTWARE.

#ifdef JDEBUG
# define TRACE(X...) werror("%s:%d: %s",basename(__FILE__),__LINE__,sprintf(X))
#else
# define TRACE(X...) 0
#endif

//! Creates a Java @tt{Hashtable@} from a Pike @tt{mapping@}
//!
//! @param m
object JHashtable(mapping m) // {{{
{
  object ht = Java.pkg["java/util/Hashtable"]();
  foreach (m; mixed k; mixed v)
    ht->put(encode(k), encode(v));

  return ht;
} // }}}

//! Creates a Java @tt{ArrayList@} from a Pike @tt{mapping@}
//!
//! @param a
object JArrayList(array a) // {{{
{
  object al = Java.pkg["java/util/ArrayList"]();

  foreach (a, mixed v)
    al->add(encode(v));

  return al;
} // }}}

//! Creates a Java String object.
//! This is the same as @[Java.JString]
constant JString = Java.JString;

//! Creates a Java Integer object.
//! This is the same as @[Java.JInteger]
constant JInteger = Java.JInteger;

//! Creates a Java Float object.
//! This is the same as @[Java.JFloat]
constant JFloat = Java.JFloat;

//! Creates a Java Boolean object.
//! This is the same as @[Java.JBoolean]
constant JBoolean = Java.JBoolean;

//! Creates a Java Array object.
//! This is the same as @[Java.JArray]
constant JArray = Java.JArray;

//! Creates a Java HashMap object.
//! This is the same as @[Java.JHashMap]
constant JHashMap = Java.JHashMap;

//! Encodes Pike data types to Java objects which can be passed as aguments
//! to Java methods.
//!
//! @param pike
object encode(mixed pike) // {{{
{
  if (stringp(pike))
    return JString(pike);

  else if (intp(pike))
    return JInteger(pike);

  else if (floatp(pike))
    return JFloat(pike);

  else if (arrayp(pike))
    return JArrayList(pike);

  else if (mappingp(pike))
    return JHashtable(pike);

  else if (multisetp(pike))
    return JArrayList((array)pike);

  else if (objectp(pike)) {
    if (sprintf("%O", object_program(pike)) == "Java.jobject")
      return pike;
  }

  error("Unhandled Pike type: %O\n", pike);
} // }}}

//! Decodes a result from Java to Pike datatypes.
//!
//! Handles:
//! @ul
//!  @item
//!   java.util.ArrayList
//!  @item
//!   java.util.Hashtable
//!  @item
//!   java.lang.String
//!  @item
//!   java.lang.Integer
//!  @item
//!   java.lang.Double
//!  @item
//!   java.lang.Boolean
//! @endul
//!
//! @param jobj
//!  Result from a Java method call
mixed decode(mixed jobj) // {{{
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
      	ret += ({ decode(o) });

      break;

    case "java.util.Hashtable":
      ret = ([]);
      foreach (values(jobj->entrySet()->toArray()), object set)
	ret[decode(set->getKey())] = decode(set->getValue());

      break;

    case "java.lang.String":
      return string_to_utf8((string)jobj);

    case "java.lang.Integer":
      return jobj->intValue();

    case "java.lang.Float":
    case "java.lang.Double":
      return jobj->floatValue();

    case "java.lang.Boolean":
      return jobj->booleanValue();

    default:
      error("Unhandled Java type: %O\n", type);
  }

  return ret;
} // }}}

//! Reflects a Java object. Prints to stdout.
//!
//! @param instance
//!  The Java object to reflect
void reflect(object instance) // {{{
{
  if (sprintf("%O", object_program(instance)) != "Java.jobject") {
    werror("%O is not a Java.jobject object!\n", instance);
    return;
  }

  object klass = instance->getClass();
  //object obj_klass = Java.pkg[(string)klass->getName()];

  write("\nReflect Java class %O\n", (string)klass->getName());

  write("\nConstructors:\n");
  foreach (values(klass->getConstructors()), object o)
    write("  * %s\n", (string)o->toGenericString());

  write("\nFields:\n");
  foreach (values(klass->getFields()), object o)
    write("  * %s\n", (string)o->toGenericString());

  write("\nMethods:\n");
  foreach (values(klass->getMethods()), object o)
    write("  * %s\n", (string)o->toGenericString());
} // }}}
