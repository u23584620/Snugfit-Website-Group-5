#!/usr/bin/env python3
"""
Simple HTTP server to host the Snugfit website locally.
Access the website from your phone by connecting to the same WiFi network.
"""

import http.server
import socketserver
import socket

# Configuration
PORT = 8000
DIRECTORY = "."

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Add headers to prevent caching during development
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()

def get_local_ip():
    """Get the local IP address of this machine."""
    try:
        # Create a socket to get the local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return "localhost"

if __name__ == "__main__":
    local_ip = get_local_ip()
    
    with socketserver.TCPServer(("0.0.0.0", PORT), MyHTTPRequestHandler) as httpd:
        print("=" * 60)
        print(f"🚀 Snugfit Website Server Running!")
        print("=" * 60)
        print(f"\n📱 Access from your phone (same WiFi):")
        print(f"   http://{local_ip}:{PORT}/Home.html")
        print(f"\n💻 Access from this computer:")
        print(f"   http://localhost:{PORT}/Home.html")
        print(f"\n⚠️  Make sure your phone is connected to the same WiFi network")
        print(f"\n🛑 Press Ctrl+C to stop the server")
        print("=" * 60)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 Server stopped.")
