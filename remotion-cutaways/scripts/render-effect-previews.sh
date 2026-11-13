#!/bin/bash
# renders every preview still in the studio runtime copy, then shrinks them to 360x640 JPEGs in work/previews/
cd "$(dirname "$0")/studio-rt"
export REMOTION_LOCAL_FONTS=1 REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome
mkdir -p ../previews
python3 - <<'PY' > ../pv-jobs.txt
import json
for slug, items in json.load(open(__import__('os').environ.get('PVIDX','../previews.json'))).items():
    print(slug, ' '.join(str(t) for _, t in items))
PY
while read slug secs; do
  rm -rf out/stills/$slug
  npm run stills -- $slug $secs > ../pv-$slug.log 2>&1 || echo "FAIL $slug" >> ../pv-status.log
  echo "done $slug" >> ../pv-status.log
done < ../pv-jobs.txt
python3 - <<'PY'
import json, glob, os
from PIL import Image
idx = json.load(open(__import__('os').environ.get('PVIDX','../previews.json')))
for slug, items in idx.items():
    for typ, t in items:
        f = 'out/stills/%s/%04d.png' % (slug, round(t * 30))
        if os.path.exists(f):
            Image.open(f).convert('RGB').resize((360, 640), Image.LANCZOS).save('../previews/%s.jpg' % typ, quality=82)
print(len(glob.glob('../previews/*.jpg')), 'previews')
PY
echo ALLDONE >> ../pv-status.log
