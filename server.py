#!/usr/bin/env python3
"""Backgammon Tutor — serves pre-built pages, rebuilding on demand when stale."""
import re, subprocess
from pathlib import Path
from flask import Flask, Response, abort, send_from_directory

ROOT = Path(__file__).resolve().parent
PAGES, LIB, BUILT = ROOT / "pages", ROOT / "lib", ROOT / "built"
BUILDER = ROOT / "build.mjs"
SLUG = re.compile(r"^[a-z0-9][a-z0-9-]*$")

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
    return Response(path.read_bytes(), mimetype="text/html")


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
