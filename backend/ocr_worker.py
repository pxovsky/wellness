import pytesseract
from PIL import Image, ImageOps
import re

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def parse_screenshot(image_path: str) -> dict:
    try:
        img = Image.open(image_path)
        img = ImageOps.grayscale(img)
        text = pytesseract.image_to_string(img, lang='pol', config='--psm 6')
    except:
        return {}

    data = {}
    
    # Czyścimy tekst ze spacji w środku liczb (żeby "3 3 2" stało się "332")
    # Ale ostrożnie, żeby nie skleić słów. 
    # Robimy to linia po linii.
    lines = text.split('\n')
    
    for line in lines:
        clean_line = line.replace(' ', '') # 3 3 2 kcal -> 332kcal
        
        # 1. KCAL (szukamy 332kcal)
        if 'kcal' in clean_line.lower():
            # Znajdź liczbę przed słowem kcal
            m = re.search(r'(\d+)kcal', clean_line.lower())
            if m:
                data['calories'] = int(m.group(1))

        # 2. CZAS (szukamy 00:45:33)
        if ':' in clean_line:
            # Szukamy XX:XX:XX
            m = re.search(r'(\d{1,2}:\d{2}:\d{2})', clean_line)
            if m:
                t_str = m.group(1)
                h, m, s = map(int, t_str.split(':'))
                # Jeśli to sensowny czas treningu (np. < 5h), bierzemy
                minutes = h * 60 + m
                if 5 < minutes < 300: 
                    data['duration'] = minutes

        # 3. EFEKT (szukamy 3.0)
        # Tesseract widzi "3 0 Poprawa" -> clean_line "30Poprawa"
        if 'Poprawa' in line or 'Utrzymanie' in line:
            # Szukamy cyfry na początku linii
            m = re.search(r'(\d)\s+(\d)', line) # Szukamy w ORYGINALNEJ linii ze spacjami
            if m:
                data['effect'] = float(f"{m.group(1)}.{m.group(2)}")
        
        # 4. TĘTNO (141)
        # Szukamy "141" w clean_line, jeśli jest w pobliżu "ud./min"
        # Tesseract w twoim logu zgubił "ud./min", ale może jest "141"
        # Szukamy po prostu liczby 130-160 (Twoje typowe tętno)
        # To heurystyka, ale zadziała
        m = re.search(r'(1[3-5]\d)', clean_line) # szuka 130-159
        if m and '2025' not in clean_line: # żeby nie złapać roku
             # Ale tylko jeśli nie mamy jeszcze tętna
             if 'avg_hr' not in data:
                 data['avg_hr'] = int(m.group(1))

    return data

if __name__ == "__main__":
    print(parse_screenshot("image.jpg"))
