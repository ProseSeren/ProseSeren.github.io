from html.parser import HTMLParser
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parent.parent


def page_body(path):
    return path.read_text(encoding="utf-8").split("---", 2)[2].lstrip()


class PageCheck(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.references = []

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if "id" in attrs:
            assert attrs["id"] not in self.ids, f"Duplicate id: {attrs['id']}"
            self.ids.add(attrs["id"])
        if tag in ("a", "img", "link") or (tag == "script" and "src" in attrs):
            self.references.append(attrs.get("href") or attrs.get("src"))


layout = page_body(ROOT / "_layouts/academic-home.html")
page = layout.replace("{% include base_path %}", "")
page = page.replace("{% include head/academic-preferences.html %}",
                    (ROOT / "_includes/head/academic-preferences.html").read_text(encoding="utf-8"))
page = page.replace('    <link rel="canonical" href="{{ site.url }}{{ site.baseurl }}/">\n', "")
page = page.replace("{{ base_path }}/", "")
page = page.replace("{{ content }}", page_body(ROOT / "_pages/about.md"))
assert "{{" not in page and "{%" not in page, "Unresolved template; update the preview renderer."
check = PageCheck()
check.feed(page)
for reference in check.references:
    assert reference, "A link or asset has no destination."
    target = urlsplit(reference)
    if target.scheme or target.netloc:
        continue
    if target.path:
        assert (ROOT / unquote(target.path)).is_file(), f"Missing asset: {reference}"
    elif target.fragment:
        assert unquote(target.fragment) in check.ids, f"Missing anchor: {reference}"
css = (ROOT / "assets/css/home.css").read_text(encoding="utf-8")
for reference in re.findall(r'url\("([^"#][^"]+)"\)', css):
    if not urlsplit(reference).scheme:
        assert (ROOT / "assets/css" / unquote(reference)).resolve().is_file(), f"Missing CSS asset: {reference}"
(ROOT / "preview.html").write_text(page, encoding="utf-8")
print(f"Generated preview.html; checked {len(check.ids)} ids and {len(check.references)} links/assets.")
