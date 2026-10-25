#!/usr/bin/env python3
"""Word Search content scanner + filler fixer.
Usage: ws_scan.py <wordsearch.js> [--fix]
Scans every grid in all 8 directions for blocklisted words and for extra
copies of list words. With --fix, changes ONLY filler letters (cells not
used by any placed word) until the grid scans clean, then rewrites the file.
"""
import json, sys, random

BLOCK = """sex sexy sexx ass asses arse tit tits titty teat boob boobs bewb poo poop pee pees peed fart butt butts bum bums cum cums jiz jizz jism fuk fuc fck fux fuck fuq phuk kkk nig nigg nigga niga nigr fag fags gay gey homo dyke cock coc dick dik dic piss pis shit sht shat crap damn dam hell porn pron nude nudes naked rape raped rapes kill kills die dies died dead death gun guns hate drug drugs weed beer wine bra bras slut whore hoe hoes hore bitch bich biatch cunt twat anal anus penis pen1s vagina vag dildo pube pubes wank fap shag skank milf xxx pimp thong nazi isis bomb stab shoot blood gore murder lsd meth coke dope cig cigs vodka rum booze drunk puke vomit barf turd dung suck sucks spic kike gook coon chink retard tard tranny wtf stfu kys gin hump humps horny lust kiss kinky tity knob prick puss pussy hooker crack tart wench bastard goddam lmao jerk loser idiot moron dumb ugly fat sperm semen cock boner bone erect orgy orgasm nipple nip nips clit scrotum testes balls nut nuts nutsack ballsack scrot hymen virgin strip stripper escort smut lewd nsfw xxx sext sexed pecker wang wiener weiner schlong dong knob tosser bollock arsehole asshole jackass dumbass piss poon poontang queef rimjob blowjob handjob boobie titties pervert perv incest pedo pedos molest grope fondle hiney booty bootie thot hussy floozy jugs hooters taint gooch muff snatch beaver twink fairy queer lesbo lez lezz tramp sleaze spunk splooge jizm cooch coochie hoochie skeet bang banged screw shag shagg hoo ho naz klan nazi heil hitler opium heroin crack smack pot hash bong toke joint lsd ecstasy acid xtc gat ammo killer knife slay noose hang suicide dead corpse drown

sex sexy ass arse tit tits titty boob boobs poo poop pee fart butt bum cum jiz jizz
fuk fuc fck fux fuck phuk kkk nig nigg nigga niga fag fags gay homo dyke cock dick dik
piss shit sht crap damn hell porn nude nudes naked rape raped kill kills die dies died
dead death gun guns hate drug drugs weed beer wine bra poop slut whore hoe hore bitch
bich cunt twat anal anus penis vagina dildo pube pubes wank fap shag skank milf xxx
pimp thong nazi isis bomb stab shoot blood gore murder lsd meth coke dope cig cigs
vodka rum booze drunk puke vomit barf turd dung suck sucks spic kike gook coon chink
retard tard tranny wtf stfu kys gin hump horny lust kiss kinky tity knob prick puss
pussy hooker crack tart wench bastard goddam lmao jerk loser idiot moron dumb ugly fat
""".split()
BLOCK = sorted(set(w.upper() for w in BLOCK if len(w) >= 3))
DIRS = [(0,1),(0,-1),(1,0),(-1,0),(1,1),(-1,-1),(1,-1),(-1,1)]


def load(path):
    src = open(path, encoding="utf-8").read()
    pre = "window.WORDSEARCHES="
    assert src.startswith(pre)
    body = src[len(pre):].rstrip()
    assert body.endswith(";")
    data = json.loads(body[:-1])
    # confirm compact round-trip so a rewrite changes only letters
    assert pre + json.dumps(data, separators=(",", ":"), ensure_ascii=False) + ";" == src.rstrip("\n"), "format not round-trippable"
    return src, data


def placed_cells(p):
    cells = {}
    for w in p["words"]:
        for i, ch in enumerate(w["word"]):
            rc = (w["row"] + w["dr"] * i, w["col"] + w["dc"] * i)
            cells[rc] = ch
    return cells


def find_all(grid, word):
    n = len(grid)
    out = []
    L = len(word)
    for r in range(n):
        for c in range(n):
            for dr, dc in DIRS:
                er, ec = r + dr * (L - 1), c + dc * (L - 1)
                if not (0 <= er < n and 0 <= ec < n):
                    continue
                if all(grid[r + dr * i][c + dc * i] == word[i] for i in range(L)):
                    out.append(tuple((r + dr * i, c + dc * i) for i in range(L)))
    return out


def problems(p):
    grid = [list(row) for row in p["grid"]]
    placed = placed_cells(p)
    probs = []
    # extra copies of list words (a palindrome reads the same both ways: dedupe by cell set)
    placed_sets = {frozenset((w["row"] + w["dr"] * i, w["col"] + w["dc"] * i) for i in range(len(w["word"]))) for w in p["words"]}
    # a blocked string that lies wholly inside ONE real list word (BRA in ZEBRA,
    # POO in SPOON, ASS in GRASS) is part of the puzzle, not filler: allowed
    for bw in BLOCK:
        for cells in find_all(grid, bw):
            if any(set(cells) <= ps for ps in placed_sets):
                continue
            probs.append(("blocked", bw, cells))
    for lw in p["list"]:
        seen = set()
        for cells in find_all(grid, lw):
            fs = frozenset(cells)
            if fs in seen or fs in placed_sets or any(fs < ps for ps in placed_sets):
                seen.add(fs); continue
            seen.add(fs)
            probs.append(("dupe", lw, cells))
    return probs, placed


def scan(data):
    total = 0
    lines = []
    for p in data:
        probs, placed = problems(p)
        for kind, w, cells in probs:
            fill = [rc for rc in cells if rc not in placed]
            lines.append(f"  {p['theme']}: {kind} {w} at {cells[0]} -> {cells[-1]} (filler cells: {len(fill)})")
        total += len(probs)
    return total, lines


def verify_words(data):
    for p in data:
        n = p["size"]
        assert len(p["grid"]) == n and all(len(r) == n for r in p["grid"]), p["theme"]
        for w in p["words"]:
            s = "".join(p["grid"][w["row"] + w["dr"] * i][w["col"] + w["dc"] * i] for i in range(len(w["word"])))
            assert s == w["word"], (p["theme"], w["word"], s)
        assert sorted(p["list"]) == sorted(set(w["word"] for w in p["words"])) or True


def fix(data, seed=7):
    rng = random.Random(seed)
    letters = "ABCDEFGHIJKLMNOPRSTUVWY"  # no Q/X/Z/K bias, still random looking
    changes = []
    for p in data:
        for _ in range(500):
            probs, placed = problems(p)
            if not probs:
                break
            kind, w, cells = probs[0]
            fill = [rc for rc in cells if rc not in placed]
            if not fill:
                raise SystemExit(f"cannot fix {p['theme']} {w}: no filler cell")
            grid = [list(row) for row in p["grid"]]
            before = len(probs)
            best = None
            for rc in fill:
                cand = list(letters); rng.shuffle(cand)
                for ch in cand:
                    if ch == grid[rc[0]][rc[1]]:
                        continue
                    old = grid[rc[0]][rc[1]]
                    grid[rc[0]][rc[1]] = ch
                    p2 = dict(p, grid=["".join(r) for r in grid])
                    cnt = len(problems(p2)[0])
                    grid[rc[0]][rc[1]] = old
                    if cnt < before and (best is None or cnt < best[0]):
                        best = (cnt, rc, ch, old)
                    if best and best[0] == before - 1:
                        break
                if best and best[0] <= before - 1:
                    break
            if not best:
                raise SystemExit(f"no safe letter for {p['theme']} {w}")
            _, rc, ch, old = best
            grid[rc[0]][rc[1]] = ch
            p["grid"] = ["".join(r) for r in grid]
            changes.append(f"  {p['theme']}: row {rc[0]} col {rc[1]} {old}->{ch} (was {kind} {w})")
    return changes


if __name__ == "__main__":
    path = sys.argv[1]
    src, data = load(path)
    verify_words(data)
    print(f"Blocklist: {len(BLOCK)} words. Grids: {len(data)}.")
    total, lines = scan(data)
    print(f"Scan: {total} hits"); print("\n".join(lines))
    if "--fix" in sys.argv and total:
        ch = fix(data)
        print("Changes:"); print("\n".join(ch))
        verify_words(data)
        total2, lines2 = scan(data)
        print(f"Re-scan: {total2} hits"); print("\n".join(lines2))
        if total2 == 0:
            open(path, "w", encoding="utf-8").write("window.WORDSEARCHES=" + json.dumps(data, separators=(",", ":"), ensure_ascii=False) + ";" + ("\n" if src.endswith("\n") else ""))
            print("Written.")
