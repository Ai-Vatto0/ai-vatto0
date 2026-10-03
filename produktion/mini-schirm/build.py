# Baut eine fertige Werbung: Shots -> Captions -> Sound + VO -> Export 1080x1920
import subprocess, sys, json, os
from PIL import ImageFont
F='/home/user/ai-vatto0/assets/fonts/Poppins-Bold.ttf'
ZP='/home/user/ai-vatto0/tools/video-maschine/zp.sh'
def sh(c): subprocess.run(c,shell=True,check=True)
def fit(t,start,mn=60):
    s=start
    while ImageFont.truetype(F,s).getlength(t)>920 and s>mn: s-=2
    assert ImageFont.truetype(F,s).getlength(t)<=920, t
    return s
def build(cfg):
    n=cfg['name']; d=f'work/{n}'; os.makedirs(d,exist_ok=True)
    files=[]
    for i,s in enumerate(cfg['shots']):
        o=f'{d}/s{i}.mp4'; dur=round(s['end']-s['start'],3)
        if s['type']=='clip':
            sh(f"ffmpeg -v error -y -ss {s.get('ss',0)} -i work/seller-hand-quadrat.mp4 -t {dur} -vf \"crop=663:1179:258:0,scale=1080:1920:flags=lanczos,eq=contrast=1.07:saturation=1.04,vignette=PI/4.4,fps=30,format=yuv420p\" -an -c:v libx264 -crf 16 {o}")
        else:
            z0,z1,x0,x1,y0,y1=s['move']
            sh(f"{ZP} work/bilder/{s['img']}.png {dur} {z0} {z1} {x0} {x1} {y0} {y1} {o}")
        files.append(f"file 's{i}.mp4'")
    open(f'{d}/l.txt','w').write('\n'.join(files))
    sh(f"ffmpeg -v error -y -f concat -safe 0 -i {d}/l.txt -c copy {d}/roh.mp4")
    D=cfg['shots'][-1]['end']
    parts=[]
    for i,(a,b,t) in enumerate(cfg['caps']):
        p=f'{d}/c{i}.txt'; open(p,'w').write(t); fs=fit(t,84)
        parts.append(f"drawtext=fontfile={F}:textfile={p}:fontsize={fs}:fontcolor=white:borderw=6:bordercolor=black:x=(w-text_w)/2:y=h*0.72:enable='between(t,{a},{b})'")
    a,b,t=cfg['cta']; p=f'{d}/cta.txt'; open(p,'w').write(t); fs=fit(t,96)
    parts.append(f"drawtext=fontfile={F}:textfile={p}:fontsize={fs}:fontcolor=0xFFD400:borderw=7:bordercolor=black:x=(w-text_w)/2:y=h*0.70:enable='between(t,{a},{b})'")
    open(f'{d}/filter.txt','w').write(','.join(parts))
    cuts=[s['start'] for s in cfg['shots'][1:]]
    ctams=int(cfg['cta'][0]*1000)
    wsplit=''.join(f'[w{i}]' for i in range(len(cuts)))
    wdel=';'.join(f'[w{i}]adelay={int(c*1000)}[a{i}]' for i,c in enumerate(cuts))
    amixin='[0][1]'+''.join(f'[a{i}]' for i in range(len(cuts)))+'[b0][b2]'
    nin=2+len(cuts)+2
    fc=(f"[2]asplit={len(cuts)}{wsplit};{wdel};[3]asplit=2[b0][b1];[b1]adelay={ctams}[b2];"
        f"{amixin}amix=inputs={nin}:normalize=0,lowpass=8000[bed];"
        f"[4]adelay=100,apad[vo];[vo]asplit=2[vo1][vo2];[bed][vo1]sidechaincompress=threshold=0.05:ratio=7[duck];"
        f"[duck][vo2]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5,aresample=44100[out]")
    sh(f"""ffmpeg -v error -y \
 -f lavfi -i "aevalsrc='0.035*(sin(2*PI*220*t)+0.8*sin(2*PI*277.2*t)+0.7*sin(2*PI*329.6*t))*(0.75+0.25*sin(2*PI*0.4*t))*min(1\\,t/0.6)*min(1\\,({D}-t)/0.8)':s=44100:d={D}" \
 -f lavfi -i "aevalsrc='0.9*sin(2*PI*55*t)*exp(-4*t)':s=44100:d=0.9" \
 -f lavfi -i "aevalsrc='0.5*sin(2*PI*90*t)*exp(-14*t)':s=44100:d=0.18" \
 -f lavfi -i "aevalsrc='0.10*(sin(2*PI*1568*t)+0.5*sin(2*PI*3136*t))*exp(-5*t)':s=44100:d=1.2" \
 -i {cfg['vo']} -filter_complex "{fc}" -map "[out]" -t {D} {d}/mix.wav""")
    out=f"out/{cfg['out']}"
    sh(f"ffmpeg -v error -y -i {d}/roh.mp4 -i {d}/mix.wav -filter_script:v {d}/filter.txt -map 0:v -map 1:a -c:v libx264 -preset slow -crf 17 -profile:v high -level 4.0 -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -ar 44100 -movflags +faststart -shortest {out}")
    print('OK',out)
build(json.load(open(sys.argv[1])))
