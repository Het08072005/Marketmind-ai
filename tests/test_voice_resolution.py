"""Exercise the production resolver without starting external market services."""
import ast
import re
import unittest
from pathlib import Path
from typing import List, Optional

SOURCE = Path(__file__).resolve().parents[1] / 'backend/services/voice_service.py'
tree = ast.parse(SOURCE.read_text())
names = {'COMPANY_ALIASES', 'PREFIX_NEGATION_REGEX', 'POSTFIX_NEGATION_REGEX'}
functions = {'normalize_spoken_query', 'resolve_all_symbols_with_spans', 'resolve_all_symbols'}
nodes = [n for n in tree.body if
         isinstance(n, ast.Assign) and any(isinstance(t, ast.Name) and t.id in names for t in n.targets)
         or isinstance(n, ast.FunctionDef) and n.name in functions]
namespace = dict(re=re, List=List, Optional=Optional)
exec(compile(ast.Module(body=nodes, type_ignores=[]), str(SOURCE), 'exec'), namespace)

class VoiceResolutionTests(unittest.TestCase):
    def test_pairs(self):
        for query, expected in [
            ('mujhe adani and reliance share ka comparison dikhao', ['ADANIENT', 'RELIANCE']),
            ('adani and relicne comparison', ['ADANIENT', 'RELIANCE']),
            ('compare infosys with tcs', ['INFY', 'TCS']),
            ('अडानी और रिलायंस की तुलना दिखाओ', ['ADANIENT', 'RELIANCE']),
            ('adani ports and adani power comparison', ['ADANIPORTS', 'ADANIPOWER']),
            ('reliance reliance comparison', ['RELIANCE']),
            ('reliance nahi tcs aur infosys comparison', ['TCS', 'INFY']),
            ('show market overview', []),
        ]:
            with self.subTest(query=query):
                self.assertEqual(namespace['resolve_all_symbols'](query), expected)

    def test_comparison_action(self):
        # Run the actual DNA branch with market reads stubbed out.
        branch = next(n for n in ast.walk(tree) if isinstance(n, ast.If)
                      and isinstance(n.test, ast.BoolOp)
                      and 'dna fingerprint' in ast.unparse(n.test)
                      and 'resolve_all_symbols' in ast.unparse(n.test))
        code = compile(ast.fix_missing_locations(ast.Module(body=[ast.If(test=branch.test, body=branch.body, orelse=[])], type_ignores=[])), str(SOURCE), 'exec')
        for query in ['adani and relicne comparison', 'comparison tcs infosys', 'अडानी और रिलायंस की तुलना दिखाओ']:
            scope = dict(namespace, q_lower=query, detected_symbol='RELIANCE', history=[],
                         is_hindi=False, is_hinglish=False,
                         fetch_live_stock_data=lambda symbol: {'name': symbol},
                         get_company_by_symbol=lambda symbol: {'name': symbol},
                         extract_symbols_from_history=lambda history: [])
            exec(code, scope)
            self.assertEqual(scope['action_payload']['type'], 'DNA_COMPARE')
            self.assertEqual(scope['action_payload']['target_page'], 'dna')
            self.assertEqual(list(scope['action_payload']['params'].values()), namespace['resolve_all_symbols'](query))

if __name__ == '__main__':
    unittest.main()
