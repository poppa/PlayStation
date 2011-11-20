/* (filename).vala
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

using Soup;

int main(string[] args)
{
	string url = "http://inet.tvdomain.local/om-oss/press/bilder-och-logotyper" +
	             "/ledningsgrupp/anders-moritz/Anders_Moritz_neutral_110530.tif";

  var session = new Soup.SessionSync ();
  var message = new Soup.Message ("GET", url);
  message.request_headers.append ("cookie", "RoxenACauth=Mjpxbzlqc2xVeGVvaUd" +
                                            "JSXhMYmhCTmx0ejY=; " +
                                            "RoxenALparams=\"tmtlMOEGA2JyX21" +
                                            "vZGVmTqZzYgYDdHZhYnd3d6Z3YSY=\"");
	message.request_headers.append ("translate", "f");

	session.queue_message(message, on_message_data);
  
  stdout.printf("Message queued!\n");

	new MainLoop(null).run();
	
	return 0;

}

void on_message_data (Soup.Session sess, Soup.Message mess)
{
	if (mess.status_code == Soup.KnownStatusCode.OK) {
		print ("# Got data!\n");

		var f = File.new_for_path ("pic.tif");

		if (f.query_exists (null)) {
			try {
				var s = f.open_readwrite (null);
				s.truncate_fn (0, null);
				s.output_stream.write (mess.response_body.data, null);
			}
			catch (GLib.Error e) {
				warning ("Unable to write to file: %s", e.message);
			}
		}
		else {
			try {
				var s = f.create_readwrite (FileCreateFlags.NONE);
				s.output_stream.write (mess.response_body.data, null);
			}
			catch (GLib.Error e) {
				warning ("Unable to create file: %s", e.message);
			}
		}
	}
	else {
		warning ("Bad status code (%ld) in response\n", mess.status_code);
	}
}

