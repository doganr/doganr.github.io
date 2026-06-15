import os
import json
import time
import urllib.request
import re
import logging
from datetime import datetime, timedelta
from pelican import signals

logger = logging.getLogger(__name__)

# --- AYARLAR ---
USER_ID = "F2NkKNAAAAAJ"
CACHE_FILE = 'citations_cache.json'
CACHE_DAYS = 1  # Atıflar kaç günde bir Google'dan güncellensin?

def load_cache():
    """Önbellek dosyasından atıf verilerini oku."""
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            logger.info(f"--> Atıflar önbellekten okundu ({len(data)} kayıt)")
            return data
    return {}

def fetch_scholar_citations(scholar_ids, allow_fetch=True):
    citations = {}
    
    # 1. Önbellek (Cache) Kontrolü
    if os.path.exists(CACHE_FILE):
        file_mod_time = datetime.fromtimestamp(os.path.getmtime(CACHE_FILE))

        # Eğer fetch kapalıysa (CI/CD ortamı) → sadece cache'den oku
        if not allow_fetch:
            logger.info("--> SCHOLAR_FETCH=False: Sadece önbellekten okunuyor (Google'a istek atılmayacak)")
            return load_cache()

        # Eğer dosya CACHE_DAYS'den daha yeniyse, Google'a gitme!
        if datetime.now() - file_mod_time < timedelta(days=CACHE_DAYS):
            logger.info(f"--> Atıflar önbellekten okunuyor (Son güncelleme: {file_mod_time.strftime('%Y-%m-%d %H:%M')})")
            with open(CACHE_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
    elif not allow_fetch:
        # Cache yok ve fetch de kapalı → boş döndür
        logger.warning("--> SCHOLAR_FETCH=False ve önbellek dosyası bulunamadı! Atıf verileri gösterilemeyecek.")
        logger.warning("    Önce lokal ortamda `pelican content` çalıştırarak önbelleği oluşturun.")
        return {}

    # 2. Önbellek eskiyse veya yoksa Google'dan Çek
    logger.warning(f"--> Önbellek süresi dolmuş veya yok. Google Scholar'dan {len(scholar_ids)} makale için güncel atıflar çekiliyor...")
    
    for paper_id in scholar_ids:
        if not paper_id: continue
        
        url = f"https://scholar.google.com/citations?view_op=view_citation&hl=en&user={USER_ID}&citation_for_view={USER_ID}:{paper_id}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        
        try:
            html = urllib.request.urlopen(req).read().decode('utf-8')
            match = re.search(r'Cited by (\d+)', html)
            count = match.group(1) if match else "0"
            citations[paper_id] = count
            logger.info(f"    [+] Başarılı: {paper_id} -> {count} Atıf")
        except Exception as e:
            logger.error(f"    [-] Hata: {paper_id} çekilemedi: {e}")
            citations[paper_id] = "0"
            
        time.sleep(2) # Banlanmamak için zorunlu bekleme süresi

    # 3. Yeni verileri kaydet
    with open(CACHE_FILE, 'w', encoding='utf-8') as f:
        json.dump(citations, f, indent=2)
        
    return citations

def add_publications(generator, **kwargs):
    if 'PUBLICATIONS_SRC' not in generator.settings:
        return
    refs_file = generator.settings['PUBLICATIONS_SRC']
    try:
        from pybtex.database.input import bibtex
        bibdata = bibtex.Parser().parse_file(refs_file)
    except Exception as e:
        logger.warning('`pelican_bibtex` failed to parse file %s: %s', refs_file, str(e))
        return

    # SCHOLAR_FETCH ayarını oku (varsayılan: True → lokal geliştirmede aktif)
    allow_fetch = generator.settings.get('SCHOLAR_FETCH', True)

    # Önce tüm Scholar ID'lerini topla
    scholar_ids = []
    for entry in bibdata.entries.values():
        sid = entry.fields.get('google_scholar_id', '').replace('{', '').replace('}', '')
        if sid: scholar_ids.append(sid)

    # Atıfları Getir (Önbellekten veya Google'dan)
    citations_data = fetch_scholar_citations(scholar_ids, allow_fetch=allow_fetch)

    publications = []
    for key, entry in bibdata.entries.items():
        sid = entry.fields.get('google_scholar_id', '').replace('{', '').replace('}', '')
        
        pub = {
            'key': key,
            'year': entry.fields.get('year', ''),
            'title': entry.fields.get('title', '').replace('{', '').replace('}', ''),
            'journal': entry.fields.get('journal', ''),
            'booktitle': entry.fields.get('booktitle', ''),
            'doi': entry.fields.get('doi', ''),
            'html': entry.fields.get('html', ''),
            'code': entry.fields.get('code', ''),
            'preview': entry.fields.get('preview', ''),
            'abbr': entry.fields.get('abbr', ''),
            'google_scholar_id': sid,
            'selected': entry.fields.get('selected', '').replace('{', '').replace('}', '').strip().lower(),
            'citation_count': citations_data.get(sid, '0') # Atıf sayısını eşleştir
        }
        
        authors = []
        if 'author' in entry.persons:
            for person in entry.persons['author']:
                name = ' '.join(person.first_names + person.middle_names + person.last_names)
                authors.append(name.replace('{', '').replace('}', ''))
        pub['author'] = ', '.join(authors)
        
        bib_fields = []
        if authors:
            bib_fields.append(('author', ' and '.join(authors)))
        for _f in ['title','journal','booktitle','volume','number','pages','year','publisher','doi']:
            _v = entry.fields.get(_f, '').replace('{','').replace('}','').strip()
            if _v:
                bib_fields.append((_f, _v))
        pub['bibtex'] = '@%s{%s,\n' % (entry.type, key) + ',\n'.join('  %s = {%s}' % (k, v) for k, v in bib_fields) + '\n}'

        publications.append(pub)

    generator.context['publications'] = publications

def register():
    signals.generator_init.connect(add_publications)
    signals.article_generator_context.connect(add_publications)
    signals.page_generator_context.connect(add_publications)