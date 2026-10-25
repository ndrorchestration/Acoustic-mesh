"""Exact rational principal-minor oracle for small symmetric covariance matrices.

Independent of the Node pivoted-Schur implementation. The 2–4D corpus is
deterministically seeded, free of extra dependencies, and intentionally excludes
ill-conditioned tolerance-boundary claims.
"""
import itertools
import json
import random
import subprocess
import unittest
from fractions import Fraction
from pathlib import Path

HERE = Path(__file__).resolve().parent


def determinant(matrix):
    """Exact Leibniz determinant; used only for n <= 4."""
    n = len(matrix)
    total = Fraction(0)
    for perm in itertools.permutations(range(n)):
        inversions = sum(perm[i] > perm[j] for i in range(n) for j in range(i + 1, n))
        product = Fraction(-1 if inversions % 2 else 1)
        for i, j in enumerate(perm):
            product *= Fraction(matrix[i][j])
        total += product
    return total


def exact_psd(matrix):
    """Real symmetric matrix is PSD iff every principal minor is nonnegative."""
    n = len(matrix)
    assert 1 <= n <= 4
    assert all(len(row) == n for row in matrix)
    assert all(matrix[i][j] == matrix[j][i] for i in range(n) for j in range(n))
    for order in range(1, n + 1):
        for ids in itertools.combinations(range(n), order):
            minor = [[matrix[i][j] for j in ids] for i in ids]
            if determinant(minor) < 0:
                return False
    return True


def node_psd(cases):
    file_url = (HERE / "spatial-observation-validator.mjs").as_uri()
    js = (
        "import { isNumericallyPsd } from " + json.dumps(file_url) + ";"
        "import { readFileSync } from 'node:fs';"
        "const cases = JSON.parse(readFileSync(0,'utf8'));"
        "console.log(JSON.stringify(cases.map(matrix =>"
        "isNumericallyPsd(matrix.flat(),matrix.length))));"
    )
    result = subprocess.run(
        ["node", "--input-type=module", "-e", js],
        input=json.dumps(cases),
        cwd=HERE.parent, capture_output=True, text=True,
        check=True, timeout=20,
    )
    return json.loads(result.stdout)


class TestCovarianceOracle(unittest.TestCase):
    def test_fixed_seed_principal_minor_oracle(self):
        rng = random.Random(21025)
        cases = [
            [[0, 0], [0, 0]], [[1, 1], [1, 1]],
            [[1, 2], [2, 1]], [[0, 1], [1, 0]],
            [[1, -1], [-1, 1]],
        ]
        for n in (2, 3, 4):
            for _ in range(15):
                basis = [[rng.randint(-3, 3) for _ in range(n)] for _ in range(n)]
                psd = [
                    [sum(basis[k][i] * basis[k][j] for k in range(n)) for j in range(n)]
                    for i in range(n)
                ]
                cases.append(psd)
                not_psd = [row[:] for row in psd]
                not_psd[0][0] = -1
                cases.append(not_psd)

        expected = [exact_psd(matrix) for matrix in cases]
        actual = node_psd(cases)
        self.assertEqual(len(actual), len(expected))
        for i, (a, e) in enumerate(zip(actual, expected)):
            with self.subTest(index=i, dimensions=len(cases[i])):
                self.assertEqual(a, e, f"matrix {cases[i]!r}")
        self.assertEqual(len(cases), 95)


if __name__ == "__main__":
    unittest.main()
