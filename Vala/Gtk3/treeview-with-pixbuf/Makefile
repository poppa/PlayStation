NULL= 

VALAFLAGS =                                                              \
	--thread                                                               \
	--pkg=gtk+-3.0                                                         \
	--pkg=gio-2.0                                                          \
	--pkg=gdk-pixbuf-2.0                                                   \
	$(NULL)

all:
	valac $(VALAFLAGS) -o test main.vala
	
clean:
	rm test *~
	
