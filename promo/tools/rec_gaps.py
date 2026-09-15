import json, sys, os
d = sys.argv[1]
ev = json.load(open(os.path.join(d, 'events.json'), encoding='utf-8')); t0 = ev[0]['t']
fr = json.load(open(os.path.join(d, 'frames.json'), encoding='utf-8'))
for w in sys.argv[2:]:
    a, b = map(float, w.split(':'))
    ts = [f['t'] - t0 for f in fr if a <= f['t'] - t0 <= b]
    gaps = [round(ts[i+1]-ts[i], 3) for i in range(len(ts)-1)]
    big = [(round(ts[i],2), g) for i, g in enumerate(gaps) if g > 0.1]
    print(w, 'frames', len(ts), 'fps', round(len(ts)/(b-a),1), 'max gap', max(gaps) if gaps else None, 'gaps>0.1s:', big[:12])
# clicks & marks with coordinates in window
for e in ev:
    t = e['t'] - t0
    if e['type'] in ('click',) and 204 <= t <= 224: print('click', round(t,2), e.get('label'), e.get('x'), e.get('y'))
