# ==============================================================================
# server/agent_bridge.py — Analytica-AI 8-Agent Workflow Bridge for CorporateBaddie
# ==============================================================================
import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

import json
import os
import pandas as pd
from dotenv import load_dotenv

# Load .env from Corporate-Baddie or Analytica-AI
load_dotenv(r"D:\Corporate-Baddie\.env")
load_dotenv(r"D:\Analytica-AI\.env")

# Ensure Analytica-AI modules are importable
sys.path.insert(0, r"D:\Analytica-AI")

def run_agent_investigation(question: str, data_path: str, workspace_context: dict) -> dict:
    try:
        from utils.llm import get_llm
        from langchain_community.tools import DuckDuckGoSearchRun
    except Exception as e:
        return {"error": f"Failed to import agent dependencies: {e}"}

    # 1. Load data
    df = None
    sample_records = []
    if data_path and os.path.exists(data_path):
        try:
            if data_path.endswith(".jsonl"):
                df = pd.read_json(data_path, lines=True)
            elif data_path.endswith(".csv"):
                df = pd.read_csv(data_path)
            elif data_path.endswith((".xlsx", ".xls")):
                df = pd.read_excel(data_path)
            sample_records = df.head(15).to_dict(orient="records")
        except Exception as e:
            sys.stderr.write(f"Warning: could not load data file {data_path}: {e}\n")

    # 2. Setup LLM
    try:
        llm = get_llm(temperature=0.1)
    except Exception as e:
        return {"error": f"LLM init failed: {e}"}

    # 3. Agent 1: Planner
    planner_prompt = f"""You are the Planner Agent for CorporateBaddie ("Making Sense of Corporate Nonsense").
Analyze this business question: "{question}"
Workspace context: {json.dumps(workspace_context)}
Available data columns: {list(df.columns) if df is not None else "None"}

Decompose this into:
1. Internal tasks (data analysis, column aggregation, outlier detection)
2. External tasks (industry benchmarks, market research, competitor trends)

Return JSON with format:
{{
  "internal_tasks": ["task 1", "task 2"],
  "external_tasks": ["research 1"]
}}"""
    internal_tasks = []
    external_tasks = []
    try:
        plan_resp = llm.invoke(planner_prompt)
        content = plan_resp.content.strip()
        if "{" in content:
            plan_json = json.loads(content[content.find("{"):content.rfind("}")+1])
            internal_tasks = plan_json.get("internal_tasks", [])
            external_tasks = plan_json.get("external_tasks", [])
    except Exception as e:
        sys.stderr.write(f"Planner note: {e}\n")

    # 4. Agent 2: Live Web Research (DuckDuckGo with fast timeout)
    web_sources = []
    research_snippets = []
    try:
        import concurrent.futures
        def _do_search():
            st = DuckDuckGoSearchRun()
            sq = f"{question} benchmarks industry"
            sr = st.run(sq)
            return sq, sr

        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(_do_search)
            sq, sr = future.result(timeout=4.0)
            if sr and len(sr) > 20:
                research_snippets.append(sr[:600])
                web_sources.append({"title": f"DuckDuckGo: {sq}", "url": "https://duckduckgo.com"})
    except Exception as e:
        sys.stderr.write(f"Search note: {e}\n")

    # 5. Agent 3: Empirical Coding Analysis
    findings = []
    anomalies = []
    if df is not None:
        numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()
        # Auto-convert string numbers
        for c in df.columns:
            if c not in numeric_cols:
                try:
                    num_series = pd.to_numeric(df[c])
                    df[c] = num_series
                    numeric_cols.append(c)
                except Exception:
                    pass

        # Calculate metrics
        for col in numeric_cols[:6]:
            mean_val = float(df[col].mean())
            min_val = float(df[col].min())
            max_val = float(df[col].max())
            std_val = float(df[col].std()) if len(df) > 1 else 0

            # Outlier check (z >= 2.5)
            if std_val > 0:
                outliers = df[abs(df[col] - mean_val) / std_val >= 2.5]
                if len(outliers) > 0:
                    for idx, row in outliers.iterrows():
                        anomalies.append({
                            "column": col,
                            "rowIndex": int(idx),
                            "value": float(row[col]),
                            "evidence": f"Outlier in {col} with value {row[col]}"
                        })

            findings.append({
                "id": f"fact-{col}",
                "type": "FACT",
                "claim": f"{col} averages {mean_val:.2f} (range: {min_val:.2f} to {max_val:.2f}) across {len(df)} records.",
                "source": "Python pandas analytical engine",
                "verified": True,
                "evidence": f"Directly computed from {len(df)} rows."
            })

    # 6. Agent 4: Executive Synthesis & Compiler
    compiler_prompt = f"""You are CorporateBaddie, an evidence-first executive decision intelligence platform.
Tagline: "Making Sense of Corporate Nonsense"

Business question:
{question}

Internal Data Findings:
{json.dumps(findings)}

Sample Records:
{json.dumps(sample_records[:10])}

External Market Intelligence:
{json.dumps(research_snippets)}

Anomalies Detected:
{json.dumps(anomalies)}

Return JSON ONLY with this exact structure:
{{
  "summary": "Direct, executive 1-sentence answer to the question",
  "why": ["Point 1 grounded in data", "Point 2"],
  "recommendation": "Decisive, evidence-backed action for management",
  "alternatives": ["Viable alternative option"],
  "risks": ["Specific operational or financial risk"],
  "assumptions": ["Key assumption being made"],
  "confidence": 85,
  "claimType": "RECOMMENDATION"
}}"""

    ai_result = None
    try:
        synth_resp = llm.invoke(compiler_prompt)
        text = synth_resp.content.strip()
        if "{" in text:
            parsed = json.loads(text[text.find("{"):text.rfind("}")+1])
            ai_result = {
                "provider": "grok",
                "model": "qwen/qwen3.8-27b",
                "response": text,
                "parsed": parsed,
                "sources": web_sources,
                "grounded": True
            }
    except Exception as e:
        sys.stderr.write(f"Compiler note: {e}\n")

    return {
        "ok": True,
        "findings": findings,
        "anomalies": anomalies,
        "sampleRecords": sample_records,
        "externalTasks": external_tasks,
        "internalTasks": internal_tasks,
        "webSources": web_sources,
        "ai": ai_result
    }

if __name__ == "__main__":
    raw_input = sys.stdin.read()
    data = json.loads(raw_input) if raw_input else {}
    q = data.get("question", "")
    p = data.get("dataPath", "")
    ws = data.get("workspace", {})
    res = run_agent_investigation(q, p, ws)
    print(json.dumps(res, ensure_ascii=False))
