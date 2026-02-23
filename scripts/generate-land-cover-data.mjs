#!/usr/bin/env node
/**
 * Generates public/data/land_cover.json from data/Land cover dataset for dashboard.xlsx
 * Run: node scripts/generate-land-cover-data.mjs
 * Requires: Python 3 + openpyxl (pip install openpyxl, or use venv)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const EXCEL_PATH = path.join(ROOT, 'data', 'Land cover dataset for dashboard.xlsx')
const OUT_DIR = path.join(ROOT, 'public', 'data')
const OUT_PATH = path.join(OUT_DIR, 'land_cover.json')

const pyScript = `
import json
import os
try:
    import openpyxl
except ImportError:
    print("ERROR: openpyxl required. Run: pip install openpyxl")
    exit(1)

wb = openpyxl.load_workbook(r"${EXCEL_PATH.replace(/\\/g, '\\\\')}", read_only=True, data_only=True)
ws = wb['Dashboard']
rows = list(ws.iter_rows(values_only=True))
data_rows = [r for r in rows[1:] if r[0] and r[1] is not None and r[2] and r[3] is not None]

provinces = sorted(set(r[0] for r in data_rows))
years = sorted(set(int(r[1]) for r in data_rows))
categories = sorted(set(r[2] for r in data_rows))

by_province = [{'province': str(r[0]), 'year': int(r[1]), 'category': str(r[2]), 'area': round(float(r[3]), 2)} for r in data_rows]

from collections import defaultdict
agg = defaultdict(lambda: {2020: 0, 2023: 0})
for r in by_province:
    agg[r['category']][r['year']] += r['area']

physical = []
for cat in categories:
    d = agg[cat]
    a2020, a2023 = d.get(2020, 0), d.get(2023, 0)
    physical.append({'category': cat, '2020': round(a2020, 2), '2023': round(a2023, 2), 'change': round(a2023 - a2020, 2)})

total_2020 = sum(p['2020'] for p in physical)
total_2023 = sum(p['2023'] for p in physical)
change_pct = round(100 * (total_2023 - total_2020) / total_2020, 1) if total_2020 else 0
proportions_2023 = [{'category': p['category'], 'area': p['2023'], 'percent': round(100 * p['2023'] / total_2023, 1)} for p in physical]

out = {'years': years, 'provinces': provinces, 'categories': categories, 'kpis': {'total_2020': round(total_2020, 2), 'total_2023': round(total_2023, 2), 'change_percent': change_pct}, 'proportions_2023': proportions_2023, 'physical': physical, 'by_province': by_province}

os.makedirs(r"${OUT_DIR.replace(/\\/g, '\\\\')}", exist_ok=True)
with open(r"${OUT_PATH.replace(/\\/g, '\\\\')}", 'w') as f:
    json.dump(out, f, indent=2)
print('OK')
`

function run() {
  if (!fs.existsSync(EXCEL_PATH)) {
    console.warn('Excel file not found:', EXCEL_PATH)
    return
  }
  const tmpFile = path.join(ROOT, '.gen_land_cover.py')
  fs.writeFileSync(tmpFile, pyScript)
  try {
    execSync(`python3 "${tmpFile}"`, { stdio: 'inherit', cwd: ROOT })
    console.log('Generated', OUT_PATH)
  } catch (e) {
    console.warn('generate-land-cover failed (Python/openpyxl?). Using existing land_cover.json if present.')
  } finally {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile)
  }
}

run()
