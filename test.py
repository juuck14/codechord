import requests
from bs4 import BeautifulSoup
import json

url = f"https://rateyourmusic.com/artist/adam-lambert"
# 2. 웹페이지 요청
response = requests.get(url)
print(response.status_code)
print(response)
response.encoding = 'utf-8'

# 3. HTML 파싱
soup = BeautifulSoup(response.text, 'html.parser')