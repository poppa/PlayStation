NULL = 

AM_CPPFLAGS =                                                             \
	$(IMGOPT_CFLAGS)                                                        \
	-include $(CONFIG_HEADER)                                               \
	$(NULL)

bin_PROGRAMS = imgopt

imgopt_SOURCES =                                                          \
	main.vala                                                               \
	$(NULL)

imgopt_VALAFLAGS =                                                        \
	--pkg=gdk-2.0                                                           \
	--pkg=gio-2.0                                                           \
	--pkg=gdk-pixbuf-2.0                                                    \
	--vapidir=.                                                             \
	--pkg=config                                                            \
	$(NULL)

imgopt_LDADD =                                                            \
	$(IMGOPT_LIBS)                                                          \
	$(NULL)

EXTRA_DIST =                                                              \
	$(NULL)

DISTCLEANFILES =                                                          \
	$(NULL)

