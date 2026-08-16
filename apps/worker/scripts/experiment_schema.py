"""
Experiment #4: JSON schema compliance rate — with vs without strict schema enforcement.
Calls Gemini 2.5 Flash 20 times in each condition and measures malformed response rate.
"""
import json, urllib.request, time, os
from pathlib import Path
from dotenv import load_dotenv

# Load Gemini API keys from apps/api/.env
_script_dir = Path(__file__).resolve().parent
load_dotenv(_script_dir.parent.parent.parent / "apps" / "api" / ".env")
load_dotenv(_script_dir.parent.parent / "api" / ".env")  # fallback relative path

def _get_keys():
    keys = []
    for i in range(1, 6):
        suffix = "" if i == 1 else str(i)
        k = os.getenv(f"GEMINI_API_KEY{suffix}")
        if k:
            keys.append(k)
    if not keys:
        raise EnvironmentError("No GEMINI_API_KEY found. Ensure apps/api/.env exists.")
    return keys

GEMINI_KEYS = _get_keys()
GEMINI_API_KEY = GEMINI_KEYS[0]
GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

REQUIRED_FIELDS = {
    "winner", "player1Name", "player2Name",
    "player1TotalScore", "player2TotalScore",
    "whatDecidedIt", "player1Strengths", "player2Strengths",
    "player1Weaknesses", "player2Weaknesses", "keyEvidence", "rounds"
}

TRANSCRIPT = """Opening Statement - Alice: AI will not replace software engineers. Creativity, ethics, and system design are deeply human.
Argument - Bob: McKinsey reports 30% of coding tasks can be automated. Junior engineers may see significant displacement.
Closing Statement - Alice: History shows automation creates more jobs than it destroys. We should upskill, not panic.
Brief Response - Bob: The pace of this change is unprecedented. GPT-4 writes production code today."""

SCHEMA_EXAMPLE = """{
  "winner": "Alice",
  "player1Name": "Alice",
  "player2Name": "Bob",
  "player1TotalScore": 78,
  "player2TotalScore": 72,
  "whatDecidedIt": "Alice's historical examples outweighed Bob's statistical claims.",
  "player1Strengths": ["Strong historical grounding"],
  "player2Strengths": ["Cited concrete statistics"],
  "player1Weaknesses": ["Could have engaged with McKinsey data directly"],
  "player2Weaknesses": ["Overstated job loss risk"],
  "keyEvidence": ["McKinsey 30% automation stat", "Historical job creation data"],
  "rounds": [
    {
      "name": "Opening Statement",
      "winner": "Alice",
      "player1Score": {"logic": 8, "clarity": 9, "evidence": 7, "civility": 10},
      "player2Score": {"logic": 7, "clarity": 8, "evidence": 8, "civility": 10},
      "player1Feedback": "Strong framing.",
      "player2Feedback": "Good stats, weak narrative."
    }
  ]
}"""

PROMPT_WITH_SCHEMA = (
    "Score the following debate. Return ONLY valid JSON matching this exact schema — "
    "no markdown, no code blocks, no extra fields, no commentary:\n\n"
    + SCHEMA_EXAMPLE +
    "\n\nDebate transcript:\n" + TRANSCRIPT
)

PROMPT_WITHOUT_SCHEMA = (
    "Score the following debate between Alice and Bob. "
    "Tell me who won, their scores, strengths, weaknesses, and a round-by-round breakdown.\n\n"
    "Debate transcript:\n" + TRANSCRIPT
)

def call_gemini(prompt, key_index=0):
    key = GEMINI_KEYS[key_index % len(GEMINI_KEYS)]
    url = f"{GEMINI_BASE}?key={key}"
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=body,
                                  headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=60) as resp:
        result = json.loads(resp.read())
    return result["candidates"][0]["content"]["parts"][0]["text"].strip()

def validate_response(text):
    """Returns (is_valid_json, has_all_fields, raw_text)"""
    # Strip markdown code fences if present
    cleaned = text
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        cleaned = "\n".join(lines[1:-1]) if lines[-1].strip() == "```" else "\n".join(lines[1:])
    try:
        obj = json.loads(cleaned)
        missing = REQUIRED_FIELDS - set(obj.keys())
        return True, len(missing) == 0, missing
    except json.JSONDecodeError:
        return False, False, set()

N = 10  # calls per condition (10 each = 20 total, respects rate limits)
print(f"Running {N} calls WITHOUT schema enforcement...")
without_results = []
for i in range(N):
    try:
        text = call_gemini(PROMPT_WITHOUT_SCHEMA, key_index=i)
        is_json, has_fields, missing = validate_response(text)
        without_results.append({"valid_json": is_json, "all_fields": has_fields, "missing": missing})
        status = "OK" if (is_json and has_fields) else ("BAD_JSON" if not is_json else f"MISSING:{missing}")
        print(f"  [{i+1}] {status}")
        time.sleep(1)
    except Exception as e:
        without_results.append({"valid_json": False, "all_fields": False, "missing": set(), "error": str(e)})
        print(f"  [{i+1}] ERROR: {e}")
        time.sleep(2)

print(f"\nRunning {N} calls WITH strict schema enforcement...")
with_results = []
for i in range(N):
    try:
        text = call_gemini(PROMPT_WITH_SCHEMA, key_index=i)
        is_json, has_fields, missing = validate_response(text)
        with_results.append({"valid_json": is_json, "all_fields": has_fields, "missing": missing})
        status = "OK" if (is_json and has_fields) else ("BAD_JSON" if not is_json else f"MISSING:{missing}")
        print(f"  [{i+1}] {status}")
        time.sleep(1)
    except Exception as e:
        with_results.append({"valid_json": False, "all_fields": False, "missing": set(), "error": str(e)})
        print(f"  [{i+1}] ERROR: {e}")
        time.sleep(2)

# ── Results ──────────────────────────────────────────────────────────────────
without_fail = sum(1 for r in without_results if not (r["valid_json"] and r["all_fields"]))
with_fail = sum(1 for r in with_results if not (r["valid_json"] and r["all_fields"]))

without_fail_pct = (without_fail / N) * 100
with_fail_pct = (with_fail / N) * 100

print(f"\n{'='*60}")
print(f"WITHOUT schema: {without_fail}/{N} failures ({without_fail_pct:.0f}% failure rate)")
print(f"WITH schema:    {with_fail}/{N} failures ({with_fail_pct:.0f}% failure rate)")
if without_fail > 0:
    reduction = ((without_fail - with_fail) / without_fail) * 100
    print(f"Schema enforcement reduced malformed responses by {reduction:.0f}%")
else:
    print("Note: 0 failures without schema — Gemini is formatting well for this prompt.")
print(f"{'='*60}")
