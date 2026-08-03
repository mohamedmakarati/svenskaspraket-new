import json
import re
from pathlib import Path

SOURCE = Path('../tmp/pdfs/a1-verbs/verbs.txt')
OUTPUT = Path('public/verbs-data.json')

arabic = {
  'anteckna':'يدوّن ملاحظات','arbeta':'يعمل','baka':'يخبز','berätta':'يخبر / يروي','börja':'يبدأ','cykla':'يركب الدراجة','dansa':'يرقص','diska':'يغسل الصحون','diskutera':'يناقش','dela':'يشارك / يقسم','fiska':'يصطاد السمك','flytta':'ينتقل','forska':'يبحث علميًا','fråga':'يسأل','fundera':'يفكّر / يتأمل','gilla':'يحب / يعجبه','gissa':'يخمّن','jaga':'يصطاد / يطارد','jobba':'يعمل','jogga':'يركض ببطء','kasta':'يرمي','komplettera':'يُكمل','kosta':'يكلّف','laga mat':'يطبخ','leta':'يبحث عن','lyssna':'يستمع','låna':'يستعير','längta':'يشتاق','mejla':'يرسل بريدًا إلكترونيًا','mingla':'يختلط بالناس','orka':'تكون لديه طاقة','packa':'يحزم','passa':'يناسب','planera':'يخطط','plugga':'يدرس','prata':'يتحدث','presentera':'يقدّم / يعرّف','promenera':'يتمشّى','prova':'يجرّب','pröva':'يختبر / يجرّب','räkna':'يعدّ / يحسب','separera':'يفصل','shoppa':'يتسوّق','slappa':'يسترخي','sluta':'ينتهي / يتوقف','sola':'يتشمّس','somna':'ينام','sortera':'يرتّب / يصنّف','spara':'يدّخر / يحفظ','spela':'يلعب / يعزف','stanna':'يبقى / يتوقف','starta':'يبدأ / يشغّل','stava':'يتهجّى','studera':'يدرس','städa':'ينظّف ويرتّب','svara':'يجيب','tala':'يتكلم','titta':'ينظر / يشاهد','tjäna':'يكسب','träffa':'يلتقي','träna':'يتدرّب','vakna':'يستيقظ','vandra':'يمشي لمسافة طويلة','visa':'يُري / يعرض','vänta':'ينتظر','älska':'يحب','behöva':'يحتاج','beställa':'يطلب','bygga':'يبني','drömma':'يحلم','fylla':'يملأ / يبلغ عمرًا','följa med':'يرافق','ringa':'يتصل','slänga':'يرمي','stänga':'يغلق','besöka':'يزور','byta':'يغيّر / يستبدل','köpa':'يشتري','läsa':'يقرأ','resa':'يسافر','röka':'يدخّن','söka':'يبحث / يتقدّم بطلب','tycka':'يعتقد / يرى','tycka om':'يحب / يعجبه','växa (upp)':'ينمو / يكبر','åka':'يذهب بوسيلة نقل','höra':'يسمع','jämföra':'يقارن','köra':'يقود','lära sig':'يتعلّم','bo':'يسكن','må':'يشعر / يكون حاله','tro':'يعتقد / يؤمن','använda':'يستخدم','dra':'يسحب','dricka':'يشرب','dö':'يموت','bli':'يصبح','få':'يحصل على / يُسمح له','finnas':'يوجد','flyga':'يطير','fortsätta':'يستمر','förstå':'يفهم','gifta sig':'يتزوج','gå':'يمشي / يذهب','göra':'يفعل / يصنع','ha':'لديه / يملك','heta':'اسمه / يُدعى','hinna':'يلحق / يكون لديه وقت','kunna':'يستطيع / يعرف','komma':'يأتي','ligga':'يقع / يكون مستلقيًا','låta':'يسمح / يبدو صوته','lägga sig':'يذهب إلى النوم','rida':'يركب الحصان','se':'يرى','sitta':'يجلس','sätta':'يضع','sjunga':'يغنّي','skilja sig':'يطلّق / ينفصل','skriva':'يكتب','sova':'ينام','springa':'يركض','stiga upp':'ينهض','säga':'يقول','ta':'يأخذ','trivas':'يشعر بالارتياح','vara':'يكون','veta':'يعرف','vinna':'يفوز','äta':'يأكل'
}

groups = [(66,'1'),(75,'2A'),(86,'2B'),(90,'2C'),(93,'3'),(131,'4-5')]
rows = []
for line in SOURCE.read_text(encoding='utf-8').splitlines():
    parts = [p.strip() for p in re.split(r'\s{2,}', line.strip()) if p.strip()]
    if len(parts) >= 6 and (parts[0].endswith('!') or parts[0] == '*'):
        rows.append(parts[:6])

if len(rows) != 131:
    raise SystemExit(f'Expected 131 verbs, found {len(rows)}')

data = []
for index, (imperative, infinitive, present, preterite, supine, english) in enumerate(rows, 1):
    group = next(label for end, label in groups if index <= end)
    if infinitive not in arabic:
        raise SystemExit(f'Missing Arabic translation: {infinitive}')
    data.append({
        'id': index,
        'group': group,
        'imperative': None if imperative == '*' else imperative.rstrip('!'),
        'infinitive': infinitive,
        'present': present,
        'preterite': preterite,
        'supine': supine,
        'english': english,
        'arabic': arabic[infinitive],
    })

payload = {
  'title': 'A1-verb',
  'count': len(data),
  'verbs': data,
  'auxiliaries': [
    {'swedish':'brukar + infinitiv','english':'usually / be in the habit of','arabic':'عادةً ما'},
    {'swedish':'får + infinitiv','english':'be allowed to','arabic':'يُسمح له أن'},
    {'swedish':'hinner + infinitiv','english':'have time to','arabic':'يلحق / لديه وقت أن'},
    {'swedish':'kan + infinitiv','english':'can / be able to','arabic':'يستطيع أن'},
    {'swedish':'måste + infinitiv','english':'must / have to','arabic':'يجب أن'},
    {'swedish':'orkar + infinitiv','english':'have the energy to','arabic':'لديه طاقة أن'},
    {'swedish':'ska + infinitiv','english':'will / be going to','arabic':'سوف'},
    {'swedish':'skulle vilja + infinitiv','english':'would like to','arabic':'يودّ أن'},
    {'swedish':'vill + infinitiv','english':'want to','arabic':'يريد أن'}
  ]
}
OUTPUT.parent.mkdir(exist_ok=True)
OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'Wrote {len(data)} verbs to {OUTPUT}')
