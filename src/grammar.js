var sys = require('sys'),
    Parser = require('jison').Parser;

var grammar = {
    "startSymbol": "program",

    "operators": [
        ["left", "COMPARE"],
        ["left", "+", "-"],
        ["left", "MATH"],
        ["left", "."]
    ],

    "bnf": {
        "program": [
            ["EOF", "return [];"],
            ["body EOF", "return $1;"]
        ],
        "body": [
            ["line", "$$ = [$1];"],
            ["body TERMINATOR line", "$$ = $1; $1.push($3);"],
            ["body TERMINATOR", "$$ = $1;"]
        ],
        "line": [
            ["statement", "$$ = $1;"],
            ["expression", "$$ = $1;"],
            ["COMMENT", "$$ = new yy.Comment($1);"]
        ],
        "block": [
            ["INDENT body OUTDENT", "$$ = $2;"],
            ["INDENT OUTDENT", "$$ = $1;"]
        ],
        "doBody": [
            ["doLine", "$$ = [$1];"],
            ["doBody TERMINATOR doLine", "$$ = $1; $1.push($3);"],
            ["doBody TERMINATOR", "$$ = $1;"]
        ],
        "doLine": [
            ["line", "$$ = $1;"],
            ["BIND IDENTIFIER = expression", "$$ = new yy.Bind($2, $4);"],
            ["RETURN expression", "$$ = new yy.Return($2);"]
        ],
        "doBlock": [
            ["INDENT doBody OUTDENT", "$$ = $2;"]
        ],
        "statement": [
            ["letFunction", "$$ = $1;"],
            ["letBinding", "$$ = $1;"],
            ["dataDecl", "$$ = $1;"],
            ["macro", "$$ = $1;"]
        ],
        "expression": [
            ["innerExpression", "$$ = $1;"],
            ["FN paramList optType = expression", "$$ = new yy.Function(undefined, $2, [$5], $3);"],
            ["FN paramList optType = block", "$$ = new yy.Function(undefined, $2, $5, $3);"],
            ["MATCH innerExpression INDENT caseList OUTDENT", "$$ = new yy.Match($2, $4);"],
            ["DO innerExpression doBlock TERMINATOR", "$$ = new yy.Do($2, $3);"],
            ["call", "$$ = $1;"]
        ],
        "innerExpression": [
            ["ifThenElse", "$$ = $1;"],
            ["( expression )", "$$ = $2;"],
            ["& ( expression )", "$$ = new yy.Replacement($3);"],
            ["[| expression |]", "$$ = new yy.Quoted($2);"],
            ["accessor", "$$ = $1;"],
            ["innerExpression MATH innerExpression", "$$ = new yy.BinaryNumberOperator($2, $1, $3);"],
            ["innerExpression + innerExpression", "$$ = new yy.BinaryNumberOperator($2, $1, $3);"],
            ["innerExpression - innerExpression", "$$ = new yy.BinaryNumberOperator($2, $1, $3);"],
            ["innerExpression COMPARE innerExpression", "$$ = new yy.BinaryGenericOperator($2, $1, $3);"],
            ["literal", "$$ = $1;"]
        ],
        "caseList": [
            ["CASE pattern = expression", "$$ = [new yy.Case($2, $4)];"],
            ["caseList TERMINATOR CASE pattern = expression", "$$ = $1; $1.push(new yy.Case($4, $6));"]
        ],
        "pattern": [
            ["( IDENTIFIER patternIdentifiers )", "$$ = new yy.Pattern($2, $3);"],
            ["IDENTIFIER", "$$ = new yy.Pattern($1, []);"]
        ],
        "patternIdentifiers": [
            ["IDENTIFIER", "$$ = [$1];"],
            ["patternIdentifiers IDENTIFIER", "$$ = $1; $1.push($2);"]
        ],
        "ifThenElse": [
            ["IF innerExpression THEN block TERMINATOR ELSE block", "$$ = new yy.IfThenElse($2, $4, $7);"]
        ],
        "dataDecl": [
            ["DATA IDENTIFIER optParamList = dataList", "$$ = new yy.Data($2, $3, $5);"],
            ["DATA IDENTIFIER optParamList = INDENT dataList OUTDENT", "$$ = new yy.Data($2, $3, $6);"]
        ],
        "dataList": [
            ["IDENTIFIER optParamList", "$$ = [new yy.Tag($1, $2)];"],
            ["dataList | IDENTIFIER optParamList", "$$ = $1; $1.push(new yy.Tag($3, $4));"]
        ],
        "optParamList": [
            ["", "$$ = [];"],
            ["paramList", "$$ = $1;"]
        ],
        "macro": [
            ["MACRO IDENTIFIER = expression", "$$ = new yy.Macro($2, [$4]);"],
            ["MACRO IDENTIFIER = block", "$$ = new yy.Macro($2, $4);"]
        ],
        "letFunction": [
            ["LET IDENTIFIER paramList optType = block", "$$ = new yy.Function($2, $3, $6, $4);"],
            ["LET IDENTIFIER paramList optType = expression", "$$ = new yy.Function($2, $3, [$6], $4);"]
        ],
        "letBinding": [
            ["LET IDENTIFIER optType = expression", "$$ = new yy.Let($2, $5, $3);"],
            ["LET IDENTIFIER optType = INDENT expression OUTDENT", "$$ = new yy.Let($2, $6, $3);"]
        ],
        "paramList": [
            ["( )", "$$ = [];"],
            ["param", "$$ = [$1];"],
            ["paramList ( )", "$$ = $1;"],
            ["paramList param", "$$ = $1; $1.push($2);"]
        ],
        "param": [
            ["IDENTIFIER", "$$ = new yy.Arg($1);"],
            ["( IDENTIFIER : identifier )", "$$ = new yy.Arg($2, $4);"]
        ],
        "optType": [
            ["", ""],
            [": identifier", "$$ = $2"]
        ],
        "call": [
            ["accessor argList", "$$ = new yy.Call($1, $2);"],
            ["( expression ) argList", "$$ = new yy.Call($2, $4);"]
        ],
        "argList": [
            ["( )", "$$ = [];"],
            ["innerExpression", "$$ = [$1];"],
            ["argList ( )", "$$ = $1;"],
            ["argList innerExpression", "$$ = $1; $1.push($2);"]
        ],
        "literal": [
            ["NUMBER", "$$ = new yy.Number($1);"],
            ["STRING", "$$ = new yy.String($1);"],
            ["BOOLEAN", "$$ = new yy.Boolean($1);"],
            ["[ optValues ]", "$$ = new yy.Array($2);"],
            ["{ optPairs }", "$$ = new yy.Object($2);"]
        ],
        "optValues": [
            ["", "$$ = [];"],
            ["arrayValues", "$$ = $1;"]
        ],
        "arrayValues": [
            ["expression", "$$ = [$1];"],
            ["arrayValues , expression", "$$ = $1; $1.push($3);"]
        ],
        "optPairs": [
            ["", "$$ = {};"],
            ["INDENT keyPairs OUTDENT TERMINATOR", "$$ = $2;"],
            ["keyPairs", "$$ = $1;"]
        ],
        "keyPairs": [
            ["keywordOrIdentifier : expression", "$$ = {}; $$[$1] = $3;"],
            ["keyPairs , keywordOrIdentifier : expression", "$$ = $1; $1[$3] = $5;"],
            ["keyPairs TERMINATOR optTerm keywordOrIdentifier : expression TERMINATOR", "$$ = $1; $1[$4] = $6;"]
        ],
        "optTerm": [
            ["", ""],
            ["TERMINATOR", ""]
        ],
        "accessor": [
            ["IDENTIFIER", "$$ = new yy.Identifier($1);"],
            ["accessor . keywordOrIdentifier", "$$ = new yy.Access($1, $3);"],
            ["( expression ) . keywordOrIdentifier", "$$ = new yy.Access($2, $5);"]
        ],
        "keywordOrIdentifier": [
            ["RETURN", "$$ = $1;"],
            ["BIND", "$$ = $1;"],
            ["IDENTIFIER", "$$ = $1;"]
        ],
        "identifier": [
            ["IDENTIFIER", "$$ = new yy.Identifier($1);"]
        ]
    }
};

var parser = new Parser(grammar, {debug: true});

var fs = require('fs');
fs.writeFile('src/parser.js', parser.generate());
