"""Build the app's data from the official Heart & Soul documentation pages.

Usage: python3 -I extract_hns.py <pokedex.html> <moves.html> <showdown pokedex.json> <out.json>
Reads the pages as data only (JSON + regex); nothing from them is executed.
"""
import sys, json, re, html

POKEDEX, MOVES, SHOWDOWN, OUT = sys.argv[1:5]

# TM01-TM92 then HM01-HM08, per include/constants/tms_hms.h (IS_HNS branch).
TMS = ("Focus Punch|Dragon Claw|Water Pulse|Calm Mind|Roar|Toxic|Hail|Bulk Up|Bullet Seed|Hidden Power|"
       "Sunny Day|Taunt|Ice Beam|Blizzard|Hyper Beam|Light Screen|Protect|Rain Dance|Giga Drain|Safeguard|"
       "Frustration|Solar Beam|Iron Tail|Thunderbolt|Thunder|Earthquake|Return|Dig|Psychic|Shadow Ball|"
       "Brick Break|Double Team|Reflect|Shock Wave|Flamethrower|Sludge Bomb|Sandstorm|Fire Blast|Rock Tomb|Aerial Ace|"
       "Torment|Facade|Secret Power|Rest|Attract|Thief|Steel Wing|Skill Swap|Snatch|Overheat|"
       "Roost|Focus Blast|Energy Ball|False Swipe|Brine|Fling|Charge Beam|Endure|Dragon Pulse|Drain Punch|"
       "Will-O-Wisp|Silver Wind|Embargo|Explosion|Shadow Claw|Payback|Recycle|Giga Impact|Rock Polish|Rock Climb|"
       "Stone Edge|Avalanche|Thunder Wave|Gyro Ball|Swords Dance|Stealth Rock|Psych Up|Captivate|Dark Pulse|Rock Slide|"
       "X-Scissor|Sleep Talk|Natural Gift|Poison Jab|Dream Eater|Grass Knot|Swagger|Pluck|U-turn|Substitute|"
       "Flash Cannon|Trick Room").split("|")
HMS = "Cut|Fly|Surf|Strength|Flash|Rock Smash|Waterfall|Whirlpool".split("|")
MACHINE = {m: "TM%02d" % (i + 1) for i, m in enumerate(TMS)}
MACHINE.update({m: "HM%02d" % (i + 1) for i, m in enumerate(HMS)})
# Gen 3 learnset panels print a few moves under their old, unlinked names.
OLD_NAMES = {"Faint Attack": "Feint Attack", "Smellingsalt": "Smelling Salts", "Hi Jump Kick": "High Jump Kick"}


def cards_of(path):
    s = open(path, encoding="utf-8").read()
    tag = '<script type="application/json" id="cards">'
    a = s.index(tag) + len(tag)
    return json.loads(s[a:s.index("</script>", a)])


def text(fragment):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", fragment))).strip()


def norm(name):
    name = html.unescape(name).replace("♀", "f").replace("♂", "m")
    return re.sub(r"[^a-z0-9]", "", name.lower())


# Moves: name -> [type, category, power, accuracy]
moves = {}
for _, h in cards_of(MOVES):
    name = text(re.search(r'<span class="mv t-[a-z]+">(.*?)</span>', h).group(1))
    mtype = re.search(r'class="typeicon"[^>]*alt="(\w+)"', h).group(1)
    cat = re.search(r'class="caticon"[^>]*alt="(\w+)"', h).group(1)
    kv = dict((text(k), text(v)) for k, v in re.findall(r"<dt>(.*?)</dt><dd>(.*?)</dd>", h))
    power = int(kv["Power"]) if kv.get("Power", "").isdigit() else 0
    moves[name] = [mtype, {"Physical": "P", "Special": "S"}.get(cat, "X"), power, kv.get("Accuracy", "")]

move_ids, move_list = {}, []


def mid(name):
    if name not in move_ids:
        move_ids[name] = len(move_list)
        info = moves.get(name, ["Normal", "X", 0, ""])
        move_list.append([name] + info + [MACHINE.get(name, "")])
    return move_ids[name]


def panel(h, name):
    b = h[h.find('class="card-body"'):]
    m = re.search(r'<div class="panel" data-form="0" data-panel="' + name + r'"[^>]*>', b)
    if not m:
        return None
    nxt = b.find('<div class="panel" data-form=', m.end())
    return b[m.end():nxt if nxt > 0 else len(b)]


def movecols(p):
    cols = {}
    for title, ul in re.findall(r'<div class="movecol"><h3>([^<]*)</h3><ul>(.*?)</ul>', p or ""):
        items = []
        for li in re.findall(r"<li>(.*?)</li>", ul):
            lvl = re.search(r'<span class="lvl">(\d+)</span>', li)
            span = re.search(r'<span class="mv[^"]*">(.*?)</span>', li)
            mv = text(span.group(1)) if span else text(re.sub(r'<span class="lvl">\d+</span>', "", li))
            mv = OLD_NAMES.get(mv, mv)
            items.append([int(lvl.group(1)), mid(mv)] if lvl else mid(mv))
        cols[title] = items
    return cols


showdown = json.load(open(SHOWDOWN, encoding="utf-8"))
national = {norm(p["name"]): p["num"] for p in showdown.values() if not p.get("forme")}

species = {}
for _, h in cards_of(POKEDEX):
    name = text(re.search(r'<span class="mon-name">(.*?)</span>', h).group(1))
    head = h[:h.find('class="card-body"')]
    slug = re.search(r'class="monpic" src="assets/mon/([^"]+)\.png"', head).group(1)
    first_form = re.search(r'<span class="types">(.*?)</span>', head).group(1)
    types = list(dict.fromkeys(re.findall(r'class="typeicon"[^>]*alt="(\w+)"', first_form)))
    stat_p = panel(h, "stats")
    st = dict(re.findall(r"<span>(\w+)<b>(\d+)</b>", re.search(r'<div class="statline">(.*?)</div>', stat_p).group(1)))
    rows = dict((text(k), v) for k, v in re.findall(r'<div class="row-label">(.*?)</div><div class="row-value">(.*?)</div></div>', stat_p))
    abilities = [text(a) for a in re.findall(r'class="xlink">(.*?)</a>', rows.get("Abilities", ""))]
    hidden = [text(a) for a in re.findall(r'class="xlink">(.*?)</a>', rows.get("Hidden ability", ""))]

    evo_p = panel(h, "evo") or ""
    evos = {}
    into = evo_p.find("Evolves into")
    if into >= 0:
        for line in re.findall(r'<div class="evo-line">(.*?)</div>', evo_p[into:]):
            target = text(re.search(r'<span class="evo-name">(.*?)</span>', line).group(1))
            parts = [text(x) for x in re.findall(r'<span class="how">(.*?)</span>', line)]
            how = " · ".join(p.rstrip(" ·") for p in parts if p)
            evos.setdefault(target, [])
            if how and how not in evos[target]:
                evos[target].append(how)

    m7 = movecols(panel(h, "moves"))
    m3 = movecols(panel(h, "moves3"))

    where_p = panel(h, "where") or ""
    wild, gifts = [], []
    for section, target in (("In the wild", wild), ("Gifts, statics and trades", gifts)):
        i = where_p.find("<h3>" + section + "</h3>")
        if i < 0:
            continue
        ul = re.search(r'<ul class="stack">(.*?)</ul>', where_p[i:])
        for li in re.findall(r"<li>(.*?)</li>", ul.group(1) if ul else ""):
            place = text(re.search(r'<span class="where">(.*?)</span>', li).group(1))
            target.append([place] + [text(x) for x in re.findall(r'<span class="how">(.*?)</span>', li)])

    key = norm(re.sub(r" Normal$", "", name))
    species[name] = {
        "name": html.unescape(name), "slug": slug, "num": national.get(key, 0),
        "types": types, "s": [int(st[k]) for k in ("HP", "Atk", "Def", "SpA", "SpD", "Spe")],
        "ab": abilities, "ha": hidden,
        "evos": [[t, "; ".join(v)] for t, v in evos.items()],
        "lv": m7.get("Level up", []), "tm": m7.get("TM / HM", []), "tutor": m7.get("Tutor", []),
        "egg": m7.get("Egg moves", []),
        "lv3": m3.get("Level up"), "egg3": m3.get("Egg moves"),
        "wild": wild, "gifts": gifts,
    }

# Keep National Dex 1-386 (base forms) plus everything they can evolve into.
keep = {n for n, sp in species.items() if 1 <= sp["num"] <= 386 and not re.match(r"(Alolan|Galarian|Hisuian|Paldean) ", n)}
stack = list(keep)
while stack:
    for t, _ in species[stack.pop()]["evos"]:
        if t in species and t not in keep:
            keep.add(t)
            stack.append(t)

nums = sorted(sp["num"] for n, sp in species.items() if n in keep and 1 <= sp["num"] <= 386)
missing = sorted(set(range(1, 387)) - set(nums))
dups = sorted({n for n in nums if nums.count(n) > 1})
out = {"species": [species[n] for n in sorted(keep, key=lambda n: (species[n]["num"] or 9999, n))], "moves": move_list}
json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("species", len(out["species"]), "moves", len(move_list), "missing", missing, "dups", dups)
print("unknown moves", [m[0] for m in move_list if m[0] not in moves])
print("not in dex 1-386:", [n for n in sorted(keep) if not 1 <= species[n]["num"] <= 386])
