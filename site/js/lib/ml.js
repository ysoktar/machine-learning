// Pure computations behind every calculator, stepper and drill on the site.
// No DOM here: the same functions are unit-tested in test/ml.test.mjs against the worked examples of the course.

// ---------------------------------------------------------------- numbers
export const round = (x, d = 3) => {
  if (!Number.isFinite(x)) return x;
  const f = 10 ** d;
  const r = Math.round((x + Math.sign(x) * 1e-12) * f) / f;
  return Object.is(r, -0) ? 0 : r;
};
/** Format with up to d decimals, Turkish-free (dot) so it matches the exam papers. */
export const fmt = (x, d = 3) => {
  if (x === undefined || x === null) return "–";
  if (Number.isNaN(x)) return "tanımsız";
  if (x === Infinity) return "∞";
  if (x === -Infinity) return "−∞";
  const r = round(x, d);
  return String(r).replace("-", "−");
};
export const sum = (a) => a.reduce((s, x) => s + x, 0);
export const mean = (a) => sum(a) / a.length;
export const log2 = (x) => Math.log(x) / Math.LN2;
export const sigmoid = (z) => 1 / (1 + Math.exp(-z));

/** Seeded random numbers (mulberry32) so drill problems can be shared by their number. */
export function rng(seed) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  next.int = (lo, hi) => lo + Math.floor(next() * (hi - lo + 1));
  next.pick = (arr) => arr[Math.floor(next() * arr.length)];
  next.shuffle = (arr) => { const a2 = [...arr]; for (let i = a2.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [a2[i], a2[j]] = [a2[j], a2[i]]; } return a2; };
  return next;
}

// ---------------------------------------------------------------- impurity
/** Entropy in bits of a list of class counts. 0·log 0 = 0. */
export function entropy(counts) {
  const n = sum(counts);
  if (!n) return 0;
  let h = 0;
  for (const c of counts) if (c > 0) h -= (c / n) * log2(c / n);
  return h;
}
export function gini(counts) {
  const n = sum(counts);
  if (!n) return 0;
  return 1 - sum(counts.map((c) => (c / n) ** 2));
}
const impurity = (counts, crit) => (crit === "gini" ? gini(counts) : entropy(counts));

/** Class counts of rows[target] in the order of `classes`. */
export function countClasses(rows, target, classes) {
  return classes.map((c) => rows.filter((r) => r[target] === c).length);
}
export const uniq = (a) => [...new Set(a)];

/**
 * Split statistics of a categorical feature: one branch per value.
 * Returns { feature, branches:[{value, rows, counts, n, imp}], weighted, gain, splitInfo, gainRatio }.
 */
export function splitStats(rows, feature, target, classes, crit = "entropy") {
  const n = rows.length;
  const parent = impurity(countClasses(rows, target, classes), crit);
  const values = uniq(rows.map((r) => r[feature]));
  const branches = values.map((value) => {
    const sub = rows.filter((r) => r[feature] === value);
    const counts = countClasses(sub, target, classes);
    return { value, rows: sub, counts, n: sub.length, imp: impurity(counts, crit) };
  });
  const weighted = sum(branches.map((b) => (b.n / n) * b.imp));
  const splitInfo = entropy(branches.map((b) => b.n));
  const gain = parent - weighted;
  return { feature, branches, parent, weighted, gain, splitInfo, gainRatio: splitInfo > 0 ? gain / splitInfo : 0 };
}

/**
 * ID3 (or the same greedy algorithm with Gini / gain ratio). Every node keeps the full candidate table, so a page can
 * print the exam-style computation level by level.
 * Ties are broken by the order of `features` (as on paper: the first column wins).
 */
export function id3(rows, features, target, { crit = "entropy", useGainRatio = false, classes, depth = 0, maxDepth = Infinity } = {}) {
  classes ??= uniq(rows.map((r) => r[target]));
  const counts = countClasses(rows, target, classes);
  const imp = impurity(counts, crit);
  const majority = classes[counts.indexOf(Math.max(...counts))];
  const node = { rows, counts, imp, majority, depth };
  if (imp === 0 || !features.length || depth >= maxDepth) return { ...node, leaf: true, label: majority };
  const cands = features.map((f) => splitStats(rows, f, target, classes, crit));
  const score = (c) => (useGainRatio ? c.gainRatio : c.gain);
  let best = cands[0];
  for (const c of cands) if (score(c) > score(best) + 1e-12) best = c;
  if (score(best) <= 1e-12) return { ...node, leaf: true, label: majority, cands };
  const rest = features.filter((f) => f !== best.feature);
  const children = best.branches.map((b) => ({
    value: b.value,
    child: id3(b.rows, rest, target, { crit, useGainRatio, classes, depth: depth + 1, maxDepth }),
  }));
  return { ...node, leaf: false, feature: best.feature, cands, best, children };
}
export function treePredict(tree, x) {
  let t = tree;
  while (!t.leaf) {
    const ch = t.children.find((c) => c.value === x[t.feature]);
    if (!ch) return t.majority;
    t = ch.child;
  }
  return t.label;
}

/**
 * Candidate thresholds of a numeric feature: midpoints between consecutive distinct sorted values (all) and whether
 * the label changes there. Gain of "x <= t".
 */
export function thresholdTable(values, labels, crit = "entropy") {
  const classes = uniq(labels);
  const idx = values.map((v, i) => i).sort((a, b) => values[a] - values[b]);
  const xs = idx.map((i) => values[i]), ys = idx.map((i) => labels[i]);
  const parent = impurity(classes.map((c) => ys.filter((y) => y === c).length), crit);
  const out = [];
  for (let i = 0; i + 1 < xs.length; i++) {
    if (xs[i] === xs[i + 1]) continue;
    const t = (xs[i] + xs[i + 1]) / 2;
    const L = ys.filter((_, j) => xs[j] <= t), R = ys.filter((_, j) => xs[j] > t);
    const cl = classes.map((c) => L.filter((y) => y === c).length), cr = classes.map((c) => R.filter((y) => y === c).length);
    const w = (L.length / ys.length) * impurity(cl, crit) + (R.length / ys.length) * impurity(cr, crit);
    // the label "changes" when the classes on both sides of the cut are not one and the same single class
    const leftSet = uniq(ys.filter((_, j) => xs[j] === xs[i])), rightSet = uniq(ys.filter((_, j) => xs[j] === xs[i + 1]));
    const changes = !(leftSet.length === 1 && rightSet.length === 1 && leftSet[0] === rightSet[0]);
    out.push({ t, left: cl, right: cr, nl: L.length, nr: R.length, weighted: w, gain: parent - w, changes });
  }
  return { classes, parent, rows: out, sorted: xs.map((x, i) => [x, ys[i]]) };
}

/** Regression tree split: SSE of each side for "x <= t". */
export function sse(ys) { if (!ys.length) return 0; const m = mean(ys); return sum(ys.map((y) => (y - m) ** 2)); }
export function regressionSplits(xs, ys) {
  const idx = xs.map((_, i) => i).sort((a, b) => xs[a] - xs[b]);
  const X = idx.map((i) => xs[i]), Y = idx.map((i) => ys[i]);
  const out = [];
  for (let i = 0; i + 1 < X.length; i++) {
    if (X[i] === X[i + 1]) continue;
    const t = (X[i] + X[i + 1]) / 2;
    const L = Y.filter((_, j) => X[j] <= t), R = Y.filter((_, j) => X[j] > t);
    out.push({ t, meanL: mean(L), meanR: mean(R), sseL: sse(L), sseR: sse(R), total: sse(L) + sse(R) });
  }
  return { root: sse(Y), rootMean: mean(Y), rows: out };
}

// ---------------------------------------------------------------- scaling, metrics
export function minmax(xs, ref = xs) {
  const lo = Math.min(...ref), hi = Math.max(...ref);
  return { min: lo, max: hi, values: xs.map((x) => (hi === lo ? 0 : (x - lo) / (hi - lo))) };
}
/** z-score with the population standard deviation (divide by n), as on the slides. */
export function zscore(xs, ref = xs) {
  const mu = mean(ref);
  const sd = Math.sqrt(mean(ref.map((x) => (x - mu) ** 2)));
  return { mean: mu, sd, values: xs.map((x) => (sd === 0 ? 0 : (x - mu) / sd)) };
}

/** Confusion counts for binary labels; `pos` is the positive label. */
export function confusion(y, yhat, pos = 1) {
  let TP = 0, FP = 0, FN = 0, TN = 0;
  const tags = y.map((t, i) => {
    const p = yhat[i] === pos, a = t === pos;
    if (a && p) { TP++; return "TP"; }
    if (a && !p) { FN++; return "FN"; }
    if (!a && p) { FP++; return "FP"; }
    TN++; return "TN";
  });
  return { TP, FP, FN, TN, tags };
}
export function metrics({ TP, FP, FN, TN }) {
  const n = TP + FP + FN + TN;
  const precision = TP + FP ? TP / (TP + FP) : NaN;
  const recall = TP + FN ? TP / (TP + FN) : NaN;
  const specificity = TN + FP ? TN / (TN + FP) : NaN;
  const f1 = 2 * TP + FP + FN ? (2 * TP) / (2 * TP + FP + FN) : NaN;
  return { n, accuracy: (TP + TN) / n, precision, recall, specificity, f1, fpr: TN + FP ? FP / (TN + FP) : NaN, balanced: (recall + specificity) / 2 };
}

/**
 * ROC from labels sorted by score, highest first (true = positive). Threshold "first k are positive".
 * Returns the table, the corner points and the AUC (pair count and trapezoid agree when there are no score ties).
 */
export function roc(labels) {
  const P = labels.filter(Boolean).length, N = labels.length - P;
  const table = [];
  let tp = 0, fp = 0;
  table.push({ k: 0, TP: 0, FP: 0, TPR: 0, FPR: 0 });
  labels.forEach((l, i) => {
    if (l) tp++; else fp++;
    table.push({ k: i + 1, TP: tp, FP: fp, TPR: P ? tp / P : 0, FPR: N ? fp / N : 0 });
  });
  // AUC by pairs: for every negative, count positives ranked above it
  let good = 0, seenPos = 0;
  for (const l of labels) { if (l) seenPos++; else good += seenPos; }
  const corners = table.filter((r, i) => {
    if (i === 0 || i === table.length - 1) return true;
    const a = table[i - 1], b = table[i + 1];
    return !((a.TPR === r.TPR && r.TPR === b.TPR) || (a.FPR === r.FPR && r.FPR === b.FPR));
  }).map((r) => [r.FPR, r.TPR]);
  return { P, N, table, goodPairs: good, pairs: P * N, auc: P * N ? good / (P * N) : NaN, corners };
}

export function regressionMetrics(y, yhat) {
  const e = y.map((t, i) => t - yhat[i]);
  const mse = mean(e.map((x) => x * x));
  const ybar = mean(y);
  const sst = sum(y.map((t) => (t - ybar) ** 2));
  const sseV = sum(e.map((x) => x * x));
  return { errors: e, mse, rmse: Math.sqrt(mse), mae: mean(e.map(Math.abs)), ybar, sst, sse: sseV, r2: sst ? 1 - sseV / sst : NaN };
}

// ---------------------------------------------------------------- PCA in 2-D
export function pca2(points) {
  const n = points.length;
  const m1 = mean(points.map((p) => p[0])), m2 = mean(points.map((p) => p[1]));
  const c = points.map(([a, b]) => [a - m1, b - m2]);
  const s11 = sum(c.map((p) => p[0] * p[0])) / (n - 1);
  const s22 = sum(c.map((p) => p[1] * p[1])) / (n - 1);
  const s12 = sum(c.map((p) => p[0] * p[1])) / (n - 1);
  const tr = s11 + s22, det = s11 * s22 - s12 * s12;
  const disc = Math.sqrt(Math.max(0, (tr * tr) / 4 - det));
  const l1 = tr / 2 + disc, l2 = tr / 2 - disc;
  let v = Math.abs(s12) > 1e-12 ? [l1 - s22, s12] : s11 >= s22 ? [1, 0] : [0, 1];
  const nv = Math.hypot(...v);
  v = v.map((x) => x / nv);
  if (v[0] < 0 || (v[0] === 0 && v[1] < 0)) v = v.map((x) => -x);
  const scores = c.map((p) => p[0] * v[0] + p[1] * v[1]);
  return { mean: [m1, m2], centered: c, cov: [[s11, s12], [s12, s22]], trace: tr, det, eig: [l1, l2], pc1: v, ratio: tr ? l1 / tr : NaN, scores };
}

// ---------------------------------------------------------------- kNN
export const dist = {
  euclid2: (a, b) => sum(a.map((x, i) => (x - b[i]) ** 2)),
  euclid: (a, b) => Math.sqrt(dist.euclid2(a, b)),
  manhattan: (a, b) => sum(a.map((x, i) => Math.abs(x - b[i]))),
  hamming: (a, b) => a.filter((x, i) => x !== b[i]).length,
  cosine: (a, b) => 1 - sum(a.map((x, i) => x * b[i])) / (Math.hypot(...a) * Math.hypot(...b)),
};
/**
 * Rank training points by distance to q; stable on ties (input order), like a paper solution that names the tie.
 * points: [{x:[..], y, name}]
 */
export function knnRank(points, q, metric = "euclid2") {
  return points.map((p, i) => ({ ...p, i, d: dist[metric](p.x, q) })).sort((a, b) => a.d - b.d || a.i - b.i);
}
export function knnVote(ranked, k, { weighted = false } = {}) {
  const top = ranked.slice(0, k);
  const votes = new Map();
  for (const p of top) votes.set(p.y, (votes.get(p.y) || 0) + (weighted ? (p.d === 0 ? Infinity : 1 / p.d) : 1));
  const sorted = [...votes.entries()].sort((a, b) => b[1] - a[1]);
  const tie = sorted.length > 1 && sorted[0][1] === sorted[1][1];
  // a tie at the k-th place: the next point is just as far as the k-th
  const boundaryTie = ranked.length > k && k > 0 && Math.abs(ranked[k].d - ranked[k - 1].d) < 1e-12;
  return { top, votes: Object.fromEntries(votes), label: sorted[0]?.[0], tie, boundaryTie };
}
/** Leave-one-out accuracy for a list of k values. */
export function loo(points, ks, metric = "euclid2") {
  return ks.map((k) => {
    const rows = points.map((p, i) => {
      const rest = points.filter((_, j) => j !== i);
      const r = knnRank(rest, p.x, metric);
      const v = knnVote(r, k);
      return { name: p.name, y: p.y, pred: v.label, ok: v.label === p.y, top: v.top };
    });
    return { k, rows, acc: rows.filter((r) => r.ok).length / rows.length };
  });
}

// ---------------------------------------------------------------- linear models
export function leastSquares1(x, y) {
  const xb = mean(x), yb = mean(y);
  const sxy = sum(x.map((xi, i) => (xi - xb) * (y[i] - yb)));
  const sxx = sum(x.map((xi) => (xi - xb) ** 2));
  const w1 = sxy / sxx, w0 = yb - w1 * xb;
  const pred = x.map((xi) => w0 + w1 * xi);
  const r = regressionMetrics(y, pred);
  return { xbar: xb, ybar: yb, sxy, sxx, w0, w1, pred, residuals: r.errors, mse: r.mse, r2: r.r2, sst: r.sst, sse: r.sse };
}
/** Gradient descent on L(w) = (1/n) Σ (w x - y)² (no bias), as in the practice sheet. */
export function gdNoBias(points, w0, eta, steps) {
  const n = points.length;
  const out = [];
  let w = w0;
  const loss = (w) => mean(points.map(([x, y]) => (w * x - y) ** 2));
  for (let s = 0; s < steps; s++) {
    const g = (2 / n) * sum(points.map(([x, y]) => (w * x - y) * x));
    const nw = w - eta * g;
    out.push({ step: s + 1, w, loss: loss(w), grad: g, next: nw });
    w = nw;
  }
  return { steps: out, w, loss: loss(w) };
}
export function logLoss(p, y) { const e = 1e-15; p = Math.min(1 - e, Math.max(e, p)); return -(y * Math.log(p) + (1 - y) * Math.log(1 - p)); }
/** One gradient step of logistic regression on one example (y in {0,1}). */
export function logisticStep(w, b, x, y, eta) {
  const z = sum(w.map((wi, i) => wi * x[i])) + b;
  const p = sigmoid(z);
  const gw = x.map((xi) => (p - y) * xi), gb = p - y;
  const nw = w.map((wi, i) => wi - eta * gw[i]), nb = b - eta * gb;
  const z2 = sum(nw.map((wi, i) => wi * x[i])) + nb;
  const p2 = sigmoid(z2);
  return { z, p, loss: logLoss(p, y), gw, gb, w: nw, b: nb, z2, p2, loss2: logLoss(p2, y) };
}
export function softmax(z) {
  const m = Math.max(...z);
  const e = z.map((v) => Math.exp(v - m));
  const s = sum(e);
  return e.map((v) => v / s);
}

/**
 * Perceptron, labels in {-1,+1}: predict +1 when w·x + b >= 0 (the course convention); on a mistake
 * w <- w + eta y x, b <- b + eta y. Runs `epochs` passes or until a pass makes no mistake.
 */
export function perceptron(data, w0, b0, eta, { epochs = 1, stopWhenClean = true } = {}) {
  let w = [...w0], b = b0;
  const passes = [];
  for (let e = 0; e < epochs; e++) {
    const steps = [];
    let mistakes = 0;
    for (const [i, { x, y }] of data.entries()) {
      const z = sum(w.map((wi, j) => wi * x[j])) + b;
      const pred = z >= 0 ? 1 : -1;
      const wrong = pred !== y;
      if (wrong) {
        mistakes++;
        w = w.map((wi, j) => wi + eta * y * x[j]);
        b = b + eta * y;
      }
      steps.push({ i, x, y, z, pred, wrong, w: [...w], b });
    }
    passes.push({ epoch: e + 1, steps, mistakes, w: [...w], b });
    if (stopWhenClean && mistakes === 0) break;
  }
  const evalRows = data.map(({ x, y }) => { const z = sum(w.map((wi, j) => wi * x[j])) + b; return { x, y, z, pred: z >= 0 ? 1 : -1 }; });
  return { passes, w, b, evalRows, converged: passes.at(-1).mistakes === 0 };
}

// ---------------------------------------------------------------- ensembles
export function binom(n, k) { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return r; }
/** Error of a majority vote of n independent classifiers, each with accuracy p (n odd). */
export function majorityError(n, p) {
  let e = 0;
  for (let k = Math.floor(n / 2) + 1; k <= n; k++) e += binom(n, k) * (1 - p) ** k * p ** (n - k);
  return e;
}
export const bootstrapOut = (n) => (1 - 1 / n) ** n;

/** One AdaBoost round: weights w (sum 1), labels y and predictions h in {-1,+1}. */
export function adaboostRound(w, y, h) {
  const wrong = y.map((t, i) => t !== h[i]);
  const eps = sum(w.filter((_, i) => wrong[i]));
  const alpha = 0.5 * Math.log((1 - eps) / eps);
  const unnorm = w.map((wi, i) => wi * Math.exp(wrong[i] ? alpha : -alpha));
  const Z = sum(unnorm);
  return { wrong, eps, alpha, unnorm, Z, next: unnorm.map((u) => u / Z), factorWrong: 1 / (2 * eps), factorRight: 1 / (2 * (1 - eps)) };
}
/**
 * AdaBoost with a fixed pool of candidate stumps (each a function x -> ±1 with a name); picks the smallest weighted error
 * each round (ties: the first in the pool).
 */
export function adaboost(X, y, pool, rounds) {
  let w = X.map(() => 1 / X.length);
  const out = [];
  for (let t = 0; t < rounds; t++) {
    const cands = pool.map((s) => { const h = X.map(s.f); return { name: s.name, h, eps: sum(w.filter((_, i) => h[i] !== y[i])) }; });
    let best = cands[0];
    for (const c of cands) if (c.eps < best.eps - 1e-12) best = c;
    if (best.eps <= 1e-12 || best.eps >= 0.5) { out.push({ t: t + 1, w, cands, best, stop: true }); break; }
    const r = adaboostRound(w, y, best.h);
    out.push({ t: t + 1, w, cands, best, ...r });
    w = r.next;
  }
  const H = (i) => sum(out.filter((r) => !r.stop).map((r) => r.alpha * r.best.h[i]));
  return { rounds: out, score: X.map((_, i) => H(i)) };
}
/** Gradient boosting for squared loss in 1-D with a fixed stump threshold (or the best one per round). */
export function gradientBoost(x, y, eta, rounds, threshold) {
  let F = x.map(() => mean(y));
  const out = [{ round: 0, F: [...F], mse: mean(y.map((t, i) => (t - F[i]) ** 2)) }];
  for (let r = 1; r <= rounds; r++) {
    const res = y.map((t, i) => t - F[i]);
    let t = threshold;
    if (t === undefined) {
      const s = regressionSplits(x, res).rows;
      t = s.reduce((a, b) => (b.total < a.total ? b : a)).t;
    }
    const L = res.filter((_, i) => x[i] <= t), R = res.filter((_, i) => x[i] > t);
    const lm = L.length ? mean(L) : 0, rm = R.length ? mean(R) : 0;
    const f = x.map((xi) => (xi <= t ? lm : rm));
    F = F.map((v, i) => v + eta * f[i]);
    out.push({ round: r, residuals: res, t, leftMean: lm, rightMean: rm, F: [...F], mse: mean(y.map((tv, i) => (tv - F[i]) ** 2)) });
  }
  return out;
}

// ---------------------------------------------------------------- SVM
export const dot = (a, b) => sum(a.map((x, i) => x * b[i]));
export const norm = (a) => Math.sqrt(dot(a, a));
export function svmPoint(w, b, x, y) {
  const f = dot(w, x) + b;
  const yf = y === undefined ? undefined : y * f;
  const hinge = y === undefined ? undefined : Math.max(0, 1 - yf);
  let where = "";
  if (y !== undefined) {
    if (yf > 1 + 1e-9) where = "sokağın dışında";
    else if (Math.abs(yf - 1) <= 1e-9) where = "sokağın kenarında";
    else if (yf > 1e-9) where = "sokağın içinde (doğru taraf)";
    else if (Math.abs(yf) <= 1e-9) where = "tam sınırda";
    else where = "yanlış tarafta";
  }
  return { f, yf, hinge, distance: Math.abs(f) / norm(w), where };
}
export function softObjective(w, b, pts, C) {
  const slacks = pts.map((p) => Math.max(0, 1 - p.y * (dot(w, p.x) + b)));
  return { slacks, half: 0.5 * dot(w, w), sumXi: sum(slacks), J: 0.5 * dot(w, w) + C * sum(slacks) };
}
/**
 * Hard-margin linear SVM for small 2-D data sets by enumeration: in 2-D the optimum is fixed by 2 support vectors (one per
 * class, w along their difference) or 3 (two on one side: w perpendicular to their segment). Every candidate that satisfies
 * all constraints is feasible; the one with the smallest ||w|| is the maximum-margin separator. Returns null if no line
 * separates the classes.
 */
export function hardMarginSVM(pts) {
  const pos = pts.filter((p) => p.y === 1), neg = pts.filter((p) => p.y === -1);
  const cands = [];
  const feasible = (w, b) => pts.every((p) => p.y * (dot(w, p.x) + b) >= 1 - 1e-9);
  for (const a of pos) for (const c of neg) {
    const d = [a.x[0] - c.x[0], a.x[1] - c.x[1]];
    const dd = dot(d, d);
    if (!dd) continue;
    const w = d.map((v) => (2 * v) / dd);
    const b = 1 - dot(w, a.x);
    cands.push({ w, b, sv: [a, c] });
  }
  const triples = (A, B) => {
    for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) for (const c of B) {
      const a = A[i], a2 = A[j];
      const n = [-(a2.x[1] - a.x[1]), a2.x[0] - a.x[0]];
      const den = dot(n, [a.x[0] - c.x[0], a.x[1] - c.x[1]]);
      if (Math.abs(den) < 1e-12) continue;
      const t = (a.y - c.y) / den;
      const w = n.map((v) => t * v);
      const b = a.y - dot(w, a.x);
      cands.push({ w, b, sv: [a, a2, c] });
    }
  };
  triples(pos, neg);
  triples(neg, pos);
  let best = null;
  for (const c of cands) if (feasible(c.w, c.b) && (!best || norm(c.w) < norm(best.w) - 1e-9)) best = c;
  if (!best) return null;
  const sv = pts.filter((p) => Math.abs(p.y * (dot(best.w, p.x) + best.b) - 1) < 1e-7);
  return { w: best.w, b: best.b, norm: norm(best.w), margin: 1 / norm(best.w), width: 2 / norm(best.w), sv };
}
/**
 * Dual coefficients α for the support vectors of a hard-margin solution: w = Σ α_i y_i x_i, Σ α_i y_i = 0, α >= 0.
 * Solved as a small least-squares system; with 3 support vectors in 2-D it is exact.
 */
export function svmAlphas(w, sv) {
  const m = sv.length;
  // rows: two components of w, then the sum constraint
  const A = [sv.map((p) => p.y * p.x[0]), sv.map((p) => p.y * p.x[1]), sv.map((p) => p.y)];
  const rhs = [w[0], w[1], 0];
  // normal equations (A^T A) a = A^T rhs
  const AtA = Array.from({ length: m }, (_, i) => Array.from({ length: m }, (_, j) => sum(A.map((r) => r[i] * r[j]))));
  const Atb = Array.from({ length: m }, (_, i) => sum(A.map((r, k) => r[i] * rhs[k])));
  return solve(AtA, Atb);
}
export function solve(M, v) {
  const n = v.length;
  const A = M.map((r, i) => [...r, v[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    if (Math.abs(A[p][c]) < 1e-12) return null;
    [A[c], A[p]] = [A[p], A[c]];
    for (let r = 0; r < n; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k <= n; k++) A[r][k] -= f * A[c][k]; }
  }
  return A.map((r, i) => r[n] / r[i]);
}
export const kernels = {
  linear: (x, z) => dot(x, z),
  poly: (x, z, { d = 2, gamma = 1, r = 0 } = {}) => (gamma * dot(x, z) + r) ** d,
  rbf: (x, z, { gamma = 1 } = {}) => Math.exp(-gamma * sum(x.map((v, i) => (v - z[i]) ** 2))),
};

// ---------------------------------------------------------------- neural networks
export const act = {
  relu: { f: (z) => Math.max(0, z), d: (z) => (z > 0 ? 1 : 0), name: "ReLU" },
  sigmoid: { f: sigmoid, d: (z) => sigmoid(z) * (1 - sigmoid(z)), name: "sigmoid" },
  tanh: { f: Math.tanh, d: (z) => 1 - Math.tanh(z) ** 2, name: "tanh" },
  linear: { f: (z) => z, d: () => 1, name: "doğrusal" },
  step: { f: (z) => (z > 0 ? 1 : 0), d: () => 0, name: "step" },
  sign: { f: (z) => (z > 0 ? 1 : -1), d: () => 0, name: "sign" },
};
/**
 * 2-2-1 network: hidden h_j = g(W_j·x + b_j), output ŷ = σ(v·h + c), binary cross-entropy. Forward pass, all gradients
 * (backpropagation by the delta rule) and one gradient step with learning rate eta.
 */
export function mlp221({ W, b, v, c, x, y, hidden = "relu", eta = 0.1 }) {
  const g = act[hidden];
  const z = W.map((row, j) => dot(row, x) + b[j]);
  const hv = z.map(g.f);
  const u = dot(v, hv) + c;
  const yhat = sigmoid(u);
  const loss = logLoss(yhat, y);
  const dOut = yhat - y;
  const dv = hv.map((hj) => dOut * hj), dc = dOut;
  const delta = z.map((zj, j) => dOut * v[j] * g.d(zj));
  const dW = delta.map((dj) => x.map((xi) => dj * xi)), db = delta;
  return {
    z, h: hv, u, yhat, loss, dOut, dv, dc, delta, dW, db,
    next: {
      W: W.map((row, j) => row.map((wji, i) => wji - eta * dW[j][i])), b: b.map((bj, j) => bj - eta * db[j]),
      v: v.map((vj, j) => vj - eta * dv[j]), c: c - eta * dc,
    },
  };
}

/**
 * Boolean formula -> step-activation MLP (one hidden unit per AND-term, output = OR), the course's design recipe.
 * term: list of literals {i, neg}. A unit fires (step(z) = 1 iff z > 0) when all its literals hold:
 *   weight +1 for x_i, -1 for ¬x_i, bias = -(number of positive literals) + 0.5.
 * Output OR of m units: weights 1, bias -0.5. A single literal term can feed the output directly but is kept as a unit
 * here for uniformity.
 */
export function dnfToMLP(terms, nVars) {
  const units = terms.map((t) => {
    const w = Array(nVars).fill(0);
    for (const l of t) w[l.i] = l.neg ? -1 : 1;
    const bias = -t.filter((l) => !l.neg).length + 0.5;
    return { w, bias, term: t };
  });
  return { units, out: { w: units.map(() => 1), bias: -0.5 } };
}
export function evalMLP(net, x) {
  const h = net.units.map((u) => (dot(u.w, x) + u.bias > 0 ? 1 : 0));
  return { h, y: dot(net.out.w, h) + net.out.bias > 0 ? 1 : 0 };
}
export function allBinary(n) { return Array.from({ length: 2 ** n }, (_, k) => Array.from({ length: n }, (_, i) => (k >> (n - 1 - i)) & 1)); }

// ---------------------------------------------------------------- CNN arithmetic (week 9)
export const convOut = (n, k, p, s) => Math.floor((n + 2 * p - k) / s) + 1;
export function conv2d(img, ker, { pad = 0, stride = [1, 1] } = {}) {
  const H = img.length, Wd = img[0].length, kh = ker.length, kw = ker[0].length;
  const P = Array.isArray(pad) ? pad : [pad, pad];
  const S = Array.isArray(stride) ? stride : [stride, stride];
  const at = (r, c) => (r < 0 || c < 0 || r >= H || c >= Wd ? 0 : img[r][c]);
  const oh = convOut(H, kh, P[0], S[0]), ow = convOut(Wd, kw, P[1], S[1]);
  const out = [];
  for (let i = 0; i < oh; i++) {
    const row = [];
    for (let j = 0; j < ow; j++) {
      let s = 0;
      for (let a = 0; a < kh; a++) for (let b2 = 0; b2 < kw; b2++) s += ker[a][b2] * at(i * S[0] - P[0] + a, j * S[1] - P[1] + b2);
      row.push(s);
    }
    out.push(row);
  }
  return out;
}
export function convLayer({ inH, inW, inC, filters, kh, kw, stride = [1, 1], pad = [0, 0] }) {
  const oh = convOut(inH, kh, pad[0], stride[0]), ow = convOut(inW, kw, pad[1], stride[1]);
  return { oh, ow, oc: filters, weights: filters * kh * kw * inC, biases: filters };
}
