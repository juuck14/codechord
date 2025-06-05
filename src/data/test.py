# import json
# with open('src/data/data.json', 'r') as file:
#     data = json.load(file)

# newData = []
# for item in data:
#     chordsInfos = item['chordsInfos']

#     newChordsInfos = []
#     for chordInfo in chordsInfos:
#         if 'chords' not in chordInfo: continue
#         if len(chordInfo['chords']) == 0: continue
#         newChordsInfos.append(chordInfo)
    
#     if len(chordsInfos) == 0: continue
#     item['chordsInfos'] = newChordsInfos
#     newData.append(item)
# with open('src/data/data.json', 'w') as file:
#     json.dump(newData, file, indent=4, ensure_ascii=False)
import json
with open('src/data/data.json', 'r') as file:
    data = json.load(file)

s = set()
for item in data:
    for chordInfo in item['chordsInfos']:
        try:
            s.add(chordInfo['section'])
        except KeyError:
            print(f"KeyError in item: {chordInfo}")
            exit(1)

print(s)