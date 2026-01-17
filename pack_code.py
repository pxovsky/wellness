import os

# KONFIGURACJA: Co ignorować
IGNORED_DIRS = {
    'venv', '.venv', 'env', '.env',       # Środowiska wirtualne
    'node_modules', '.git', '.idea',      # Zależności i git
    '__pycache__', 'build', 'dist',       # Cache i buildy
    '.vscode', '.pytest_cache', 'mypy_cache'
}

IGNORED_EXTENSIONS = {
    # Obrazy i media
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.mp4', '.mp3',
    # Binaria i archiwa
    '.pyc', '.pyo', '.exe', '.dll', '.so', '.dylib', '.zip', '.tar', '.gz', '.7z',
    # Bazy danych i logi
    '.db', '.sqlite', '.sqlite3', '.log',
    # Inne zbędne w kontekście
    '.DS_Store', '.lock' 
}

# Nazwa pliku wyjściowego
OUTPUT_FILE = 'project_context.txt'

def pack_project(root_dir):
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as outfile:
        # Zapisz nagłówek
        outfile.write(f"# PROJECT CONTEXT\n")
        outfile.write(f"# Generated from: {os.path.abspath(root_dir)}\n")
        outfile.write(f"# Ignored dirs: {', '.join(sorted(IGNORED_DIRS))}\n\n")

        for root, dirs, files in os.walk(root_dir):
            # 1. MODYFIKACJA IN-PLACE: To kluczowy moment.
            # Usuwamy z listy 'dirs' foldery, których nie chcemy odwiedzać.
            # Dzięki temu os.walk w ogóle do nich nie wejdzie.
            dirs[:] = [d for d in dirs if d not in IGNORED_DIRS]

            for file in files:
                file_ext = os.path.splitext(file)[1].lower()
                
                # Pomiń pliki z ignorowanymi rozszerzeniami
                if file_ext in IGNORED_EXTENSIONS:
                    continue
                
                # Pomiń sam plik wyjściowy oraz skrypt pakujący
                if file == OUTPUT_FILE or file == os.path.basename(__file__):
                    continue

                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, root_dir)

                try:
                    with open(file_path, 'r', encoding='utf-8') as infile:
                        content = infile.read()
                        
                        # Zapisz nagłówek pliku i jego treść
                        outfile.write(f"\n{'='*50}\n")
                        outfile.write(f"FILE: {rel_path}\n")
                        outfile.write(f"{'='*50}\n")
                        outfile.write(content + "\n")
                        
                        print(f"Dodano: {rel_path}")
                        
                except UnicodeDecodeError:
                    print(f"Pominięto (binarny/kodowanie): {rel_path}")
                except Exception as e:
                    print(f"Błąd przy odczycie {rel_path}: {e}")

if __name__ == "__main__":
    current_dir = os.getcwd()
    print(f"Rozpoczynam pakowanie projektu z: {current_dir}")
    pack_project(current_dir)
    print(f"\nGotowe! Cały projekt zapisano w: {OUTPUT_FILE}")
