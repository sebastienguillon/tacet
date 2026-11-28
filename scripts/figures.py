# Builds src/popup/fonts/tacet-figures.woff2, the count's engraved figures:
# the ten time-signature digits of Bravura (Steinberg, SIL Open Font License
# 1.1, https://github.com/steinbergmedia/bravura), mapped onto 0-9 and renamed,
# since the licence reserves the name Bravura. Its licence ships beside it.
#   python -m venv .venv && .venv/Scripts/python -m pip install fonttools brotli
#   .venv/Scripts/python scripts/figures.py Bravura.otf src/popup/fonts/tacet-figures.woff2
import sys
from fontTools.ttLib import TTFont
from fontTools import subset

src, out = sys.argv[1], sys.argv[2]
font = TTFont(src)
cmap = font.getBestCmap()
digits = {0x30 + i: cmap[0xE080 + i] for i in range(10)}  # SMuFL timeSig0..9
opts = subset.Options()
opts.flavor = "woff2"
opts.layout_features = []
opts.name_IDs = ["*"]
opts.notdef_outline = True
sub = subset.Subsetter(opts)
sub.populate(glyphs=list(digits.values()))
sub.subset(font)
# Map the engraved figures onto ASCII digits.
for table in font["cmap"].tables:
    if table.isUnicode():
        table.cmap = dict(digits)
# The OFL reserves the name Bravura: rename the subset.
for rec in font["name"].names:
    if rec.nameID in (1, 4, 16):
        rec.string = "Tacet Figures"
    elif rec.nameID == 6:
        rec.string = "TacetFigures-Regular"
    elif rec.nameID == 3:
        rec.string = "Tacet Figures: time-signature digits subset from Bravura"
# Bravura centres time-signature digits on the baseline (+-250 units) and
# declares +-2012: wrap the digits instead, so they lay out as ordinary text.
font["hhea"].ascent, font["hhea"].descent, font["hhea"].lineGap = 260, -260, 0
os2 = font["OS/2"]
os2.sTypoAscender, os2.sTypoDescender, os2.sTypoLineGap = 260, -260, 0
os2.usWinAscent, os2.usWinDescent = 260, 260
os2.fsSelection |= 1 << 7  # USE_TYPO_METRICS
font.flavor = "woff2"
font.save(out)
