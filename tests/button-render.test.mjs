import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

// Check emitted JSX: same-line whitespace becomes a real string child on native.
test('button render fragments never emit raw text outside Text', () => {
  const files = ["account/AccountScreen.tsx","account/AccountDetailScreen.tsx","campaigns/CampaignsScreen.tsx","campaigns/CampaignDetailScreen.tsx","campaigns/CampaignRegistration.tsx","contributions/ContributionsScreen.tsx","contributions/ContributionDetailScreen.tsx","contributions/DonationFlowScreen.tsx","store/StoreScreen.tsx","assignments/AssignmentsScreen.tsx","schedule/CampaignTimeline.tsx","attendance/AttendanceScreen.tsx","assistant/Assistant.tsx","about/AboutScreen.tsx","about/AboutDetailScreen.tsx"];
  for (const file of files) {
    const source = fs.readFileSync(path.join('src/features', file), 'utf8');
    const output = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext } }).outputText;
    const tree = ts.createSourceFile(file + '.js', output, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    function visit(node) {
      if (ts.isCallExpression(node) && node.arguments[0]?.getText(tree) === '_Fragment') {
        const props = node.arguments[1];
        if (props && ts.isObjectLiteralExpression(props)) {
          const children = props.properties.find(p => ts.isPropertyAssignment(p) && p.name.getText(tree) === 'children');
          if (children) {
            const values = ts.isArrayLiteralExpression(children.initializer) ? children.initializer.elements : [children.initializer];
            for (const value of values) assert.equal(ts.isStringLiteral(value), false, file + ': raw text in fragment: ' + value.getText(tree));
          }
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(tree);
  }
});



