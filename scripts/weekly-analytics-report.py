#!/usr/bin/env python3
import csv
import html
import io
import os
import smtplib
import subprocess
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from email.message import EmailMessage

SERVICE_DIR = os.environ.get('ASKOOSU_SERVICE_DIR', '/Users/gabrieljang/Services/askoosu-orbstack')
DOCKER = os.environ.get('DOCKER_BIN', '/Applications/OrbStack.app/Contents/MacOS/xbin/docker')
TO = os.environ.get('ASKOOSU_REPORT_TO', 'oosuhada@oosu.dev')
FROM = os.environ.get('ASKOOSU_REPORT_FROM', os.environ.get('SMTP_USER', ''))


def psql_csv(sql):
    cmd = [
        DOCKER, 'compose', '-f', os.path.join(SERVICE_DIR, 'ops/orbstack/compose.prod.yml'),
        '--env-file', os.path.join(SERVICE_DIR, '.env.production'),
        'exec', '-T', 'postgres', 'sh', '-lc',
        'exec psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" --csv -c ' + shell_quote(sql),
    ]
    result = subprocess.run(cmd, cwd=SERVICE_DIR, text=True, capture_output=True, check=True)
    return list(csv.DictReader(io.StringIO(result.stdout)))


def shell_quote(value):
    return "'" + value.replace("'", "'\"'\"'") + "'"


def classify(session):
    paths = ' '.join(session['paths']).lower()
    ref = session['referrer'].lower()
    questions = ' '.join(session['questions']).lower()
    clicks = ' '.join(session['clicks']).lower()
    score = 0
    evidence = []
    if 'github.com' in ref:
        score += 2; evidence.append('GitHub 유입')
    if any(x in paths for x in ['/projects', '/stack', '/about', '/ai-era-developer']):
        score += 1; evidence.append('경력/프로젝트 페이지 탐색')
    if any(x in questions for x in ['project', 'stack', 'experience', '개발자', '프로젝트', '경력', '협업', 'contact', 'reach']):
        score += 2; evidence.append('경력·프로젝트 관련 질문')
    if session['page_count'] >= 4 or len(session['clicks']) >= 4:
        score += 1; evidence.append('높은 탐색 깊이')
    if 'linkedin' in ref:
        score += 2; evidence.append('LinkedIn 유입')
    if 'google.' in ref or 'naver.' in ref or 'bing.' in ref:
        if score < 3:
            return '검색 유입 탐색자', evidence + ['검색엔진 유입']
        evidence.append('검색엔진 유입')
    if score >= 5:
        return '채용/기술평가 가능성 높음', evidence
    if score >= 3:
        return '채용·협업 관심 가능성 있음', evidence
    if session['questions']:
        return 'AskOosu 적극 사용자', evidence or ['질문 제출']
    return '일반 브라우징 방문자', evidence


def fmt_seconds(ms):
    if not ms:
        return '0초'
    seconds = int(ms) // 1000
    return f'{seconds // 60}분 {seconds % 60}초' if seconds >= 60 else f'{seconds}초'


def main():
    visitors = psql_csv("""
      SELECT created_at AT TIME ZONE 'Asia/Seoul' AS created_kst, session_id, event_type,
             coalesce(path,'') AS path, coalesce(referrer,'') AS referrer,
             coalesce(utm_source,'') AS utm_source, coalesce(country,'') AS country,
             coalesce(geo_city,'') AS geo_city, coalesce(device_type,'') AS device_type,
             coalesce(browser,'') AS browser, coalesce(duration_ms,0) AS duration_ms,
             coalesce(target_text,'') AS target_text, coalesce(target_href,'') AS target_href
      FROM visitor_events WHERE created_at >= now() - interval '7 days'
      ORDER BY created_at ASC
    """)
    asks = psql_csv("""
      SELECT created_at AT TIME ZONE 'Asia/Seoul' AS created_kst, session_id,
             coalesce(question_redacted, question, '') AS question,
             coalesce(page_path,'') AS page_path, coalesce(referrer,'') AS referrer,
             coalesce(country,'') AS country, coalesce(device_type,'') AS device_type,
             coalesce(browser,'') AS browser
      FROM ask_events WHERE created_at >= now() - interval '7 days'
      ORDER BY created_at ASC
    """)

    sessions = defaultdict(lambda: {
        'paths': [], 'questions': [], 'question_entries': [], 'clicks': [], 'events': [],
        'durations': {}, 'duration_ms': 0,
        'referrer': '', 'country': '', 'city': '', 'device': '', 'browser': '', 'page_count': 0,
    })
    for row in visitors:
        sid = row['session_id'] or '(no-session)'
        s = sessions[sid]
        s['events'].append(row)
        if row['event_type'] == 'page_view' and row['path']:
            s['paths'].append(row['path']); s['page_count'] += 1
        if row['event_type'] == 'click' and row['target_text']:
            s['clicks'].append(row['target_text'])
        if row['event_type'] == 'engagement':
            path_key = row['path'] or '(unknown)'
            s['durations'][path_key] = max(
                s['durations'].get(path_key, 0), int(row['duration_ms'] or 0)
            )
        for key, src in [('referrer','referrer'),('country','country'),('city','geo_city'),('device','device_type'),('browser','browser')]:
            if row[src] and not s[key]: s[key] = row[src]
    for row in asks:
        sid = row['session_id'] or '(no-session)'
        s = sessions[sid]
        s['questions'].append(row['question'])
        s['question_entries'].append((row['created_kst'], row['question']))
        if row['page_path'] and row['page_path'] not in s['paths']:
            s['paths'].append(row['page_path'])
        for key, src in [('referrer','referrer'),('country','country'),('device','device_type'),('browser','browser')]:
            if row[src] and not s[key]: s[key] = row[src]

    labels = Counter()
    rows = []
    for sid, s in sessions.items():
        s['duration_ms'] = sum(s['durations'].values())
        label, evidence = classify(s)
        labels[label] += 1
        first = (
            s['events'][0]['created_kst']
            if s['events']
            else (s['question_entries'][0][0] if s['question_entries'] else '')
        )
        rows.append((first, sid, s, label, evidence))
    rows.sort(reverse=True)

    now = datetime.now(timezone.utc).astimezone()
    subject = f'[AskOosu] 주간 방문·질문 리포트 — {now:%Y-%m-%d}'
    lines = [
        'AskOosu Weekly Analytics', '',
        f'최근 7일 세션: {len(sessions)}',
        f'방문 이벤트: {len(visitors)}',
        f'질문: {len(asks)}', '',
        'Audience estimate (행동 기반 추정):',
    ]
    for label, count in labels.most_common():
        lines.append(f'- {label}: {count}')
    lines.append('')
    for first, sid, s, label, evidence in rows[:100]:
        lines += [
            f'[{first}] {label}',
            f'  위치/환경: {s["country"]} {s["city"]} · {s["device"]}/{s["browser"]}',
            f'  유입: {s["referrer"] or "direct/unknown"}',
            f'  체류: {fmt_seconds(s["duration_ms"])}',
            f'  경로: {" → ".join(s["paths"]) or "(없음)"}',
            f'  클릭: {" | ".join(s["clicks"][:12]) or "(없음)"}',
            f'  추정 근거: {", ".join(evidence) or "일반 탐색 패턴"}',
        ]
        for asked_at, q in s['question_entries']:
            lines.append(f'  질문 [{asked_at} KST]: {q}')
        lines.append('')
    text = '\n'.join(lines)

    if '--stdout' in sys.argv:
        print(text)
        return

    host = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
    port = int(os.environ.get('SMTP_PORT', '587'))
    user = os.environ.get('SMTP_USER', '')
    password = os.environ.get('SMTP_PASSWORD', '')
    if not user or not password:
        raise SystemExit('SMTP_USER and SMTP_PASSWORD are required')
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = FROM or user
    msg['To'] = TO
    msg.set_content(text)
    with smtplib.SMTP(host, port, timeout=30) as smtp:
        smtp.starttls()
        smtp.login(user, password)
        smtp.send_message(msg)


if __name__ == '__main__':
    main()
