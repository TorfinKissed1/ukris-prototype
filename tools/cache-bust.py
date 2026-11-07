"""Ставит к подключениям стилей и скриптов в html/*.html метку версии ?v=<хеш содержимого файла>.

GitHub Pages отдаёт каждый файл с кешем на 10 минут, независимо от остальных: без меток браузер
может взять новую страницу и старый скрипт к ней. С меткой новый файл получает новый адрес.
Запускать перед коммитом, который уйдёт на Pages:

    python -X utf8 tools/cache-bust.py
"""
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ASSET = re.compile(r'(?P<attr>href|src)="\.\./(?P<path>(?:css|js)/[\w.-]+\.(?:css|js))(?:\?v=[0-9a-f]+)?"')


def version_of(relative_path):
    return hashlib.md5((ROOT / relative_path).read_bytes()).hexdigest()[:8]


def main():
    changed = 0
    for page in sorted((ROOT / 'html').glob('*.html')):
        text = page.read_bytes().decode('utf-8')

        def stamp(match):
            path = match.group('path')
            return f'{match.group("attr")}="../{path}?v={version_of(path)}"'

        updated = ASSET.sub(stamp, text)
        if updated != text:
            page.write_bytes(updated.encode('utf-8'))
            changed += 1
    print(f'обновлено страниц: {changed}')


main()
