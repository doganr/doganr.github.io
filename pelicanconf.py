AUTHOR = 'Ramazan Ozgur Dogan'
SITENAME = 'Doğan R.'
SITEURL = ""

PATH = "content"

TIMEZONE = 'Europe/Istanbul'

DEFAULT_LANG = 'en'

# Tarih formatı (İngilizce formatında görünmesi için)
LOCALE = ['tr_TR.utf8', 'en_US.utf8', 'tr_TR.UTF-8', 'en_US.UTF-8', 'tr_TR', 'en_US']
DATE_FORMATS = {
    'en': '%a, %d %b %Y', 
    'tr': '%d %B %Y',  # Türkçe tarih formatı (Gün Ay Yıl)
}

# --- EKLENTİ AYARLARI ---
# Eklentilerin aranacağı klasör (Eğer pelican-bibtex'i plugins klasörüne kurduysanız)
PLUGIN_PATHS = ['plugins']

# Tüm aktif eklentiler
PLUGINS = [
    'i18n_subsites',   # İngilizce/Türkçe dil desteği (Zaten vardı)
    'render_math',     # LaTeX ve Matematiksel formül desteği
    'sitemap',         # Google SEO indekslemesi için
    'pelican-bibtex'   # .bib uzantılı yayın dosyalarını okumak için
]

# BibTeX dosyası için kaynak yol (Publications sayfası için)
PUBLICATIONS_SRC = 'content/extra/papers.bib'

# Jinja2 Ortamı (Tema desteği için gerekli)
JINJA_ENVIRONMENT = {
    'extensions': ['jinja2.ext.i18n'],
}

THEME = 'themes/Dogan'

# Bootstrap-Dogan Theme Settings
SITETITLE = 'Doğan R.'
SITESUBTITLE = 'Asst. Prof. • Trabzon University'
SITEDESCRIPTION = 'Academic blog of Asst. Prof. Ramazan Özgür Doğan — AI researcher at Trabzon University. Deep learning, medical imaging, and beyond.'
SITELOGO = 'images/prof_pic.jpg'  # Set to image path if you have a profile photo
DISPLAY_PAGES_ON_MENU = True
DISABLE_URL_HASH = True

# Sitemap (SEO) Ayarları
SITEMAP = {
    'format': 'xml',
    'priorities': {'articles': 0.8, 'indexes': 0.5, 'pages': 0.5},
    'changefreqs': {'articles': 'monthly', 'indexes': 'daily', 'pages': 'monthly'}
}

# Content paths
PAGE_PATHS = ['pages']
# Note: en/ and tr/ are handled by i18n_subsites via Lang: metadata

# Statik dosyaların aranacağı klasörler
STATIC_PATHS = ['images', 'extra', 'slides']

# 2. Pelican'ın bu klasördeki dosyaları içerik (makale/sayfa) olarak okumasını engelle
ARTICLE_EXCLUDES = ['slides']
PAGE_EXCLUDES = ['slides']

# 3. Slides içindeki HTML dosyalarını Pelican okuyucularının (readers) görmemesi için:
# Bu ayar Pelican'ın o klasördeki .html dosyalarını 'işlenecek içerik' listesinden çıkarır.
READERS = {'html': None} 
# NOT: Eğer başka normal .html sayfalarınız varsa yukarıdaki riskli olabilir. 
# Onun yerine en garanti yol şudur:
IGNORE_FILES = ['slides/*.html', 'slides/**/*.html']

# Extra klasöründeki dosyaların URL'lerdeki karşılığı
EXTRA_PATH_METADATA = {
    'extra/favicon.ico': {'path': 'favicon.ico'},
    'extra/CNAME': {'path': 'CNAME'},
}

# İngilizce/Türkçe Yapılandırması
I18N_SUBSITES = {
    'tr': {
        'SITENAME': 'Dogan R. (TR)',
        'LOCALE': 'tr_TR.UTF-8',  # <-- .UTF-8 eklendi
        'THEME': 'themes/Dogan',
    }
}

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

# Navigation links (shown alongside pages in navbar)
#LINKS = (
#    ("doganr.com", "https://doganr.com/"),
#    ("Google Scholar", "https://scholar.google.com/citations?user=F2NkKNAAAAAJ"),
#)

# Social media links
SOCIAL = (
    ("GitHub", "https://github.com/doganr", "fa-brands fa-github"),
    ("LinkedIn", "https://www.linkedin.com/in/ramazanozgurdogan/", "fa-brands fa-linkedin"),
    ("Google Scholar", "https://scholar.google.com/citations?user=F2NkKNAAAAAJ", "fa-brands fa-google-scholar"),
    ("E-posta", "mailto:dogan@trabzon.edu.tr", "fa-solid fa-envelope"), 
)

DEFAULT_PAGINATION = 10

# Uncomment following line if you want document-relative URLs when developing
# RELATIVE_URLS = True

import json
import os

# CV Verisini JSON'dan Oku ve Şablonlara Gönder
cv_path = os.path.join(PATH, 'extra', 'cv.json')
if os.path.exists(cv_path):
    with open(cv_path, 'r', encoding='utf-8') as f:
        CV_DATA = json.load(f)
else:
    CV_DATA = {}
