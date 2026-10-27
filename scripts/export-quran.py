"""Read-only export of the app's verified corpus. No text rewriting or normalization."""
import sqlite3, json, hashlib, pathlib, sys
source = pathlib.Path(sys.argv[1])
out = pathlib.Path(__file__).resolve().parents[1] / 'public/quran/v1.1-b6'
out.mkdir(parents=True, exist_ok=True)
c = sqlite3.connect(f'file:{source / "assets/quran/quran.db"}?mode=ro', uri=True)
c.row_factory = sqlite3.Row
meta = dict(c.execute('select key,value from meta'))
raw = (source / 'data/source/tanzil-uthmani-v1.1.sql').read_text()
notice = raw[raw.index('# PLEASE'):raw.index('\n\n\n--')]
def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, separators=(',', ':')))
suras = [dict(r) for r in c.execute('select * from suras order by id')]
translations = [dict(r) for r in c.execute('select * from translations order by sort')]
write(out/'catalog.json', {'meta':meta,'notice':notice,'suras':suras,'translations':translations})
count = 0
for s in suras:
    verses=[dict(r) for r in c.execute('select aya,text,basmala from ayat where sura=? order by aya',(s['id'],))]
    assert len(verses)==s['ayas']
    for verse in verses:
        verse['tajweed'] = [dict(r) for r in c.execute(
            'select start,end,rule from tajweed where sura=? and aya=? order by start,end,rule',
            (s['id'],verse['aya']))]
        for span in verse['tajweed']:
            assert 0 <= span['start'] < span['end'] <= len(verse['text'])
            assert not span['start'] < verse['basmala'] < span['end']

    write(out/f"{s['id']}.json",{'notice':notice,'sura':s['id'],'verses':verses})
    # JSON round trip must preserve every original Unicode code point and split position.
    assert json.loads((out/f"{s['id']}.json").read_text())['verses']==verses
    count += len(verses)
    for t in translations:
        folder=out/t['key'];folder.mkdir(exist_ok=True)
        rows=[dict(r) for r in c.execute('select aya,text,footnotes from translation_ayat where translation=? and sura=? order by aya',(t['key'],s['id']))]
        assert len(rows)==s['ayas']
        write(folder/f"{s['id']}.json",{'source':t,'verses':rows})
assert len(suras)==114 and count==6236
(out/'TANZIL-NOTICE.txt').write_text(notice)
manifest={str(p.relative_to(out)):{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(out.rglob('*.json')) if p.name != 'manifest.json'}
write(out/'manifest.json',manifest)
print(f'Validated {len(suras)} chapters, {count} unchanged Arabic verses, {len(translations)} complete translations. Per-chapter lazy files: {sum(v["bytes"] for v in manifest.values()):,} bytes on disk.')
