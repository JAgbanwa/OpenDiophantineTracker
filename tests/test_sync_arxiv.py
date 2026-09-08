import unittest

from scripts.sync_arxiv import (
    SyncError,
    detect_resolved_entries,
    extract_change_section,
    normalize_equation,
    parse_arxiv_metadata,
    strip_tex_comments,
)


class SyncArxivTests(unittest.TestCase):
    def test_normalizes_tracker_and_tex_equations(self):
        self.assertEqual(
            normalize_equation(r"\textcolor{red}{x^{4} + y^{3} = z^{2}}"),
            "x^4+y^3=z^2",
        )
        self.assertEqual(normalize_equation(r"x^4+y^3=z^2"), "x^4+y^3=z^2")

    def test_comments_do_not_count_as_open_equations(self):
        source = "visible $x^2=1$\n% hidden $y^2=2$\nescaped \\% remains"
        stripped = strip_tex_comments(source)
        self.assertIn("$x^2=1$", stripped)
        self.assertNotIn("$y^2=2$", stripped)
        self.assertIn(r"\% remains", stripped)

    def test_detects_only_changed_equations_absent_from_open_body(self):
        source = r"""
\section{Current open catalogue}
$b^2=2$ and $c^2=3$ and $d^2=5$ remain open.
\section{Changes in this document between versions}
\subsection{Changes between versions 9 and 10}
The equation $a^2=1$ has been solved and removed. The equation $b^2=2$
is mentioned but remains open.
"""
        entries = [
            {"id": "a", "equation": "a^2=1"},
            {"id": "b", "equation": "b^2=2"},
            {"id": "c", "equation": "c^2=3"},
            {"id": "d", "equation": "d^2=5"},
        ]
        resolved, report = detect_resolved_entries(entries, source, 9, 10)
        self.assertEqual([entry["id"] for entry in resolved], ["a"])
        self.assertEqual(report["resolvedUniqueEquations"], 1)
        self.assertTrue(report["changeLogHasResolutionLanguage"])

    def test_extract_change_section_requires_exact_release(self):
        source = r"""
\section{Changes in this document between versions}
\subsection{Changes between versions 8 and 9}
Text.
"""
        with self.assertRaises(SyncError):
            extract_change_section(source, 9, 10)

    def test_parses_latest_version_and_history(self):
        source = """
        <html><body>
        Submitted on 12 Apr 2024, last revised 30 Aug 2026 (this version, v9)
        [v8] Mon, 13 Jul 2026 09:00:25 UTC
        [v9] Sun, 30 Aug 2026 14:28:49 UTC
        </body></html>
        """
        metadata = parse_arxiv_metadata(source)
        self.assertEqual(metadata["version"], "v9")
        self.assertEqual(metadata["revisionDate"], "30 Aug 2026")
        self.assertEqual(metadata["history"]["v8"], "13 Jul 2026")


if __name__ == "__main__":
    unittest.main()
