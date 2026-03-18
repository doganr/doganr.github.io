# This file is only used if you use `make publish` or
# explicitly specify it as your config file.

import os
import sys

sys.path.append(os.curdir)
from pelicanconf import *

# If your site is available via HTTPS, make sure SITEURL begins with https://
SITEURL = "https://doganr.com"
RELATIVE_URLS = False

# CI/CD ortamında Google Scholar'a istek atma, sadece commit'lenmiş
# citations_cache.json dosyasından oku. Atıfları güncellemek için
# lokal ortamda `pelican content` çalıştırın.
SCHOLAR_FETCH = False

FEED_ALL_ATOM = "feeds/all.atom.xml"
CATEGORY_FEED_ATOM = "feeds/{slug}.atom.xml"

DELETE_OUTPUT_DIRECTORY = True

# Following items are often useful when publishing

# DISQUS_SITENAME = ""
# GOOGLE_ANALYTICS = ""
