// The calculators must reproduce the worked examples of the course (slides, practice sheets, sample midterm).
import { test } from "node:test";
import assert from "node:assert/strict";
import * as ml from "../site/js/lib/ml.js";

const near = (a, b, eps = 0.002, msg) => assert.ok(Math.abs(a - b) <= eps, `${msg ?? ""} ${a} ≉ ${b}`);

test("entropy and gini values from the tables", () => {
  near(ml.entropy([1, 3]), 0.811);
  near(ml.entropy([2, 5]), 0.863);
  near(ml.entropy([2, 3]), 0.971);
  near(ml.entropy([3, 4]), 0.985);
  assert.equal(ml.entropy([6, 0]), 0);
  near(ml.gini([5, 2]), 0.408);
});

const cafe = [
  ["alone", "noon", "no", "Yes"], ["alone", "noon", "yes", "No"], ["alone", "evening", "no", "Yes"], ["alone", "evening", "yes", "No"],
  ["friends", "noon", "no", "Yes"], ["friends", "noon", "yes", "Yes"], ["friends", "evening", "no", "Yes"],
].map(([c, t, h, y]) => ({ c, t, h, y }));

test("ID3 on the cafe data (practice week 5)", () => {
  const tree = ml.id3(cafe, ["c", "t", "h"], "y", { classes: ["Yes", "No"] });
  assert.equal(tree.feature, "h");
  const g = Object.fromEntries(tree.cands.map((c) => [c.feature, c.gain]));
  near(g.c, 0.292); near(g.t, 0.006); near(g.h, 0.470);
  const yes = tree.children.find((c) => c.value === "yes").child;
  assert.equal(yes.feature, "c");
  near(yes.cands.find((c) => c.feature === "t").gain, 0.251);
  assert.equal(ml.treePredict(tree, { c: "friends", t: "evening", h: "yes" }), "Yes");
  const gi = ml.id3(cafe, ["c", "t", "h"], "y", { classes: ["Yes", "No"], crit: "gini" });
  assert.equal(gi.feature, "h");
  near(gi.cands.find((c) => c.feature === "h").weighted, 0.190);
  near(gi.cands.find((c) => c.feature === "c").weighted, 0.286);
});

test("continuous threshold (practice week 5 Q5)", () => {
  const t = ml.thresholdTable([2, 3, 5, 7, 8], ["Y", "Y", "N", "N", "Y"]);
  const best = t.rows.reduce((a, b) => (b.gain > a.gain ? b : a));
  assert.equal(best.t, 4);
  near(best.gain, 0.420);
  near(t.rows.find((r) => r.t === 7.5).gain, 0.171);
  assert.deepEqual(t.rows.filter((r) => r.changes).map((r) => r.t), [4, 7.5]);
});

test("regression tree SSE (practice week 5 Q7)", () => {
  const r = ml.regressionSplits([1, 2, 3, 4, 5, 6], [1, 2, 2, 9, 10, 12]);
  near(r.root, 118);
  near(r.rows.find((x) => x.t === 3.5).total, 5.33, 0.01);
});

test("scaling (slides week 2 and practice Q2)", () => {
  const z = ml.zscore([2, 4, 4, 4, 5, 5, 7, 9]);
  assert.equal(z.mean, 5); assert.equal(z.sd, 2);
  const z2 = ml.zscore([1, 2, 2, 4, 5, 10]);
  assert.equal(z2.sd, 3);
  near(ml.zscore([7], [1, 2, 2, 4, 5, 10]).values[0], 1);
  near(ml.minmax([7], [1, 2, 2, 4, 5, 10]).values[0], 0.667);
});

test("confusion matrix and metrics (practice week 2 Q4)", () => {
  const y = [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0], p = [1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0];
  const c = ml.confusion(y, p);
  assert.deepEqual([c.TP, c.FN, c.FP, c.TN], [3, 2, 2, 5]);
  const m = ml.metrics(c);
  near(m.accuracy, 0.667); near(m.precision, 0.6); near(m.recall, 0.6); near(m.specificity, 0.714); near(m.f1, 0.6);
  near(ml.metrics({ TP: 8, FN: 2, FP: 20, TN: 470 }).f1, 0.421);
});

test("ROC and AUC (slides week 2 and practice Q6)", () => {
  const r = ml.roc([true, true, false, true, false, true, false, false]);
  near(r.auc, 0.8125);
  assert.equal(r.goodPairs, 13);
  const r2 = ml.roc([true, true, false, true, false, false]);
  near(r2.auc, 8 / 9);
  assert.deepEqual(r2.corners.map((p) => p.map((v) => ml.round(v, 2))), [[0, 0], [0, 0.67], [0.33, 0.67], [0.33, 1], [1, 1]]);
  near(ml.roc([1, 1, 0, 0, 1, 0, 0, 1, 0, 0].map(Boolean)).auc, 0.75);
});

test("regression metrics (slides week 2)", () => {
  const r = ml.regressionMetrics([3, 5, 4, 6, 8, 10], [2.5, 5, 4.5, 6, 7, 10]);
  near(r.mse, 0.25); near(r.mae, 0.333); near(r.r2, 0.956);
});

test("PCA in 2-D (slides week 2)", () => {
  const p = ml.pca2([[1, 2], [2, 3], [3, 3], [4, 5], [5, 4], [6, 7]]);
  near(p.cov[0][0], 3.5); near(p.cov[1][1], 3.2); near(p.cov[0][1], 3.0);
  near(p.eig[0], 6.35, 0.01); near(p.ratio, 0.948, 0.002);
  const q = ml.pca2([[1, 1], [2, 3], [3, 2], [4, 4]]);
  near(q.eig[0], 3); near(q.eig[1], 1 / 3); near(q.ratio, 0.9);
  near(q.pc1[0], Math.SQRT1_2);
});

test("kNN worked example and LOO (slides week 3)", () => {
  const pts = [["A", 1, 2, "+"], ["B", 2, 1, "+"], ["C", 2, 3, "+"], ["D", 3, 2, "+"], ["E", 4, 4, "-"], ["F", 6, 4, "-"], ["G", 7, 1, "-"], ["H", 7, 6, "-"]]
    .map(([name, a, b, y]) => ({ name, x: [a, b], y }));
  const r = ml.knnRank(pts, [4, 3]);
  assert.deepEqual(r.map((p) => p.name), ["E", "D", "C", "F", "B", "A", "G", "H"]);
  assert.equal(ml.knnVote(r, 1).label, "-");
  assert.equal(ml.knnVote(r, 3).label, "+");
  assert.equal(ml.knnVote(r, 5).label, "+");
  const loo = [["A", 1, 2, "+"], ["B", 2, 2, "+"], ["C", 1, 4, "+"], ["D", 6, 3, "+"], ["E", 4, 2, "-"], ["F", 4, 5, "-"], ["G", 5, 3, "-"], ["H", 4, 4, "-"]]
    .map(([name, a, b, y]) => ({ name, x: [a, b], y }));
  const res = ml.loo(loo, [1, 3]);
  near(res[0].acc, 0.75); near(res[1].acc, 0.875);
});

test("least squares and gradient descent (slides and practice week 4)", () => {
  const l = ml.leastSquares1([1, 2, 3, 4], [2, 3, 5, 6]);
  near(l.w1, 1.4); near(l.w0, 0.5); near(l.mse, 0.05);
  const l2 = ml.leastSquares1([1, 2, 3, 4], [2, 4, 5, 7]);
  near(l2.w1, 1.6); near(l2.r2, 0.985);
  const g = ml.gdNoBias([[1, 2], [2, 4]], 0, 0.1, 2);
  near(g.steps[0].next, 1); near(g.steps[1].next, 1.5);
  const d = ml.gdNoBias([[1, 2], [2, 4]], 0, 1, 2);
  near(d.steps[1].next, -30);
});

test("logistic regression step and softmax (week 4)", () => {
  const s = ml.logisticStep([0, 0], 0, [1, 2], 1, 0.5);
  assert.deepEqual(s.w, [0.25, 0.5]); near(s.b, 0.25); near(s.p2, 0.818);
  const s2 = ml.logisticStep([0, 0], 0, [1, 2], 1, 0.4);
  near(s2.z2, 1.2); near(s2.p2, 0.769); near(s2.loss2, 0.263);
  const p = ml.softmax([2, 1, 0]);
  near(p[0], 0.665); near(p[1], 0.245); near(p[2], 0.090);
});

test("perceptron, slide example (week 4)", () => {
  const data = [[[2, 3], 1], [[1, 1], -1], [[3, 2], 1], [[0, 2], -1], [[3, 4], 1], [[2, 0], -1], [[1, 3], 1]].map(([x, y]) => ({ x, y }));
  const r = ml.perceptron(data, [-0.5, 0.5], -0.7, 0.4, { epochs: 1 });
  near(r.w[0], -0.1); near(r.w[1], 0.5); near(r.b, -1.1);
  assert.deepEqual(r.passes[0].steps.filter((s) => s.wrong).map((s) => s.i + 1), [1, 2, 4]);
  const cm = ml.confusion(r.evalRows.map((e) => e.y), r.evalRows.map((e) => e.pred));
  assert.deepEqual([cm.TP, cm.FN, cm.FP, cm.TN], [3, 1, 0, 3]);
});

test("perceptron, practice week 4 Q6 converges in 4 passes", () => {
  const data = [[[1, 1], 1], [[2, 0], 1], [[0, 1], -1], [[-1, 0], -1], [[1, -1], 1]].map(([x, y]) => ({ x, y }));
  const r1 = ml.perceptron(data, [0, 0], 0, 1, { epochs: 1 });
  assert.deepEqual(r1.w, [0, -1]); assert.equal(r1.b, -1);
  const r = ml.perceptron(data, [0, 0], 0, 1, { epochs: 10 });
  assert.equal(r.passes.length, 4); assert.ok(r.converged);
  assert.deepEqual(r.w, [2, -1]);
});

test("Kumar 3-input perceptron (bias inside w, eta 0.1 in the y - ŷ form = 0.2 here)", () => {
  const X = [[1, 0, 0], [1, 0, 1], [1, 1, 0], [1, 1, 1], [0, 0, 1], [0, 1, 0], [0, 1, 1], [0, 0, 0]];
  const Y = [-1, 1, 1, 1, -1, -1, -1, -1];
  const data = X.map((x, i) => ({ x, y: Y[i] }));
  const r = ml.perceptron(data, [0, 0, 0], 0, 0.2, { epochs: 1 });
  near(r.b, -0.2); r.w.forEach((w) => near(w, 0));
  // with the z >= 0 rule the data is separated after 8 passes (the 9th makes no mistake)
  const full = ml.perceptron(data, [0, 0, 0], 0, 0.2, { epochs: 50 });
  assert.equal(full.passes.length, 9); assert.ok(full.converged);
  near(full.b, -0.6); near(full.w[0], 0.4); near(full.w[1], 0.2); near(full.w[2], 0.2);
});

test("ensembles (practice week 6)", () => {
  near(ml.majorityError(3, 0.8), 0.104);
  near(ml.majorityError(5, 0.8), 0.058);
  near(ml.bootstrapOut(4), 0.316);
  const w = Array(10).fill(0.1), y = Array(10).fill(1), h = [-1, -1, 1, 1, 1, 1, 1, 1, 1, 1];
  const r = ml.adaboostRound(w, y, h);
  near(r.alpha, 0.693); near(r.next[0], 0.25); near(r.next[5], 0.0625);
  const gb = ml.gradientBoost([1, 2, 3, 4], [1, 3, 5, 7], 0.5, 2, 2.5);
  assert.deepEqual(gb[1].F, [3, 3, 5, 5]); near(gb[1].mse, 2); near(gb[2].mse, 1.25);
});

test("AdaBoost on the pocket bank (slides week 6)", () => {
  const X = [[0, 0], [0, 0.5], [0, 1], [0.5, 0], [0.5, 0.5], [0.5, 1], [1, 0.5], [1, 1]];
  const y = [-1, -1, 1, -1, 1, 1, 1, 1];
  const pool = [
    { name: "x1≥0.25", f: (x) => (x[0] >= 0.25 ? 1 : -1) }, { name: "x1≥0.75", f: (x) => (x[0] >= 0.75 ? 1 : -1) },
    { name: "x2≥0.25", f: (x) => (x[1] >= 0.25 ? 1 : -1) }, { name: "x2≥0.75", f: (x) => (x[1] >= 0.75 ? 1 : -1) },
  ];
  const r = ml.adaboost(X, y, pool, 3);
  assert.deepEqual(r.rounds.map((t) => t.best.name), ["x2≥0.25", "x1≥0.25", "x2≥0.75"]);
  near(r.rounds[0].alpha, 0.973); near(r.rounds[1].alpha, 0.896); near(r.rounds[2].alpha, 1.199);
  assert.ok(r.score.every((s, i) => Math.sign(s) === y[i]));
});

test("SVM (slides and practice week 7)", () => {
  const s = ml.hardMarginSVM([{ x: [2, 2], y: 1 }, { x: [3, 1], y: 1 }, { x: [0, 0], y: -1 }, { x: [1, 0], y: -1 }]);
  near(s.w[0], 2 / 3); near(s.w[1], 2 / 3); near(s.b, -5 / 3); near(s.margin, 1.061);
  const a = ml.svmAlphas(s.w, s.sv);
  const byName = Object.fromEntries(s.sv.map((p, i) => [p.x.join(","), a[i]]));
  near(byName["2,2"], 2 / 9); near(byName["3,1"], 2 / 9); near(byName["1,0"], 4 / 9);
  const s2 = ml.hardMarginSVM([{ x: [2, 1], y: 1 }, { x: [3, 2], y: 1 }, { x: [0, 1], y: -1 }, { x: [1, 0], y: -1 }]);
  near(s2.w[0], 1); near(s2.w[1], 1); near(s2.b, -2);
  const p = ml.svmPoint([1, 2], -3, [2, 2], 1);
  near(p.distance, 1.342); assert.equal(p.where, "sokağın dışında");
  const o1 = ml.softObjective([1, 0], -2, [{ x: [0, 0], y: -1 }, { x: [1, 1], y: -1 }, { x: [3, 0], y: 1 }, { x: [3, 3], y: 1 }, { x: [1.5, 2], y: 1 }], 10);
  near(o1.J, 15.5);
  near(ml.kernels.poly([1, 1], [2, 0]), 4);
  near(ml.kernels.rbf([0, 0], [1, 0], { gamma: 0.5 }), 0.607);
});

test("2-2-1 network forward and backward (slides week 8)", () => {
  const r = ml.mlp221({ W: [[0.5, 0.5], [-1, 1]], b: [0, -0.5], v: [1, -1], c: -1, x: [1, 2], y: 1 });
  assert.deepEqual(r.h, [1.5, 0.5]); near(r.yhat, 0.5); near(r.loss, 0.693);
  near(r.dv[0], -0.75); near(r.dW[0][1], -1.0); near(r.dW[1][0], 0.5);
  near(r.next.v[0], 1.075); near(r.next.W[0][0], 0.55);
});

test("Boolean formula to MLP", () => {
  // (¬x1 ∧ ¬x2) ∧ (¬x3 ∨ ¬x4) = (¬x1¬x2¬x3) ∨ (¬x1¬x2¬x4)
  const net = ml.dnfToMLP([[{ i: 0, neg: true }, { i: 1, neg: true }, { i: 2, neg: true }], [{ i: 0, neg: true }, { i: 1, neg: true }, { i: 3, neg: true }]], 4);
  for (const x of ml.allBinary(4)) {
    const want = !x[0] && !x[1] && (!x[2] || !x[3]) ? 1 : 0;
    assert.equal(ml.evalMLP(net, x).y, want, x.join(""));
  }
});

test("CNN arithmetic (final practice Q37)", () => {
  const c = ml.convLayer({ inH: 128, inW: 128, inC: 16, filters: 64, kh: 3, kw: 7, stride: [2, 3], pad: [1, 2] });
  assert.deepEqual([c.oh, c.ow, c.oc, c.weights, c.biases], [64, 42, 64, 21504, 64]);
  const o = ml.conv2d([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[1, 0], [0, 1]]);
  assert.deepEqual(o, [[6, 8], [12, 14]]);
  const I = [[1, 2, 0, 1], [0, 1, 3, 1], [2, 1, 0, 0], [1, 0, 1, 2]], K = [[1, 0, -1], [1, 0, -1], [1, 0, -1]];
  assert.deepEqual(ml.conv2d(I, K), [[0, 2], [-1, -1]]);
  assert.deepEqual(ml.conv2d(I, K, { pad: 1 }), [[-3, -2, 1, 3], [-4, 0, 2, 3], [-2, -1, -1, 4], [-1, 2, -1, 1]]);
  const c2 = ml.convLayer({ inH: 16, inW: 16, inC: 16, filters: 32, kh: 3, kw: 3, stride: [1, 1], pad: [1, 1] });
  assert.equal(c2.weights + c2.biases, 4640);
});

// ---- the sample midterm (computed here so the worked solutions on exam-midterm.html stay consistent)
const drone = [
  ["Hafif", "Yok", "İyi", "Evet"], ["Hafif", "Yok", "Kötü", "Evet"], ["Hafif", "Yok", "İyi", "Evet"], ["Kuvvetli", "Var", "İyi", "Hayır"],
  ["Kuvvetli", "Yok", "Kötü", "Hayır"], ["Hafif", "Var", "Kötü", "Hayır"], ["Kuvvetli", "Yok", "İyi", "Hayır"],
].map(([r, ya, g, y]) => ({ r, ya, g, y }));
export const midtermPts = [[8, 10, 1], [14, 4, 1], [5, 8, 1], [26, 8, -1], [35, 2, -1], [17, 2, -1], [29, 6, -1]];

test("sample midterm Q1: ID3", () => {
  const t = ml.id3(drone, ["r", "ya", "g"], "y", { classes: ["Evet", "Hayır"] });
  near(t.imp, 0.985);
  const g = Object.fromEntries(t.cands.map((c) => [c.feature, c.gain]));
  near(g.r, 0.522); near(g.ya, 0.292); near(g.g, 0.020);
  assert.equal(t.feature, "r");
  const hafif = t.children.find((c) => c.value === "Hafif").child;
  assert.equal(hafif.feature, "ya");
  near(hafif.cands.find((c) => c.feature === "ya").gain, 0.811);
});

test("sample midterm Q2", () => {
  const x1 = midtermPts.map((p) => p[0]), x2 = midtermPts.map((p) => p[1]);
  const s1 = ml.minmax(x1).values, s2 = ml.minmax(x2).values;
  assert.deepEqual(s1.map((v) => ml.round(v, 3)), [0.1, 0.3, 0, 0.7, 1, 0.4, 0.8]);
  assert.deepEqual(s2.map((v) => ml.round(v, 3)), [1, 0.25, 0.75, 0.75, 0, 0, 0.5]);
  const pts = s1.map((a, i) => ({ x: [a, s2[i]], y: midtermPts[i][2], name: "P" + (i + 1) }));
  // d) perceptron W = (-1, 1), w0 = 0: P2 (z = -0.05) is missed, P4 (z = +0.05) is a false alarm
  const pred = pts.map((p) => (-p.x[0] + p.x[1] >= 0 ? 1 : -1));
  const cm = ml.confusion(pts.map((p) => p.y), pred);
  assert.deepEqual([cm.TP, cm.FN, cm.FP, cm.TN], [2, 1, 1, 3]);
  // e) one pass, eta 0.4: updates on P2 and P4
  const r = ml.perceptron(pts, [-1, 1], 0, 0.4, { epochs: 1 });
  assert.deepEqual(r.passes[0].steps.filter((s) => s.wrong).map((s) => s.i + 1), [2, 4]);
  near(r.w[0], -1.16); near(r.w[1], 0.8); near(r.b, 0);
  // f) kNN for Q = (0.45, 0.35)
  const rank = ml.knnRank(pts, [0.45, 0.35]);
  assert.deepEqual(rank.slice(0, 3).map((p) => p.name), ["P2", "P6", "P7"]);
  assert.equal(ml.knnVote(rank, 1).label, 1);
  assert.equal(ml.knnVote(rank, 3).label, -1);
  // g) the threshold x1 <= 0.35 separates perfectly
  const th = ml.thresholdTable(s1, pts.map((p) => p.y));
  near(th.rows.find((t) => t.t === 0.35).gain, 0.985);
  // h) hard-margin SVM: w = (-10, 4), b = 3 on the scaled data
  const s = ml.hardMarginSVM(pts);
  near(s.w[0], -10); near(s.w[1], 4); near(s.b, 3);
  assert.deepEqual(s.sv.map((p) => p.name).sort(), ["P2", "P4", "P6"]);
});
