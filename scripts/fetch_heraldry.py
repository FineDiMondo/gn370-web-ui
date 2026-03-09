import sys
import os
import requests
from bs4 import BeautifulSoup
import urllib.parse
DOCS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "gedcom-api-enricher", "docs")
HEADERS = {"User-Agent": "GN370 Genealogia Bot/1.0 (finedimondo@genims.local)"}

def fetch_wiki_heraldry(surname):
    print(f"[*] Cerco l'araldica per la famiglia '{surname}' su Wikipedia IT...")
    
    # 1. Cerca la pagina Wikipedia
    # A volte le famiglie nobili hanno pagine come "Giardina (famiglia)" o "Casa Giardina"
    search_queries = [
        f"{surname} (famiglia)",
        f"Famiglia {surname}",
        f"Casato {surname}",
        surname
    ]
    
    wiki_lang = "it"
    base_url = f"https://{wiki_lang}.wikipedia.org/w/api.php"
    
    page_title = None
    for q in search_queries:
        params = {
            "action": "query",
            "list": "search",
            "srsearch": q,
            "format": "json",
            "utf8": 1
        }
        resp = requests.get(base_url, params=params, headers=HEADERS).json()
        if resp.get('query', {}).get('search'):
            # Prendiamo il primo risultato pertinente
            first_res = resp['query']['search'][0]['title']
            print(f"  [+] Match trovato: {first_res} (usando query: '{q}')")
            page_title = first_res
            break
            
    if not page_title:
        print("  [-] Nessuna pagina Wikipedia trovata per la famiglia.")
        return False
        
    # 2. Otteniamo le immagini associate alla pagina
    params = {
        "action": "query",
        "prop": "images",
        "titles": page_title,
        "format": "json",
        "imlimit": 100
    }
    resp = requests.get(base_url, params=params, headers=HEADERS).json()
    pages = resp.get("query", {}).get("pages", {})
    
    svg_file = None
    for page_id, page_info in pages.items():
        if "images" in page_info:
            for img in page_info["images"]:
                title = img["title"]
                # Cerchiamo specificamente un SVG di uno stemma (Coat of Arms / Stemma)
                if title.lower().endswith(".svg") and ("stemma" in title.lower() or "coat_of_arms" in title.lower() or "blason" in title.lower() or "armi" in title.lower()):
                    svg_file = title
                    break
            if svg_file: break
            
            # Se non trova "stemma", prende un qualsiasi SVG (fallback)
            for img in page_info["images"]:
                if img["title"].lower().endswith(".svg") and not "disambig" in img["title"].lower():
                    svg_file = img["title"]
                    break

    if not svg_file:
        print("  [-] Nessun file SVG relativo a stemmi trovato sulla pagina.")
        return False
        
    print(f"  [+] File vettoriale individuato: {svg_file}")
    
    # 3. Risolviamo l'URL diretto del media tramite API di imageinfo
    params = {
        "action": "query",
        "titles": svg_file,
        "prop": "imageinfo",
        "iiprop": "url",
        "format": "json"
    }
    resp = requests.get(base_url, params=params, headers=HEADERS).json()
    pages = resp.get("query", {}).get("pages", {})
    
    image_url = None
    for page_id, page_info in pages.items():
        if "imageinfo" in page_info:
            image_url = page_info["imageinfo"][0]["url"]
            break
            
    if not image_url:
        print("  [-] Impossibile risolvere l'URL dell'immagine.")
        return False
        
    print(f"  [+] URL per il download: {image_url}")
    
    # 4. Download dell'SVG
    svg_resp = requests.get(image_url, headers=HEADERS)
    if svg_resp.status_code == 200:
        if not os.path.exists(DOCS_DIR):
            os.makedirs(DOCS_DIR)
            
        dest_filename = f"{surname}_Araldica.svg"
        dest_path = os.path.join(DOCS_DIR, dest_filename)
        
        with open(dest_path, "wb") as f:
            f.write(svg_resp.content)
            
        print(f"  [V] SVG dello stemma salvato con successo in: {dest_path}")
        return True
    else:
        print("  [-] Errore nel download del file SVG.")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python fetch_heraldry.py <Cognome>")
    else:
        surname = sys.argv[1]
        fetch_wiki_heraldry(surname)
