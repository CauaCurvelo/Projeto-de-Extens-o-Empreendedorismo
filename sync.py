import os

def sync_site():
    print("Iniciando sincronização completa de site-completo.html...")
    
    with open('assets/css/style.css', 'r', encoding='utf-8') as f:
        css_style = f.read()

    with open('assets/css/components.css', 'r', encoding='utf-8') as f:
        css_components = f.read()

    with open('assets/js/checklist.js', 'r', encoding='utf-8') as f:
        js_checklist = f.read()

    with open('assets/js/rating.js', 'r', encoding='utf-8') as f:
        js_rating = f.read()

    with open('assets/js/app.js', 'r', encoding='utf-8') as f:
        js_app = f.read()

    with open('assets/data/content.json', 'r', encoding='utf-8') as f:
        content_json = f.read()

    with open('index.html', 'r', encoding='utf-8') as f:
        index_html = f.read()

    with open('site-completo.html', 'r', encoding='utf-8') as f:
        site_html = f.read()

    # 1. Atualizar CSS dentro de <style>...</style>
    style_start = site_html.find('<style>')
    style_end = site_html.find('</style>')
    if style_start != -1 and style_end != -1:
        new_style = f"<style>\n/* === style.css === */\n{css_style}\n\n/* === components.css === */\n{css_components}\n"
        site_html = site_html[:style_start] + new_style + site_html[style_end:]

    # 2. Atualizar Header, Dropdown e Backdrop a partir do index.html
    header_marker = '<header class="site-header" id="header">'
    main_marker = '<main id="main-content">'

    idx_start = index_html.find(header_marker)
    idx_end = index_html.find(main_marker)
    if idx_start != -1 and idx_end != -1:
        nav_block = index_html[idx_start:idx_end]
        
        site_start = site_html.find(header_marker)
        site_end = site_html.find(main_marker)
        if site_start != -1 and site_end != -1:
            site_html = site_html[:site_start] + nav_block + site_html[site_end:]

    # 3. Atualizar Scripts dentro de <script>...</script>
    script_start = site_html.find('<script>')
    script_end = site_html.rfind('</script>')
    if script_start != -1 and script_end != -1:
        new_script = (
            f"<script>\n"
            f"window.__APP_DATA__ = {content_json};\n\n"
            f"/* === checklist.js === */\n{js_checklist}\n\n"
            f"/* === rating.js === */\n{js_rating}\n\n"
            f"/* === app.js === */\n{js_app}\n"
        )
        site_html = site_html[:script_start] + new_script + site_html[script_end:]

    with open('site-completo.html', 'w', encoding='utf-8') as f:
        f.write(site_html)

    print("site-completo.html sincronizado com sucesso com todos os estilos, scripts e menu mobile!")

if __name__ == '__main__':
    sync_site()
