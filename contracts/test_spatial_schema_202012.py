"""Independent JSON Schema structural fixtures, distinct from contextual Node admission.

Requires: python -m pip install 'jsonschema[format]==4.23.0'
"""
import json
import unittest
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker

HERE = Path(__file__).resolve().parent
SCHEMA = json.loads((HERE / "spatial-observation-v0.1.schema.json").read_text())
CASES = json.loads((HERE / "spatial-schema-cases.json").read_text())["cases"]

class TestSpatialObservationDraft202012(unittest.TestCase):
    def test_meta_schema(self):
        Draft202012Validator.check_schema(SCHEMA)

    def test_shared_structural_cases(self):
        validator = Draft202012Validator(SCHEMA, format_checker=FormatChecker())
        for case in CASES:
            with self.subTest(name=case["name"]):
                errors = sorted(validator.iter_errors(case["observation"]), key=lambda e: str(e.path))
                self.assertEqual(
                    not errors, case["schema_valid"],
                    f'{case["name"]}: {[(list(e.path),e.validator,e.message) for e in errors]}'
                )

if __name__ == "__main__":
    unittest.main()
