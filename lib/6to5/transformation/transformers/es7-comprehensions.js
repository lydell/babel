"use strict";

var buildComprehension = require("../helpers/build-comprehension");
var traverse           = require("../../traverse");
var util               = require("../../util");
var t                  = require("../../types");

exports.experimental = true;

exports.ComprehensionExpression = function (node) {
  if (!node.generator) return;

  var body = [];
  var container = t.functionExpression(null, [], t.blockStatement(body), true);
  container._aliasFunction = true;

  body.push(buildComprehension(node, function () {
    return t.expressionStatement(t.yieldExpression(node.body));
  }));

  return t.callExpression(container, []);
};

exports.ComprehensionExpression = function (node, parent, scope, context, file) {
  if (node.generator) return;

  var uid = scope.generateUidBasedOnNode(parent, file);

  var container = util.template("array-comprehension-container", {
    KEY: uid
  });
  container.callee._aliasFunction = true;

  var block = container.callee.body;
  var body  = block.body;

  if (traverse.hasType(node, "YieldExpression", t.FUNCTION_TYPES)) {
    container.callee.generator = true;
    container = t.yieldExpression(container, true);
  }

  var returnStatement = body.pop();

  body.push(buildComprehension(node, function () {
    return util.template("array-push", {
      STATEMENT: node.body,
      KEY:       uid
    }, true);
  }));
  body.push(returnStatement);

  return container;
};