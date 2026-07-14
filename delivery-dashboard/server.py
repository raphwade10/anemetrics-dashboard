"""Minimal static server for the dashboard.

Serves this file's own directory. Avoids os.getcwd() (blocked in the sandbox)
by chdir-ing to an absolute path derived from __file__.
"""
import http.server
import os
import socketserver

DIRECTORY = os.path.dirname(os.path.abspath(__file__))
os.chdir(DIRECTORY)
PORT = 4599


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)


with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
    print(f"Serving {DIRECTORY} at http://127.0.0.1:{PORT}")
    httpd.serve_forever()
