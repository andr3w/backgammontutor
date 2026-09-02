#!/usr/bin/env python3
"""Backgammon Tutor — serves pre-built pages, rebuilding on demand when stale."""
import re, subprocess
from pathlib import Path
from flask import Flask, Response, abort, request

ROOT = Path(__file__).resolve().parent
PAGES, LIB, BUILT = ROOT / "pages", ROOT / "lib", ROOT / "built"
BUILDER = ROOT / "build.mjs"
SLUG = re.compile(r"^[a-z0-9][a-z0-9_-]*$")   # file stems, so underscores count

app = Flask(__name__, static_folder=str(ROOT / "static"), static_url_path="/static")


def slugs():
    return sorted(p.stem for p in PAGES.glob("*.mjs"))


def newest(paths):
    return max((p.stat().st_mtime for p in paths if p.exists()), default=0)


def ensure(target, arg, sources):
    """Build `target` from `arg` if it is missing or older than any source."""
    BUILT.mkdir(exist_ok=True)
    if target.exists() and target.stat().st_mtime >= newest(sources):
        return target
    r = subprocess.run(["node", str(BUILDER), arg], cwd=ROOT,
                       capture_output=True, text=True, timeout=60)
    if r.returncode != 0 or not target.exists():
        app.logger.error("build %s failed: %s", arg, r.stderr.strip())
        abort(500, f"build failed for {arg}")
    return target


def common():
    """Anything whose change invalidates every built page.

    static/ counts: asset URLs are stamped with their mtime at build time, so a
    CSS or JS edit has to be re-stamped into the HTML to defeat the year-long
    immutable cache.
    """
    static = ROOT / "static"
    return [*LIB.glob("*.mjs"), BUILDER,
            *static.glob("*.css"), *static.glob("*.js"), *static.glob("*.mjs")]


def serve(path):
    """Serve a built page, and make sure the browser asks again next time.

    /static is immutable for a year, and the HTML is the only thing that names
    the mtime-stamped asset URLs -- so a page held in a cache pins the old CSS
    and JS along with it. Sent with no Cache-Control at all, as this was, a
    browser is free to make up its own freshness lifetime, and phones make up
    generous ones. `no-cache` means store it but revalidate, and the ETag makes
    that revalidation a 304 rather than a re-download.
    """
    st = path.stat()
    r = Response(path.read_bytes(), mimetype="text/html")
    r.headers["Cache-Control"] = "no-cache"
    r.last_modified = st.st_mtime
    r.set_etag(f"{int(st.st_mtime)}-{st.st_size}")
    return r.make_conditional(request)


@app.route("/")
def index():
    return serve(ensure(BUILT / "index.html", "--index",
                        [*PAGES.glob("*.mjs"), *common()]))


@app.route("/<slug>")
def page(slug):
    if not SLUG.match(slug) or slug not in slugs():
        abort(404)
    return serve(ensure(BUILT / f"{slug}.html", slug,
                        [PAGES / f"{slug}.mjs", *common()]))


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5051, debug=True)
