import json
import os
import sys
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")

# Analytica-AI is optional. Set ANALYTICA_AI_HOME to its local checkout.
ANALYTICA_AI_HOME = os.getenv("ANALYTICA_AI_HOME")
if ANALYTICA_AI_HOME:
    sys.path.insert(0, str(Path(ANALYTICA_AI_HOME).expanduser().resolve()))


def _load_dataframe(data_path: str):
    if not data_path:
        return None
    path = Path(data_path).expanduser()
    if not path.is_absolute():
        path = ROOT / path
    if not path.exists():
        return None
    suffix = path.suffix.lower()
    if suffix == ".jsonl":
        return pd.read_json(path, lines=True)
    if suffix == ".csv":
        return pd.read_csv(path)
    if suffix in {".xlsx", ".xls"}:
        return pd.read_excel(path)
    return None


def _parse_json(text):
    cleaned = text.strip().replace("```json", "").replace("```", "").strip()
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start < 0 or end <= start:
        return None
    try:
        return json.loads(cleaned[start:end + 1])
    except json.JSONDecodeError:
        return None


def _load_agent_llm():
    try:
        from utils.llm import get_llm
    except Exception as exc:
        return None, f"Analytica-AI is not available: {exc}"
    try:
        return get_llm(temperature=0.1), None
    except Exception as exc:
        return None, f"Analytica-AI LLM could not start: {exc}"


def run_agent_investigation(question: str, data_path: str, workspace_context: dict) -> dict:
    df = None
    sample_records = []
    warnings = []

    try:
        df = _load_dataframe(data_path)
        if df is not None:
            sample_records = df.head(15).to_dict(orient="records")
    except Exception as exc:
        warnings.append(f"Could not load the dataset: {exc}")

    llm, llm_error = _load_agent_llm()
    if llm is None and llm_error:
        warnings.append(llm_error)

    columns = list(df.columns) if df is not None else []
    planner_prompt = f"""You are the planning layer for CorporateBaddie.
Business question: {question}
Workspace: {json.dumps(workspace_context)}
Available columns: {json.dumps(columns)}
Return JSON only: {{"internal_tasks": ["..."], "external_tasks": ["..."]}}"""

    internal_tasks = []
    external_tasks = []
    if llm is not None:
        try:
            plan = _parse_json(llm.invoke(planner_prompt).content)
            if isinstance(plan, dict):
                internal_tasks = plan.get("internal_tasks", [])
                external_tasks = plan.get("external_tasks", [])
        except Exception as exc:
            warnings.append(f"Planner skipped: {exc}")

    findings = []
    anomalies = []
    if df is not None:
        numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()
        for column in df.columns:
            if column in numeric_cols:
                continue
            converted = pd.to_numeric(df[column], errors="coerce")
            if converted.notna().sum() > 0:
                df[column] = converted
                numeric_cols.append(column)

        for column in numeric_cols[:6]:
            series = df[column].dropna()
            if series.empty:
                continue
            mean_value = float(series.mean())
            min_value = float(series.min())
            max_value = float(series.max())
            std_value = float(series.std()) if len(series) > 1 else 0.0
            if std_value > 0:
                outliers = df[(df[column] - mean_value).abs() / std_value >= 2.5]
                for index, row in outliers.iterrows():
                    anomalies.append({"column": column, "rowIndex": int(index), "value": float(row[column]), "evidence": f"Outlier in {column} with value {row[column]}"})
            findings.append({
                "id": f"fact-{column}",
                "type": "FACT",
                "claim": f"{column} averages {mean_value:.2f} (range: {min_value:.2f} to {max_value:.2f}) across {len(series)} non-empty records.",
                "source": "Python pandas analytical engine",
                "verified": True,
                "evidence": f"Directly computed from {len(series)} non-empty values.",
            })

    compiler_prompt = f"""You are the reasoning layer for CorporateBaddie.
Answer the business question using the evidence below. Do not invent numbers or causes.
Question: {question}
Verified findings: {json.dumps(findings)}
Sample records: {json.dumps(sample_records[:10])}
Anomalies: {json.dumps(anomalies)}
Return JSON only with summary, why, recommendation, alternatives, risks, assumptions, confidence, and claimType."""

    ai_result = None
    if llm is not None:
        try:
            response = llm.invoke(compiler_prompt)
            text = response.content.strip()
            parsed = _parse_json(text)
            if parsed:
                ai_result = {"provider": "analytica-ai", "model": os.getenv("LLM_MODEL", "configured model"), "response": text, "parsed": parsed, "sources": [], "grounded": bool(findings)}
        except Exception as exc:
            warnings.append(f"Compiler skipped: {exc}")

    return {"ok": True, "findings": findings, "anomalies": anomalies, "sampleRecords": sample_records, "externalTasks": external_tasks, "internalTasks": internal_tasks, "webSources": [], "ai": ai_result, "warnings": warnings}


if __name__ == "__main__":
    raw_input = sys.stdin.read()
    payload = json.loads(raw_input) if raw_input else {}
    result = run_agent_investigation(payload.get("question", ""), payload.get("dataPath", ""), payload.get("workspace", {}))
    print(json.dumps(result, ensure_ascii=False))
