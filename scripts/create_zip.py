import os
import zipfile

zip_filename = "PrometheiaX_CIAF_Entrega.zip"
exclude_dirs = {"node_modules", ".git", ".gemini", "__pycache__"}
exclude_extensions = {".zip"}

print(f"Empaquetando entrega en {zip_filename}...")

with zipfile.ZipFile(zip_filename, "w", zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk("."):
        # Filtrar directorios excluidos
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
            if file == zip_filename or any(file.endswith(ext) for ext in exclude_extensions):
                continue
            file_path = os.path.join(root, file)
            archive_path = os.path.relpath(file_path, ".")
            zipf.write(file_path, archive_path)
            print(f"  + {archive_path}")

print(f"\n¡Empaquetado completado con éxito! Archivo: {zip_filename} ({os.path.getsize(zip_filename) // 1024} KB)")
