import json
with open('src/data/data.json', 'r') as file:
    data = json.load(file)

newData = []
for item in data:
    chordsInfos = item['chordsInfos']

    newChordsInfos = []
    for chordInfo in chordsInfos:
        chords = chordInfo['chords']
        for chord in chords:
            chord['root'] = int(chord['root'])
            chord['type'] = int(chord['type'])
        newChordsInfos.append(chordInfo)
    item['chordsInfos'] = newChordsInfos
    newData.append(item)
with open('src/data/data.json', 'w') as file:
    json.dump(newData, file, indent=4, ensure_ascii=False)
# import json
# with open('src/data/data.json', 'r') as file:
#     data = json.load(file)

# s = {}
# ints = [0, 1, 2, 3, 4, 5, 6, 7]
# for item in data:
#     for chordInfo in item['chordsInfos']:
#         try:
#             for chord in chordInfo['chords']:
#                 root = chord['root']
#                 key = f'{root}_{type(root).__name__}'
#                 if key not in s:
#                     s[key] = 0
#                 s[key] += 1
#                 if root not in ints:
#                     print(f"Unexpected root type: {root} in item: {item['artist']} - {item['song']}")

#         except KeyError:
#             print(f"KeyError in item: {chordInfo}")
#             exit(1)

# print(s)