"""Builds public/legal/{es,pt,en}.html from legal/*.md and legal/company.json.

Run from the repo root:  python3 scripts/legal/build_legal.py
Empty company fields render as a visible "to complete" marker so a missing
NIF or address can't go live unnoticed.
"""
import html, json, pathlib, re
import markdown

ROOT = pathlib.Path(__file__).resolve().parents[2]
company = json.loads((ROOT / "legal/company.json").read_text())
TODO = {"es": "POR COMPLETAR", "pt": "POR PREENCHER", "en": "TO COMPLETE"}
BACK = {"es": "Volver a la tienda", "pt": "Voltar à loja", "en": "Back to the shop"}
UPDATED = {"es": "Última actualización", "pt": "Última atualização", "en": "Last updated"}
OTHER = {"es": "Idioma", "pt": "Idioma", "en": "Language"}

for md_path in sorted((ROOT / "legal").glob("*.md")):
    raw = md_path.read_text()
    _, front, body = raw.split("---", 2)
    meta = dict(line.split(": ", 1) for line in front.strip().splitlines())
    lang = meta["lang"]

    def fill(m):
        key = m.group(1)
        val = (company.get(key) or "").strip()
        if val:
            return html.escape(val)
        return f'<mark class="todo">[{TODO[lang]}: {key}]</mark>'

    body = re.sub(r"\{\{(\w+)\}\}", fill, body)
    content = markdown.markdown(body, extensions=["attr_list", "tables"])
    content = re.sub(r'(https://[^\s<"]+[^\s<".,)])', r'<a href="\1" rel="noopener">\1</a>', content)
    nav = "".join(
        f'<a href="#{a}">{html.escape(t)}</a>'
        for t, a in (item.split("|") for item in meta["nav"].split("; "))
    )
    langs = " · ".join(
        f'<a href="/legal/{l}.html" hreflang="{l}">{l.upper()}</a>' for l in ("es", "pt", "en")
    )
    page = f"""<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(meta["title"])} · CalmoKit</title>
<meta name="robots" content="index, follow">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="canonical" href="https://calmokit.eu/legal/{lang}.html">
<style>
  :root {{ color-scheme: light; }}
  body {{ margin: 0; background: #F4F1EA; color: #1C1F1D; font: 17px/1.6 "Source Sans 3", system-ui, -apple-system, "Segoe UI", sans-serif; }}
  header {{ background: #1C1F1D; color: #F4F1EA; }}
  header .in, main {{ max-width: 760px; margin: 0 auto; padding: 20px 24px; }}
  header .in {{ display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }}
  header a {{ color: #F4F1EA; text-decoration: none; }}
  .brand {{ display: inline-flex; align-items: center; gap: 10px; font: 600 22px/1 "Barlow Semi Condensed", system-ui, sans-serif; }}
  h1, h2, h3 {{ font-family: "Barlow Semi Condensed", system-ui, sans-serif; font-weight: 600; line-height: 1.15; }}
  h1 {{ font-size: 40px; margin: 24px 0 4px; }}
  h2 {{ font-size: 28px; margin: 48px 0 12px; padding-top: 16px; border-top: 1px solid #D9D3C6; }}
  h3 {{ font-size: 21px; margin: 28px 0 8px; }}
  a {{ color: #0B6E4F; }}
  nav.toc {{ display: flex; flex-wrap: wrap; gap: 8px 16px; margin: 16px 0 8px; font-size: 15px; }}
  .muted {{ color: #4F5550; font-size: 15px; }}
  table {{ width: 100%; border-collapse: collapse; font-size: 15px; background: #fff; }}
  th, td {{ text-align: left; padding: 10px; border: 1px solid #D9D3C6; vertical-align: top; }}
  blockquote {{ margin: 12px 0; padding: 16px 20px; background: #fff; border-radius: 10px; }}
  blockquote p {{ margin: 0; white-space: pre-line; }}
  mark.todo {{ background: #FDE68A; padding: 0 4px; }}
</style>
</head>
<body>
<header><div class="in">
  <a class="brand" href="/"><svg width="28" height="28" viewBox="6 6 88 88" aria-hidden="true"><path d="M37 29V19a6 6 0 0 1 6-6h14a6 6 0 0 1 6 6v10" fill="none" stroke="#F4F1EA" stroke-width="9"/><rect x="10" y="27" width="80" height="62" rx="14" fill="#F4F1EA"/><path d="M62.6 46.6A17 17 0 1 0 62.6 69.4" fill="none" stroke="#0B6E4F" stroke-width="11"/></svg>CalmoKit</a>
  <span>{OTHER[lang]}: {langs}</span>
</div></header>
<main>
<p><a href="/">← {BACK[lang]}</a></p>
<h1>{html.escape(meta["title"])}</h1>
<p class="muted">{UPDATED[lang]}: {html.escape(meta["updated"])}</p>
<nav class="toc">{nav}</nav>
{content}
</main>
</body>
</html>
"""
    out = ROOT / "public/legal" / f"{lang}.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(page)
    print("wrote", out.relative_to(ROOT))
