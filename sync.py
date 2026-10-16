import os

def sync_site():
    with open('assets/css/style.css', 'r', encoding='utf-8') as f:
        css_style = f.read()

    with open('assets/css/components.css', 'r', encoding='utf-8') as f:
        css_components = f.read()

    with open('assets/js/app.js', 'r', encoding='utf-8') as f:
        js_app = f.read()

    with open('index.html', 'r', encoding='utf-8') as f:
        index_html = f.read()

    with open('site-completo.html', 'r', encoding='utf-8') as f:
        site_html = f.read()

    # 1. Update style.css
    css_start = site_html.find('/* === style.css === */')
    css_mid = site_html.find('/* === components.css === */')
    if css_start != -1 and css_mid != -1:
        site_html = site_html[:css_start] + '/* === style.css === */\n' + css_style + '\n  ' + site_html[css_mid:]

    # 2. Update components.css
    css_mid = site_html.find('/* === components.css === */')
    css_end = site_html.find('</style>', css_mid)
    if css_mid != -1 and css_end != -1:
        site_html = site_html[:css_mid] + '/* === components.css === */\n' + css_components + '\n' + site_html[css_end:]

    # 3. Update app.js
    js_start = site_html.find('/* === app.js === */')
    js_end = site_html.find('</script>', js_start)
    if js_start != -1 and js_end != -1:
        site_html = site_html[:js_start] + '/* === app.js === */\n' + js_app + '\n' + site_html[js_end:]

    # 4. Update header markup in site-completo.html
    h_start_marker = '<header class="site-header" id="header">'
    h_end_marker = '</header>'

    idx_h_start = index_html.find(h_start_marker)
    idx_h_end = index_html.find(h_end_marker) + len(h_end_marker)
    new_header = index_html[idx_h_start:idx_h_end]

    site_h_start = site_html.find(h_start_marker)
    site_h_end = site_html.find(h_end_marker, site_h_start) + len(h_end_marker)
    if site_h_start != -1 and site_h_end != -1:
        site_html = site_html[:site_h_start] + new_header + site_html[site_h_end:]

    with open('site-completo.html', 'w', encoding='utf-8') as f:
        f.write(site_html)

    print('site-completo.html successfully compiled with Dark Mode and expanding bubble transition!')

if __name__ == '__main__':
    sync_site()
