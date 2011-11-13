#!/usr/bin/env pike
/* -*- Mode: Pike; indent-tabs-mode: t; c-basic-offset: 2; tab-width: 8 -*- */
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
 
import ".";

#define HR() write("\n%s\n\n", "-"*80)

int main(int argc, array(string) argv)
{
  object java = Java.pkg.PikeExample();

  Kaffe.reflect(java);
  
  //werror("%O\n", Kaffe.decode(java->getDate()));
  
  //return 0;
  
  HR();
  
  java->dumpString("Hello from Pike");
  
  HR();
  
  java->dumpInteger(1234);
  java->dumpInteger(Kaffe.encode(1234));

  HR();
  
  java->dumpFloat(Kaffe.encode(12.34));
  
  HR();
  
  mapping m = ([ "key-1" : "Value 1",
                 "key-2" : "Value 2",
                 "Key-3" : "Value 3" ]);
  java->dumpHashtable(Kaffe.encode(m));

  HR();

  array(string) a = ({ "Pike", "PHP", "PERL", "Pascal", "Python" });
  java->dumpArrayList(Kaffe.encode(a));
  
  HR();
  
  array(mapping) am = ({
    ([ "acting-in-movies": 59,
       "alive": 1,
       "born": 1946,
       "name": "Sylvester Stallone" ]),
    ([ "acting-in-movies": 43,
       "alive": 1,
       "born": 1947,
       "name": "Arnold Schwarzenegger" ]),
    ([ "acting-in-movies": 67,
       "alive": 1,
       "born": 1960,
       "name": "Julianne Moore" ]),
    ([ "acting-in-movies": 23,
       "alive": 0,
       "born": 1979,
       "name": "Heath Ledger" ])
  });

  java->dumpArrayList(Kaffe.encode(am));
  
  HR();

  string s = Kaffe.decode(Java.pkg.PikeExample.version); 
  write("Static string from PikeExample. It says version is: %s\n", s);
  
  return 0;
}
