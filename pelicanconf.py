AUTHOR = 'Ramazan Ozgur Dogan'
SITENAME = 'Doğan R.'
SITEURL = ""
MAIN_SITEURL = ""  # Her zaman ana sitenin kök URL'si — statik dosyalar (görseller, logo) için kullanılır

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
SITELOGO = 'images/prof_pic.jpg'
DISPLAY_PAGES_ON_MENU = True
DISABLE_URL_HASH = True

# ── TRANSLATABLE UI STRINGS (English defaults) ──

# Hero Section (index.html)
HERO_NAME = 'Asst. Prof. Ramazan Özgür Doğan'
HERO_AFFILIATION = 'Trabzon University · Department of Artificial Intelligence Engineering'
HERO_BIO_1 = 'Dr. Doğan is a faculty member in the Department of Artificial Intelligence Engineering at Trabzon University. His research focuses on deep learning, biomedical image and signal processing, and AI-powered applications in pharmacology and drug interaction prediction.'
HERO_BIO_2 = 'He received his Ph.D. in Computer Engineering (Karadeniz Technical University) and has held academic positions in both Türkiye and the United States, including research visits at The Ohio State University and Youngstown State University.'
HERO_BIO_3 = 'His current work explores multimodal learning, medical foundation models, and interpretable AI in healthcare.'
HERO_TERMINAL_TITLE = 'dogan@trabzon.edu.tr: ~'
HERO_TERMINAL_DEPT = 'AI Engineering'
HERO_TERMINAL_UNIV = 'Trabzon University'
HERO_TERMINAL_LOC = 'Türkiye'

# Selected Publications Section (index.html)
PUB_BADGE = 'Research Outputs'
PUB_TITLE = 'Selected Publications'

# Publications Page (publications.html)
PUBPAGE_BADGE = 'Academic Outcomes'
PUBPAGE_TITLE = 'Publications'
PUBPAGE_SUBTITLE = 'Research articles, conference proceedings, and reviews.'

# About / CV Page (about.html)
ABOUT_BADGE = 'About Me'
ABOUT_TITLE = 'Curriculum Vitae'
ABOUT_SIDEBAR_TITLE = 'Contents'
ABOUT_SIDEBAR_BASICS = 'Basics'
ABOUT_SIDEBAR_WORK = 'Work Experience'
ABOUT_SIDEBAR_EDU = 'Education'
ABOUT_SIDEBAR_SKILLS = 'Skills'
ABOUT_SIDEBAR_LANGS = 'Languages'
ABOUT_SIDEBAR_AWARDS = 'Awards'
ABOUT_CV_NAME = 'Name'
ABOUT_CV_TITLE = 'Title'
ABOUT_CV_EMAIL = 'Email'
ABOUT_CV_WEBSITE = 'Website'
ABOUT_CV_SUMMARY = 'Summary'

# Teaching Page (teaching.html)
TEACH_BADGE = 'Academic Courses'
TEACH_TITLE = 'Teaching & Mentorship'
TEACH_SUBTITLE = 'Courses, educational materials, and academic mentorship activities within the Department of Artificial Intelligence Engineering.'
TEACH_VIEW_COURSE = 'View Course'

# Footer (partial/footer.html)
FOOTER_POWERED = 'Powered by'
FOOTER_BUILT_WITH = 'Built with'
FOOTER_AND_COFFEE = 'and a lot of ☕.'

# Sitemap (SEO) Ayarları
SITEMAP = {
    'format': 'xml',
    'priorities': {'articles': 0.8, 'indexes': 0.5, 'pages': 0.5},
    'changefreqs': {'articles': 'monthly', 'indexes': 'daily', 'pages': 'monthly'}
}

# Content paths
PAGE_PATHS = ['pages']

# Statik dosyaların aranacağı klasörler
STATIC_PATHS = ['images', 'extra', 'slides']

# Pelican'ın bu klasördeki dosyaları içerik olarak okumasını engelle
ARTICLE_EXCLUDES = ['slides']
PAGE_EXCLUDES = ['slides']

READERS = {'html': None}
IGNORE_FILES = ['slides/*.html', 'slides/**/*.html']

# Extra klasöründeki dosyaların URL'lerdeki karşılığı
EXTRA_PATH_METADATA = {
    'extra/favicon.ico': {'path': 'favicon.ico'},
    'extra/CNAME': {'path': 'CNAME'},
}

# ── İngilizce/Türkçe Yapılandırması ──
I18N_SUBSITES = {
    'tr': {
        'SITENAME': 'Doğan R.',
        'SITETITLE': 'Doğan R.',
        'SITESUBTITLE': 'Dr. Öğr. Üyesi • Trabzon Üniversitesi',
        'SITEDESCRIPTION': 'Dr. Öğr. Üyesi Ramazan Özgür Doğan\'ın akademik blogu — Trabzon Üniversitesi\'nde yapay zeka araştırmacısı. Derin öğrenme, tıbbi görüntüleme ve daha fazlası.',
        'LOCALE': 'tr_TR.UTF-8',
        'THEME': 'themes/Dogan',

        # Hero
        'HERO_NAME': 'Dr. Öğr. Üyesi Ramazan Özgür Doğan',
        'HERO_AFFILIATION': 'Trabzon Üniversitesi · Yapay Zeka Mühendisliği Bölümü',
        'HERO_BIO_1': 'Dr. Doğan, Trabzon Üniversitesi Yapay Zeka Mühendisliği Bölümü öğretim üyesidir. Araştırma alanları derin öğrenme, biyomedikal görüntü ve sinyal işleme ile yapay zeka destekli farmakoloji ve ilaç etkileşimi tahmini uygulamalarıdır.',
        'HERO_BIO_2': 'Doktorasını Karadeniz Teknik Üniversitesi Bilgisayar Mühendisliği bölümünde tamamlamış olup Türkiye ve Amerika Birleşik Devletleri\'nde, The Ohio State University ve Youngstown State University dahil çeşitli akademik pozisyonlarda bulunmuştur.',
        'HERO_BIO_3': 'Güncel çalışmaları çok modlu öğrenme, medikal temel modeller ve açıklanabilir yapay zeka üzerinedir.',
        'HERO_TERMINAL_DEPT': 'Yapay Zeka Müh.',
        'HERO_TERMINAL_UNIV': 'Trabzon Üniversitesi',

        # Publications
        'PUB_BADGE': 'Araştırma Çıktıları',
        'PUB_TITLE': 'Seçili Yayınlar',
        'PUBPAGE_BADGE': 'Akademik Çıktılar',
        'PUBPAGE_TITLE': 'Yayınlar',
        'PUBPAGE_SUBTITLE': 'Araştırma makaleleri, konferans bildirileri ve derlemeler.',

        # About / CV
        'ABOUT_BADGE': 'Hakkımda',
        'ABOUT_TITLE': 'Özgeçmiş',
        'ABOUT_SIDEBAR_TITLE': 'İçindekiler',
        'ABOUT_SIDEBAR_BASICS': 'Temel Bilgiler',
        'ABOUT_SIDEBAR_WORK': 'İş Deneyimi',
        'ABOUT_SIDEBAR_EDU': 'Eğitim',
        'ABOUT_SIDEBAR_SKILLS': 'Beceriler',
        'ABOUT_SIDEBAR_LANGS': 'Diller',
        'ABOUT_SIDEBAR_AWARDS': 'Ödüller',
        'ABOUT_CV_NAME': 'İsim',
        'ABOUT_CV_TITLE': 'Unvan',
        'ABOUT_CV_EMAIL': 'E-posta',
        'ABOUT_CV_WEBSITE': 'Web Sitesi',
        'ABOUT_CV_SUMMARY': 'Özet',

        # Teaching
        'TEACH_BADGE': 'Akademik Dersler',
        'TEACH_TITLE': 'Eğitim ve Danışmanlık',
        'TEACH_SUBTITLE': 'Yapay Zeka Mühendisliği Bölümü bünyesinde verilen dersler, eğitim materyalleri ve akademik danışmanlık faaliyetleri.',
        'TEACH_VIEW_COURSE': 'Derse Git',

        # Footer
        'FOOTER_POWERED': 'Altyapı',
        'FOOTER_BUILT_WITH': 'Bol miktarda ☕ ve',
        'FOOTER_AND_COFFEE': 'ile hazırlandı.',
    }
}

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

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

# Türkçe CV verisi (varsa)
cv_tr_path = os.path.join(PATH, 'extra', 'cv_tr.json')
if os.path.exists(cv_tr_path):
    with open(cv_tr_path, 'r', encoding='utf-8') as f:
        CV_DATA_TR = json.load(f)
else:
    CV_DATA_TR = {}

# I18N_SUBSITES'e Türkçe CV verisini ekle
if CV_DATA_TR:
    I18N_SUBSITES['tr']['CV_DATA'] = CV_DATA_TR
