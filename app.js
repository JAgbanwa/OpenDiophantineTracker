const SOURCE = {
  paperTitle: "A systematic approach to Diophantine equations: open problems",
  author: "Bogdan Grechuk",
  arxivId: "2404.08518",
  version: "v8",
  lastRevised: "13 Jul 2026",
  retrieved: "14 Jul 2026",
};

const problemDefinitions = {
  P1: {
    short: "Polynomial parametrization",
    full: "Determine whether the integer solution set is a finite union of polynomial families.",
  },
  D1: {
    short: "Describe all solutions",
    full: "Describe all integer or rational solutions in a reasonable explicit way.",
  },
  P2: {
    short: "Arbitrarily large integer solutions",
    full: "Determine whether solutions exist with min(|x_i|) >= k for every k, or describe all integer solutions.",
  },
  P3: {
    short: "Homogeneous nonzero solution",
    full: "For homogeneous equations, decide whether there is an integer solution with all variables nonzero.",
  },
  P4: {
    short: "Finiteness problem",
    full: "Either list all integer solutions or prove that infinitely many exist.",
  },
  P5: {
    short: "Homogeneous nontrivial solution",
    full: "For homogeneous equations, decide whether there is a nonzero integer solution.",
  },
  P6: {
    short: "Integer-solution existence",
    full: "Hilbert tenth style question: determine whether the equation has an integer solution.",
  },
  P7: {
    short: "Positive integer existence",
    full: "Determine whether the equation has a solution in positive integers.",
  },
  Fermat: {
    short: "Primitive Fermat-type solutions",
    full: "List all primitive solutions of ax^p + by^q + cz^r = 0 with 1/p + 1/q + 1/r < 1.",
  },
};

function metricValue(metric) {
  return Number.parseFloat(String(metric).replace(/[^\d.]/g, "")) || 0;
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function rows(source, problem, category, metricType, rawRows, tags = [], note = "", extra = {}) {
  return rawRows.map((item, index) => {
    const [metric, equation, localNote = "", localTags = []] = item;
    return {
      id: `${slug(source)}-${index + 1}`,
      source,
      problem,
      category,
      metricType,
      metric,
      equation,
      note: localNote || note,
      tags: [...tags, ...localTags],
      baseStatus: "open",
      links: extra.links || [],
      addedIn: SOURCE.version,
    };
  });
}

function single(id, source, problem, category, metricType, metric, equation, tags, note, links = []) {
  return {
    id,
    source,
    problem,
    category,
    metricType,
    metric,
    equation,
    tags,
    note,
    baseStatus: "open",
    links,
    addedIn: SOURCE.version,
  };
}

const currentOpen = [
  ...rows("Table 1", "P1", "Polynomial parametrization", "H", [
    [13, "xyz+t^2+1=0"],
    [13, "x^3+yz+1=0"],
    [13, "xyz+t^2-1=0"],
    [13, "xyz+ts+1=0"],
  ], ["parametrization", "integer-solutions"], "Existence of a finite union of polynomial families is unknown."),

  ...rows("Rational equations (3)-(5)", "D1", "Rational solution description", "H", [
    [17, "y^2+z^2=x^3+1"],
    [17, "y^2+z^2=x^3-1"],
    [17, "y^2-x^2y+z^2+1=0"],
  ], ["rational-points", "cubic-surface"], "The rational points are known to be unirational, but an explicit description of all rational points remains open.", {
    links: ["https://mathoverflow.net/questions/452461/"],
  }),

  single("narrative-cyclic-25", "Section 3", "D1", "Cyclic equation", "H", 25, "x^2y+y^2z+z^2x=1", ["cyclic", "finiteness-unknown"], "Smallest open non-symmetric cyclic equation; even finiteness of the integer solution set is unknown."),
  single("narrative-symmetric-26", "Section 3", "D1", "Symmetric equation", "H", 26, "x^3+y^3+z^3=2", ["symmetric", "integer-solutions"], "Unknown whether there are infinitely many integer solutions beyond the stated polynomial family."),
  single("narrative-three-monomial-26a", "Equation (11a)", "D1", "Three-monomial equation", "H", 26, "y(x^3-z^2)=z", ["three-monomial", "integer-solutions"], "Reducible to x^3y^2=z^3+1; unknown whether non-obvious solutions exist."),
  single("narrative-three-monomial-26b", "Equation (11b)", "D1", "Three-monomial equation", "H", 26, "x^2y^2+x=z^3", ["three-monomial", "integer-solutions"], "Reducible to x^3y^2=z^3+1; unknown whether non-obvious solutions exist."),
  single("narrative-three-monomial-26c", "Equation (12)", "D1", "Three-monomial equation", "H", 26, "y(x^3-z^2)=x", ["three-monomial", "integer-solutions"], "Reducible to x^4y^3=z^2+/-1; unknown whether non-obvious solutions exist."),

  ...rows("Table 2", "D1", "Two-variable integer solution descriptions", "H", [
    [28, "x^4-y^3-x+y=0"],
    [30, "x^4+y^3+x+2y=0"],
    [31, "x^4+y^3+2x-y+1=0"],
    [28, "x^4-y^3+x-y=0"],
    [30, "x^4+y^3+2x-y=0"],
    [31, "x^4+y^3+2x+y+1=0"],
    [29, "x^4+y^3+xy+1=0"],
    [30, "x^4+y^3+2x+y=0"],
    [31, "x^4+y^3+2x+y-1=0"],
    [29, "x^4+y^3+xy-1=0"],
    [30, "x^4+y^3+y^2+x=0"],
    [31, "x^4+y^3+xy-y-1=0"],
    [30, "x^4+y^3-y^2+x=0"],
    [31, "x^4-y^3+xy+x+1=0"],
    [31, "x^4+y^3+xy-3=0"],
    [30, "x^4+y^3+x-2y=0"],
    [31, "x^4-y^3+xy+x-1=0"],
    [31, "x^4+y^3+xy+y-1=0"],
    [30, "x^4+y^3+x-y-2=0"],
    [31, "x^4+y^3+x-2y+1=0"],
    [31, "x^4+y^3+xy+x+1=0"],
    [30, "x^4+y^3+x+y+2=0"],
    [31, "x^4+y^3+x-2y-1=0"],
    [31, "x^4+y^3+xy+x-1=0"],
    [30, "x^4+y^3+x+y-2=0"],
    [31, "x^4+y^3+x+2y+1=0"],
  ], ["two-variable", "genus-3"], "The integer solution set is finite; the open task is to list all integer solutions."),

  single("narrative-genus2-32", "Equation (13)", "D1", "Genus 2 two-variable equation", "H", 32, "x^4-x^2+xy+y^3=0", ["two-variable", "genus-2"], "Smallest open equation of genus 2."),
  single("narrative-sym-hom-40", "Equation (14)", "D1", "Symmetric homogeneous equation", "H", 40, "x^3+y^3+z^3+t^3+s^3=0", ["symmetric", "homogeneous"], "Smallest open symmetric homogeneous equation."),
  single("narrative-cyclic-hom-40", "Equation (15)", "D1", "Cyclic homogeneous equation", "H", 40, "x^2y+y^2z+z^2t+t^2s+s^2x=0", ["cyclic", "homogeneous"], "Smallest open cyclic homogeneous equation alongside Equation (14)."),

  ...rows("Table 3", "D1", "Symmetric two-variable equations", "H", [
    [325, "x^6+x^5y+x^3y^3+xy^5+y^6+x+y+1=0"],
    [325, "x^6-x^5y-x^3y^3-xy^5+y^6+x+y-1=0"],
    [325, "x^6-x^4y^2+x^3y^3-x^2y^4+y^6+x+y+1=0"],
    [325, "x^6-x^4y^2-x^3y^3-x^2y^4+y^6+x+y-1=0"],
    [325, "x^6+3x^3y^3+y^6+x+y+1=0"],
    [325, "x^6-3x^3y^3+y^6+x+y-1=0"],
  ], ["symmetric", "two-variable"], "Smallest open symmetric two-variable equations."),

  ...rows("Table 4", "Fermat", "Primitive Fermat-type equations", "H", [
    [48, "x^4+3y^3+z^3=0"],
    [56, "2x^4-y^4+z^3=0"],
    [60, "x^5+y^4+3z^2=0"],
    [56, "x^4+3y^3+2z^3=0"],
    [56, "x^5+y^4-2z^2=0"],
    [56, "x^4+4y^3+z^3=0"],
    [60, "x^5+y^4-3z^2=0"],
  ], ["primitive", "fermat-type"], "Complete primitive-solution lists are not known."),

  ...rows("Table 5", "P2", "Arbitrarily large integer solutions", "H", [
    [22, "y^2+x^2y+z^2x-2=0"],
    [22, "z^2+y^2z+x^3-2=0"],
    [22, "z^2-xy^2-x^3-2=0"],
  ], ["large-solutions"], "Smallest equations for which Problem 2 remains open."),

  ...rows("Table 6", "P3", "Homogeneous arbitrarily large/nonzero", "H", [
    [64, "x^4+x^3y+xy^3-z^4=0"],
    [64, "x^4-y^4+x^2yz+yz^3=0"],
    [64, "x^4+xy^3+z^4+t^4=0"],
    [64, "x^4+x^2y^2+y^3z-yz^3=0"],
    [64, "x^4+y^4+x^2yz-yz^3=0"],
    [64, "x^4+y^4+z^3t-zt^3=0"],
    [64, "x^4-x^2y^2+y^3z+yz^3=0"],
    [64, "x^3z+y^3x+y^2z^2-z^3y=0"],
    [64, "x^4+x^2y^2+y^3z+z^4=0"],
    [64, "x^4-y^3z+xyz^2+xz^3=0"],
  ], ["homogeneous", "nonzero-variables"], "Open homogeneous equations for Problem 3."),

  ...rows("Table 7", "P4", "Finiteness problem", "H", [
    [22, "z^2+y^2z+x^3-2=0"],
    [23, "z^2+y^2z+x^3-3=0"],
    [24, "z^2+y^2z+x^3-x-2=0"],
    [23, "z^2+y^2z+x^3-x-1=0"],
    [23, "z^2+y^2z+x^3+3=0"],
    [24, "z^2+y^2z+x^3-x+2=0"],
  ], ["finiteness"], "Smallest equations for which the finiteness problem is open."),
  single("narrative-fin-symmetric-27", "Equation (18)", "P4", "Symmetric finiteness", "H", 27, "x^3+y^3+z^3=3", ["symmetric", "independent-monomials"], "Smallest open symmetric equation for Problem 4, and also the smallest open independent-monomial equation."),
  single("narrative-fin-independent-29", "Equation (19)", "P4", "Independent monomials", "H", 29, "x^4+y^3+z^2+1=0", ["independent-monomials"], "Next-smallest open equation with independent monomials for Problem 4."),
  single("narrative-fin-three-monomial-42", "Equation (20)", "P4", "Three-monomial finiteness", "H", 42, "x^3y^2=z^3+2", ["three-monomial", "finiteness"], "Smallest open three-monomial equation for Problem 4."),
  single("narrative-finhom-80", "Equation (21)", "P5", "Homogeneous nontrivial", "H", 80, "x^4+x^3y-y^4+y^3z+z^4=0", ["homogeneous"], "Only open homogeneous Problem 5 equation of size H<=100."),

  ...rows("Table 8", "P5", "Homogeneous independent monomials", "H", [
    [288, "11x^4+4y^4+2z^4-t^4=0"],
    [288, "7x^4+6y^4+3z^4-2t^4=0"],
    [288, "8x^4+7y^4+z^4-2t^4=0"],
    [288, "7x^4+5y^4+4z^4-2t^4=0"],
    [288, "7x^4+6y^4+4z^4-t^4=0"],
  ], ["homogeneous", "independent-monomials"], "Open equations of form a1x1^d+...+anxn^d=0."),

  ...rows("Table 9", "P6", "Two-variable integer-solution existence", "H", [
    [32, "y^3+xy=x^4+4"],
    [34, "y^3-y^2=x^4+2x+2"],
    [34, "y^3+xy-y=x^4-4"],
    [32, "y^3+xy=x^4+x+2"],
    [34, "y^3+y^2=x^4+2x-2"],
    [34, "y^3+xy=x^4+x+4"],
    [32, "y^3+y=x^4+x+4"],
    [34, "y^3-y^2+xy=x^4+2"],
    [34, "y^3+xy=x^4-x-4"],
    [32, "y^3-y=x^4+2x-2"],
    [34, "y^3+y=x^4+x+6"],
    [34, "y^3+xy=x^4+x^2+2"],
    [33, "y^3+y^2+xy=x^4+1"],
    [34, "y^3+y=x^4+x-6"],
    [34, "y^3-y^2+y=x^4+x+2"],
    [33, "y^3+xy=x^4+x+3"],
    [34, "y^3+2y=x^4+x+4"],
    [34, "y^3+y^2+y=x^4+x+2"],
    [33, "y^3+xy=x^4-x-3"],
    [34, "y^3+y=x^4+2x+4"],
    [34, "y^3+y^2-y=x^4+x+2"],
    [33, "y^3+xy=x^4+x-3"],
    [34, "y^3+y=x^4+2x-4"],
    [34, "y^3+xy-y=x^4+x+2"],
    [33, "y^3+xy+y=x^4-x+1"],
    [34, "y^3+xy+y=x^4+4"],
    [34, "y^3-y=x^4-x^2+x+2"],
    [34, "y^3+y^2=x^4+x+4"],
    [34, "y^3+xy-y=x^4+4"],
    [34, "y^3-y=x^4-x^2+x-2"],
  ], ["two-variable", "existence"], "Two-variable equations for which existence of integer solutions remains open."),

  ...rows("Table 10", "P6", "n>=3 integer-solution existence", "H", [
    [34, "6+x^3-y^2+y^2z^2=0"],
    [34, "2+x^3+xy+y^2+y^2z^2=0"],
    [34, "6+x^3+xy^2z+z^2=0"],
  ], ["n>=3", "existence"], "Smallest n>=3 equations for which Problem 6 is open."),
  single("narrative-cubic-35", "Equation (23)", "P6", "Cubic integer-solution existence", "H", 35, "y^2z+yz^2=x^3+x^2+3x-1", ["cubic", "existence"], "Smallest open cubic equation for Problem 6."),
  single("narrative-independent-36a", "Equation (24)", "P6", "Independent monomials", "H", 36, "x^4+y^3+z^3=-4", ["independent-monomials", "existence"], "Smallest open equation with independent monomials for Problem 6."),
  single("narrative-independent-36b", "Equation (25)", "P6", "Independent monomials", "H", 36, "x^4+y^3+z^3=4", ["independent-monomials", "existence"], "Smallest open equation with independent monomials for Problem 6."),
  single("narrative-sym-39", "Equation (26)", "P6", "Symmetric integer-solution existence", "H", 39, "x^3+x+y^3+y+z^3+z=xyz+1", ["symmetric", "existence"], "Smallest open symmetric equation for Problem 6."),
  single("narrative-sym-45a", "Section 6", "P6", "Symmetric and cyclic", "H", 45, "x^3+2x+y^3+2y+z^3+2z=xyz+1", ["symmetric", "cyclic", "existence"], "Next-smallest open symmetric equations; also smallest open cyclic equations."),
  single("narrative-sym-45b", "Section 6", "P6", "Symmetric and cyclic", "H", 45, "x^3-x+y^3-y+z^3-z=xyz+7", ["symmetric", "cyclic", "existence"], "Next-smallest open symmetric equations; also smallest open cyclic equations."),
  single("narrative-three-monomial-46", "Equation (27)", "P6", "Three-monomial integer-solution existence", "H", 46, "x^3y^2=z^3+6", ["three-monomial", "existence"], "Smallest three-monomial equation for which Problem 6 is open."),

  ...rows("Positive integer equations", "P7", "Positive integer existence", "H", [
    [26, "y(x^3-z^2)=z"],
    [26, "x^2y^2+x=z^3"],
    [26, "y(x^3-z^2)=x"],
  ], ["positive-integers"], "Smallest equations for which positive integer existence is open."),

  ...rows("Table 11", "P2", "Shortest by length", "l", [
    [8, "y(x^3-z^2)=x"],
    [8, "y(x^3-z^2)=x+1"],
    [8, "y(x^3-z^2)=z"],
  ], ["shortest", "length"], "Shortest equations for which Problem 2 is open."),

  ...rows("Table 12", "P4", "Shortest by length", "l", [
    [9, "z^2+y^2z+x^3-2=0"],
    [9, "y(x^3-z^2)=x^2+1"],
    [9, "x^3y^2=z^4+1"],
    [9, "z^2+y^2z+x^3-x-1=0"],
    [9, "y(x^3-z^2)=2x-1"],
    [9, "x^4y^3=z^2+1"],
    [9, "z^2+y^2z+2x^3+1=0"],
    [9, "y(x^3-z^2)=2x+1"],
    [9, "y^3-y=x^4-x"],
    [9, "z^2+y^2z+x^3y+1=0"],
    [9, "x^3y^2=z^3+2"],
    [9, "y^3+y=x^4+x"],
    [9, "x^2y+y^2z+z^2x=1"],
    [9, "x^3y^2=z^3-z+1"],
    [9, "x^4+xy+y^3-1=0"],
    [9, "x^4+y^3+z^2+1=0"],
    [9, "x^3y^2=z^3+z+1"],
    [9, "x^4+xy+y^3+1=0"],
    [9, "x^3+x^2y^2+z^2+1=0"],
    [9, "x^3y^2=2z^3+1"],
  ], ["shortest", "length"], "Shortest equations for which Problem 4 is open."),

  ...rows("Table 13", "P6", "Shortest by length", "l", [
    [10, "2y^3+xy+x^4+1=0"],
    [10, "x^3y^2=z^4+2"],
    [10.6, "x^3y^2=z^4-3"],
    [10, "y^2+x^3y+z^4+1=0"],
    [10.6, "x^3y^2=z^3+6"],
    [10.6, "x^4y^3=z^2+3"],
  ], ["shortest", "length", "existence"], "Equations of length l<11 for which Problem 6 is open."),

  ...rows("Table 14", "P6", "Shortest cubic equations", "l", [
    [13.6, "y^2z+yz^2=x^3+x^2+3x-1"],
    [13.6, "2x^3+3xy^2+z^3+z^2+1=0"],
    [13.6, "y^2z+yz^2=3x^3+x^2+x-1"],
    [13.6, "(3x-1)y^2+xz^2=x^3-2"],
    [13.6, "y^2z+yz^2=6x^3+x^2+1"],
  ], ["shortest", "cubic", "existence"], "Shortest cubic equations for which Problem 6 is open."),
];

function archived(version, date, problem, category, rawRows, resolution, tags = [], links = []) {
  return rawRows.map((equation, index) => ({
    id: `archive-${slug(version)}-${slug(equation)}-${index}`,
    source: `${version} change log`,
    problem,
    category,
    metricType: "archive",
    metric: "",
    equation,
    note: resolution,
    tags: [...tags, "archive"],
    baseStatus: "solved",
    resolvedIn: version,
    resolvedDate: date,
    links,
  }));
}

const solvedArchive = [
  ...archived("v1 to v2", "15 Oct 2024", "Fermat", "Primitive Fermat-type equations", [
    "x^4+y^4+2z^3=0",
    "x^5+y^4+2z^2=0",
  ], "Solved in the literature and excluded from the Fermat-type table.", ["literature"]),
  ...archived("v1 to v2", "15 Oct 2024", "P2", "Arbitrarily large integer solutions", [
    "2x^2-xyz-y^2-1=0",
    "2x^2-xyz+y^2+1=0",
    "y^2+xyz+x^3+2=0",
  ], "Problem 2 solved; removed from the open tables.", ["large-solutions"], ["https://mathoverflow.net/questions/449559/", "https://mathoverflow.net/questions/411958/"]),
  ...archived("v1 to v2", "15 Oct 2024", "P4", "Finiteness problem", [
    "y^2+xyz+x^3+2=0",
    "y^2+xyz+x^3-3=0",
    "y^2+xyz+x^3+4=0",
    "y^2+xyz+x^3-x-2=0",
    "y^2+xyz+y+x^3+2=0",
    "y^2+xyz+2x^3+1=0",
  ], "Problem 4 solved; removed from the open tables.", ["finiteness"], ["https://mathoverflow.net/questions/411958/", "https://mathoverflow.net/questions/466803/"]),
  ...archived("v1 to v2", "15 Oct 2024", "P6", "Shortest cubic equations", [
    "6x^2z+z^2y+3y^3+1=0",
    "y^2+10xyz+x^3-x-2=0",
    "y^2+7xyz+3x^3-2=0",
  ], "Problem 6 solved; removed from the shortest cubic list.", ["cubic", "existence"], ["https://mathoverflow.net/questions/466803/"]),

  ...archived("v2 to v3", "26 Dec 2024", "Fermat", "Primitive Fermat-type equations", [
    "2x^4+y^3+z^3=0",
    "x^4+2y^3+2z^3=0",
    "x^4-y^4+2z^3=0",
    "x^4-y^4+3z^3=0",
  ], "Solved in the literature and excluded from Table 4.", ["literature", "fermat-type"]),

  ...archived("v3 to v4", "23 Jan 2026", "P4", "Finiteness problem", [
    "x^2y^2+x^2z-z^2-1=0",
    "y^2+z^2=x^5-1",
    "y^2+2x^3y+z^2+1=0",
  ], "Problem 4 solved; removed from the length-ordered finiteness table.", ["finiteness"]),
  ...archived("v3 to v4", "23 Jan 2026", "P2", "Arbitrarily large integer solutions", [
    "7x^4-7y^4=25z^4",
  ], "Solved by Nguyen Xuan Tho and removed from Section 4.", ["homogeneous", "literature"]),

  ...archived("v4 to v5", "8 Mar 2026", "P4", "Finiteness problem", [
    "z^2+y^2z-z+x^3+2=0",
    "z^2+y^2z+x^3+x+1=0",
    "z^2+y^2z+x^3+x-1=0",
  ], "Problem 4 solved by ChatGPT 5.4 Pro; removed from Tables 7 and 12.", ["finiteness", "ai-assisted"]),
  ...archived("v4 to v5", "8 Mar 2026", "P6", "Shortest by length", [
    "3x+x^2z^2+2y^2z+1=0",
    "3x^2y+y^2z^2+2z-1=0",
  ], "Integer solutions were found; removed from Table 13.", ["existence", "large-solution"]),

  ...archived("v5 to v6", "1 Apr 2026", "P6", "Integer-solution existence", [
    "1-x+x^3+x^2y^2+z+z^2=0",
    "2+2x+x^3-y^2-xy^2+xz^2=0",
    "-2x+x^3+y^2-xy^2-xz^2+3=0",
    "-2x+x^2+x^3+y+y^3+yz^2-1=0",
  ], "Explicit integer solutions were found with the help of ChatGPT 5.4 and Eugene Go.", ["existence", "ai-assisted"]),
  ...archived("v5 to v6", "1 Apr 2026", "P6", "Shortest cubic equations", [
    "7x^3+2y^3=3z^2+1",
  ], "Proved to have no integer solutions; replaced by the new shortest cubic table.", ["cubic", "no-solutions"], ["https://arxiv.org/abs/2603.29831"]),

  ...archived("v6 to v7", "22 May 2026", "P1", "Polynomial parametrization", [
    "x^2+y^2+zt+1=0",
    "x^2+y^2+zt-1=0",
    "x^2y+zt+1=0",
    "x^2y+z^2+1=0",
    "x^2y+z^2-1=0",
  ], "Solution sets are finite unions of polynomial families.", ["parametrization"]),
  ...archived("v6 to v7", "22 May 2026", "D1", "Two-variable integer solution descriptions", [
    "x^4-y^3+xy+x=0",
    "x^4+y^3+xy-y=0",
    "x^4+y^3+xy+y=0",
    "x^4+y^3+xy+x=0",
  ], "Solvable by elementary methods; removed from Table 2.", ["two-variable"]),
  ...archived("v6 to v7", "22 May 2026", "P2", "Shortest by length", [
    "x^2y^2+xz^2+y+1=0",
    "x^2y^2+xz^2+y-1=0",
  ], "Problem 2 solved by Pell-type families.", ["large-solutions"]),

  ...archived("v7 to v8", "13 Jul 2026", "D1", "Describe all solutions", [
    "x^3+y^3+z^3=1",
    "x^2y^2+xz^2+z=0",
    "x^2y^2+xz^2+y=0",
    "x^3y^2=z^2+1",
    "x^3y^2=z^2-1",
  ], "Integer solution descriptions are now considered reasonable; removed from Section 3.", ["integer-solutions"]),
  ...archived("v7 to v8", "13 Jul 2026", "Fermat", "Primitive Fermat-type equations", [
    "x^4+2y^3+z^3=0",
    "x^5+2y^3+z^3=0",
  ], "Reduced to equations already solved in the literature; removed from Table 4.", ["fermat-type", "literature"], ["https://mathoverflow.net/questions/484736/"]),
  ...archived("v7 to v8", "13 Jul 2026", "P2", "Arbitrarily large integer solutions", [
    "y^2+x^2y+z^2x+1=0",
    "y^2+x^2y+z^2x+2=0",
    "z^2-xy^2-x^3+2=0",
    "x^3y^2+z^2+y+1=0",
    "y(x^3-z^2)=z+1",
    "y(x^3-z^2)=x-1",
  ], "Parametric or congruence families solve Problem 2 for these equations.", ["large-solutions", "ai-assisted"], ["https://mathoverflow.net/questions/449781/", "https://mathoverflow.net/questions/450943/"]),
  ...archived("v7 to v8", "13 Jul 2026", "P5", "Homogeneous nontrivial", [
    "x^3+2x^2y+y^3+y^2z+xz^2+z^3+t^2x-t^2y-t^2z+tyz+t^3=0",
    "2x^3+x^2y+xy^2+y^3+y^2z-2xz^2-z^3+t^2y+tz^2-t^3=0",
    "2x^3+2x^2y+2y^3+y^2z-2xz^2-z^3+tz^2-t^3=0",
    "8x^4+7y^4+2z^4-t^4=0",
    "14x^5+5y^5+3z^5=0",
    "17x^5+6y^5+3z^5=0",
    "14x^5+13y^5+2z^5=0",
    "21x^5+5y^5+4z^5=0",
    "17x^5+9y^5+5z^5=0",
    "4x^5+4y^5+11z^5=0",
  ], "No nonzero or qualifying integer solutions; removed from homogeneous sections and tables.", ["homogeneous", "no-solutions", "ai-assisted"]),
  ...archived("v7 to v8", "13 Jul 2026", "P4", "Finiteness problem", [
    "y^2+x^3y+z^2+1=0",
    "y^2+x^3y+z^2-2=0",
    "y^2+x^3y+z^2+z-1=0",
    "y^2+x^3y+z^2+z+1=0",
    "y^2+x^3y+y+z^2+1=0",
  ], "Infinitely many integer solutions are known; removed from Tables 11 and 12.", ["finiteness"], ["https://mathoverflow.net/questions/454040/", "https://arxiv.org/abs/2607.06627"]),
];

const updateEvents = [
  {
    version: "v1 to v2",
    date: "15 Oct 2024",
    headline: "First large batch of removals after the book baseline.",
    bullets: [
      "Solved Fermat-type cases left the primitive-solution table.",
      "Problem 2, Problem 4, and shortest cubic Problem 6 entries were removed after solutions or references were identified.",
    ],
  },
  {
    version: "v2 to v3",
    date: "26 Dec 2024",
    headline: "More Fermat-type equations excluded.",
    bullets: [
      "Four equations of Table 4 were solved in the literature.",
      "One equivalent equation was removed as duplicate coverage.",
    ],
  },
  {
    version: "v3 to v4",
    date: "23 Jan 2026",
    headline: "Finiteness and homogeneous removals.",
    bullets: [
      "Three Problem 4 entries were solved or covered by a simple argument.",
      "7x^4-7y^4=25z^4 was solved by Nguyen Xuan Tho.",
    ],
  },
  {
    version: "v4 to v5",
    date: "8 Mar 2026",
    headline: "AI-assisted solutions and explicit witnesses.",
    bullets: [
      "Three finiteness entries were removed after ChatGPT 5.4 Pro solutions.",
      "Two shortest-existence equations were removed after explicit integer solutions were found.",
    ],
  },
  {
    version: "v5 to v6",
    date: "1 Apr 2026",
    headline: "Smallest n>=3 and cubic existence entries moved.",
    bullets: [
      "Eugene Go and ChatGPT 5.4 found large integer solutions for several Problem 6 entries.",
      "7x^3+2y^3=3z^2+1 was proved insoluble and Table 14 was added.",
    ],
  },
  {
    version: "v6 to v7",
    date: "22 May 2026",
    headline: "Parametrization and elementary two-variable updates.",
    bullets: [
      "Five polynomial-parametrization equations were removed.",
      "Four Table 2 equations were classified as elementary.",
      "Two length-8 Problem 2 equations were solved by Pell-type families.",
    ],
  },
  {
    version: "v7 to v8",
    date: "13 Jul 2026",
    headline: "Large v8 refresh with rational-only remnants.",
    bullets: [
      "y^2+z^2=x^3+/-1 now only remain open for rational solution descriptions.",
      "Several description, Fermat-type, large-solution, homogeneous, and finiteness entries were removed.",
      "The current seed data in this site reflects the v8 tables and narrative list.",
    ],
  },
];

const STORAGE_KEY = "open-diophantine-tracker-state";
let viewStatus = "open";
let selectedId = "";
let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { overrides: {}, notes: {}, custom: [] };
    }
    const parsed = JSON.parse(raw);
    return {
      overrides: parsed.overrides || {},
      notes: parsed.notes || {},
      custom: parsed.custom || [],
    };
  } catch {
    return { overrides: {}, notes: {}, custom: [] };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state, null, 2));
}

function allEntries() {
  const customEntries = state.custom.map((entry, index) => ({
    id: entry.id || `custom-${index}`,
    source: entry.source || "Local curator",
    problem: entry.problem || "D1",
    category: entry.category || "Local review",
    metricType: "local",
    metric: "",
    equation: entry.equation,
    note: entry.note || "Local entry awaiting review.",
    tags: [...(entry.tags || []), "local"],
    baseStatus: entry.status || "watching",
    links: entry.link ? [entry.link] : [],
    addedIn: "local",
  }));

  return [...currentOpen, ...solvedArchive, ...customEntries].map((entry) => ({
    ...entry,
    status: state.overrides[entry.id] || entry.baseStatus,
    curatorNote: state.notes[entry.id] || "",
  }));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatEquation(equation) {
  return escapeHtml(equation)
    .replace(/\^(\d+(?:\.\d+)?)/g, "<sup>$1</sup>")
    .replace(/\+\/-/g, "+/-");
}

function statusLabel(status) {
  const labels = {
    open: "Open",
    solved: "Solved",
    partial: "Partial",
    watching: "Watching",
  };
  return labels[status] || status;
}

function problemName(problem) {
  return problemDefinitions[problem]?.short || problem;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
}

function getFilters() {
  return {
    search: document.querySelector("#searchInput").value.trim().toLowerCase(),
    problem: document.querySelector("#problemFilter").value,
    source: document.querySelector("#sourceFilter").value,
    tag: document.querySelector("#tagFilter").value,
    sort: document.querySelector("#sortSelect").value,
  };
}

function filteredEntries() {
  const filters = getFilters();
  let entries = allEntries();

  if (viewStatus !== "all") {
    entries = entries.filter((entry) => entry.status === viewStatus);
  }

  if (filters.problem !== "all") {
    entries = entries.filter((entry) => entry.problem === filters.problem);
  }

  if (filters.source !== "all") {
    entries = entries.filter((entry) => entry.source === filters.source);
  }

  if (filters.tag !== "all") {
    entries = entries.filter((entry) => entry.tags.includes(filters.tag));
  }

  if (filters.search) {
    entries = entries.filter((entry) => {
      const haystack = [
        entry.equation,
        entry.source,
        entry.problem,
        entry.category,
        entry.note,
        entry.curatorNote,
        ...entry.tags,
      ].join(" ").toLowerCase();
      return haystack.includes(filters.search);
    });
  }

  entries.sort((a, b) => {
    if (filters.sort === "problem") {
      return problemName(a.problem).localeCompare(problemName(b.problem)) || metricValue(a.metric) - metricValue(b.metric);
    }
    if (filters.sort === "source") {
      return a.source.localeCompare(b.source) || metricValue(a.metric) - metricValue(b.metric);
    }
    if (filters.sort === "status") {
      return a.status.localeCompare(b.status) || metricValue(a.metric) - metricValue(b.metric);
    }
    return metricValue(a.metric) - metricValue(b.metric) || a.equation.localeCompare(b.equation);
  });

  return entries;
}

function setSelectOptions(selector, options, formatter = (value) => value) {
  const select = document.querySelector(selector);
  select.innerHTML = [
    `<option value="all">All</option>`,
    ...options.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(formatter(value))}</option>`),
  ].join("");
}

function initFilters() {
  const entries = allEntries();
  setSelectOptions("#problemFilter", unique(entries.map((entry) => entry.problem)), problemName);
  setSelectOptions("#sourceFilter", unique(entries.map((entry) => entry.source)));
  setSelectOptions("#tagFilter", unique(entries.flatMap((entry) => entry.tags)));

  const newProblem = document.querySelector("#newProblem");
  newProblem.innerHTML = Object.keys(problemDefinitions)
    .map((key) => `<option value="${key}">${escapeHtml(problemName(key))}</option>`)
    .join("");
}

function renderStats() {
  const entries = allEntries();
  const currentOpenCount = entries.filter((entry) => entry.status === "open" && !entry.id.startsWith("archive-")).length;
  const solvedCount = entries.filter((entry) => entry.status === "solved").length;
  const localEdits = Object.keys(state.overrides).length + Object.keys(state.notes).length + state.custom.length;
  const openH = entries
    .filter((entry) => entry.status === "open" && entry.metricType === "H")
    .map((entry) => metricValue(entry.metric))
    .filter(Boolean);

  document.querySelector("#statOpen").textContent = currentOpenCount;
  document.querySelector("#statSolved").textContent = solvedCount;
  document.querySelector("#statSmallestH").textContent = openH.length ? Math.min(...openH) : "n/a";
  document.querySelector("#statLocal").textContent = localEdits;
}

function groupedByProblem(entries) {
  const groups = {};
  entries.forEach((entry) => {
    const key = entry.problem;
    if (!groups[key]) {
      groups[key] = { open: 0, solved: 0, partial: 0, watching: 0, total: 0 };
    }
    groups[key][entry.status] = (groups[key][entry.status] || 0) + 1;
    groups[key].total += 1;
  });
  return groups;
}

function renderProgress() {
  const entries = allEntries();
  const groups = groupedByProblem(entries);
  const maxTotal = Math.max(...Object.values(groups).map((group) => group.total), 1);

  document.querySelector("#progressChart").innerHTML = Object.entries(groups)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([problem, group]) => {
      const totalWidth = (group.total / maxTotal) * 100;
      const openWidth = group.total ? (group.open / group.total) * totalWidth : 0;
      const solvedWidth = group.total ? (group.solved / group.total) * totalWidth : 0;
      const partialWidth = group.total ? (group.partial / group.total) * totalWidth : 0;
      const watchingWidth = Math.max(totalWidth - openWidth - solvedWidth - partialWidth, 0);
      const solvedLeft = openWidth;
      const partialLeft = openWidth + solvedWidth;
      const watchingLeft = openWidth + solvedWidth + partialWidth;
      return `
        <div class="chart-row">
          <span class="chart-label" title="${escapeHtml(problemDefinitions[problem]?.full || problem)}">${escapeHtml(problemName(problem))}</span>
          <div class="chart-track" aria-hidden="true">
            <span class="chart-open" style="width:${openWidth}%"></span>
            <span class="chart-solved" style="left:${solvedLeft}%;width:${solvedWidth}%"></span>
            <span class="chart-partial" style="left:${partialLeft}%;width:${partialWidth}%"></span>
            <span class="chart-watching" style="left:${watchingLeft}%;width:${watchingWidth}%"></span>
          </div>
          <span class="chart-total">${group.open} open / ${group.total}</span>
        </div>
      `;
    })
    .join("");

  const smallest = entries
    .filter((entry) => entry.status === "open" && entry.metricType === "H")
    .sort((a, b) => metricValue(a.metric) - metricValue(b.metric))
    .slice(0, 6);

  document.querySelector("#smallestOpen").innerHTML = smallest
    .map((entry) => `
      <button class="small-card" type="button" data-select="${entry.id}">
        <strong>${escapeHtml(entry.metricType)}=${escapeHtml(entry.metric)}</strong>
        <span>${escapeHtml(problemName(entry.problem))}</span>
        <span class="equation">${formatEquation(entry.equation)}</span>
      </button>
    `)
    .join("");
}

function entryLinks(entry) {
  const links = [
    { href: "https://arxiv.org/abs/2404.08518", label: "arXiv" },
    { href: "https://arxiv.org/pdf/2404.08518", label: "PDF" },
    ...(entry.links || []).map((href, index) => ({ href, label: `Evidence ${index + 1}` })),
  ];

  return links
    .map((link) => `<a class="icon-button" href="${escapeHtml(link.href)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>`)
    .join("");
}

function renderProblemCard(entry) {
  const metric = entry.metric ? `${entry.metricType}=${entry.metric}` : entry.metricType;
  const selectedClass = entry.id === selectedId ? " selected" : "";
  return `
    <article class="problem-card${selectedClass}" data-id="${entry.id}">
      <div class="problem-topline">
        <div class="meta-line">
          <span class="pill status-${entry.status}">${statusLabel(entry.status)}</span>
          <span class="pill neutral">${escapeHtml(problemName(entry.problem))}</span>
          <span class="pill neutral">${escapeHtml(metric)}</span>
        </div>
        <span class="pill neutral">${escapeHtml(entry.source)}</span>
      </div>
      <div class="equation">${formatEquation(entry.equation)}</div>
      <p>${escapeHtml(entry.note)}</p>
      <div class="tag-list">${entry.tags.map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`).join("")}</div>
      <div class="card-actions">
        <button class="icon-button" type="button" data-action="details" data-id="${entry.id}">Details</button>
        <button class="icon-button" type="button" data-action="watch" data-id="${entry.id}">Watch</button>
        <button class="icon-button" type="button" data-action="solve" data-id="${entry.id}">Mark solved</button>
      </div>
    </article>
  `;
}

function renderList() {
  const entries = filteredEntries();
  if (!selectedId || !allEntries().some((entry) => entry.id === selectedId)) {
    selectedId = entries[0]?.id || allEntries()[0]?.id || "";
  }

  document.querySelector("#resultCount").textContent = `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`;
  document.querySelector("#activeFilters").textContent = describeFilters();
  document.querySelector("#problemList").innerHTML = entries.length
    ? entries.map(renderProblemCard).join("")
    : `<div class="problem-card"><strong>No entries match.</strong><p>Try clearing a filter or switching status tabs.</p></div>`;

  renderDetail();
}

function describeFilters() {
  const filters = getFilters();
  const parts = [`status: ${viewStatus}`];
  if (filters.problem !== "all") parts.push(`problem: ${problemName(filters.problem)}`);
  if (filters.source !== "all") parts.push(`source: ${filters.source}`);
  if (filters.tag !== "all") parts.push(`tag: #${filters.tag}`);
  if (filters.search) parts.push(`search: "${filters.search}"`);
  return parts.join(" | ");
}

function renderDetail() {
  const entry = allEntries().find((item) => item.id === selectedId);
  const panel = document.querySelector("#detailPanel");
  if (!entry) {
    panel.innerHTML = `<h3>No entry selected</h3><p>Select an entry to inspect its source, status, and notes.</p>`;
    return;
  }

  const note = entry.curatorNote ? `<div class="note-box"><strong>Curator note</strong><br>${escapeHtml(entry.curatorNote)}</div>` : "";
  panel.innerHTML = `
    <h3>${escapeHtml(problemName(entry.problem))}</h3>
    <div class="equation">${formatEquation(entry.equation)}</div>
    <div class="detail-actions">
      <select data-action="status-select" data-id="${entry.id}" aria-label="Status for selected entry">
        ${["open", "watching", "partial", "solved"].map((status) => `
          <option value="${status}" ${entry.status === status ? "selected" : ""}>${statusLabel(status)}</option>
        `).join("")}
      </select>
    </div>
    <div class="detail-grid">
      <div class="detail-row"><strong>Problem</strong><span>${escapeHtml(problemDefinitions[entry.problem]?.full || entry.problem)}</span></div>
      <div class="detail-row"><strong>Category</strong><span>${escapeHtml(entry.category)}</span></div>
      <div class="detail-row"><strong>Source</strong><span>${escapeHtml(entry.source)}</span></div>
      <div class="detail-row"><strong>Metric</strong><span>${escapeHtml(entry.metric ? `${entry.metricType}=${entry.metric}` : entry.metricType)}</span></div>
      <div class="detail-row"><strong>Status</strong><span>${escapeHtml(statusLabel(entry.status))}</span></div>
    </div>
    <p>${escapeHtml(entry.note)}</p>
    ${note}
    <label>
      <span>Local note</span>
      <textarea rows="4" data-action="note" data-id="${entry.id}" placeholder="Add verifier notes, links, or status rationale">${escapeHtml(entry.curatorNote)}</textarea>
    </label>
    <div class="card-actions">${entryLinks(entry)}</div>
  `;
}

function renderUpdates() {
  document.querySelector("#updateLog").innerHTML = updateEvents.map((event) => `
    <article class="update-card">
      <div>
        <span class="version">${escapeHtml(event.version)}</span>
        <time>${escapeHtml(event.date)}</time>
      </div>
      <div>
        <h3>${escapeHtml(event.headline)}</h3>
        <ul>${event.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>
      </div>
    </article>
  `).join("");
}

function renderAll() {
  initFilters();
  renderStats();
  renderProgress();
  renderList();
  renderUpdates();
}

function setStatus(id, status) {
  const entry = allEntries().find((item) => item.id === id);
  if (!entry) return;
  if (status === entry.baseStatus) {
    delete state.overrides[id];
  } else {
    state.overrides[id] = status;
  }
  selectedId = id;
  saveState();
  renderStats();
  renderProgress();
  renderList();
}

function chooseRandom(status) {
  const candidates = allEntries().filter((entry) => entry.status === status);
  if (!candidates.length) return;
  const entry = candidates[Math.floor(Math.random() * candidates.length)];
  selectedId = entry.id;
  viewStatus = status;
  document.querySelectorAll(".status-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.status === status));
  renderList();
  document.querySelector(`[data-id="${CSS.escape(entry.id)}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function exportState() {
  const payload = {
    source: SOURCE,
    exportedAt: new Date().toISOString(),
    localState: state,
  };
  const output = JSON.stringify(payload, null, 2);
  document.querySelector("#exportOutput").value = output;
  navigator.clipboard?.writeText(output).catch(() => {});
}

function importState(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      const next = imported.localState || imported;
      state = {
        overrides: { ...state.overrides, ...(next.overrides || {}) },
        notes: { ...state.notes, ...(next.notes || {}) },
        custom: [...state.custom, ...(next.custom || [])],
      };
      saveState();
      renderAll();
    } catch {
      document.querySelector("#exportOutput").value = "Import failed: the selected file was not valid tracker JSON.";
    }
  };
  reader.readAsText(file);
}

function addLocalEntry(event) {
  event.preventDefault();
  const equation = document.querySelector("#newEquation").value.trim();
  if (!equation) return;
  const note = document.querySelector("#newNote").value.trim();
  const entry = {
    id: `custom-${Date.now()}`,
    equation,
    problem: document.querySelector("#newProblem").value,
    status: document.querySelector("#newStatus").value,
    note,
    tags: ["local-review"],
  };
  state.custom.push(entry);
  saveState();
  event.target.reset();
  selectedId = entry.id;
  renderAll();
}

function bindEvents() {
  ["#searchInput", "#problemFilter", "#sourceFilter", "#tagFilter", "#sortSelect"].forEach((selector) => {
    document.querySelector(selector).addEventListener("input", renderList);
  });

  document.querySelectorAll(".status-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      viewStatus = tab.dataset.status;
      document.querySelectorAll(".status-tab").forEach((button) => button.classList.toggle("active", button === tab));
      renderList();
    });
  });

  document.body.addEventListener("click", (event) => {
    const selectButton = event.target.closest("[data-select]");
    if (selectButton) {
      selectedId = selectButton.dataset.select;
      renderList();
      document.querySelector("#explorer").scrollIntoView({ behavior: "smooth" });
      return;
    }

    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;
    const id = actionButton.dataset.id;
    if (actionButton.dataset.action === "details") {
      selectedId = id;
      renderList();
    }
    if (actionButton.dataset.action === "watch") {
      setStatus(id, "watching");
    }
    if (actionButton.dataset.action === "solve") {
      setStatus(id, "solved");
    }
  });

  document.body.addEventListener("change", (event) => {
    const target = event.target;
    if (target.dataset.action === "status-select") {
      setStatus(target.dataset.id, target.value);
    }
    if (target.id === "importFile" && target.files[0]) {
      importState(target.files[0]);
      target.value = "";
    }
  });

  document.body.addEventListener("input", (event) => {
    const target = event.target;
    if (target.dataset.action === "note") {
      state.notes[target.dataset.id] = target.value;
      if (!target.value.trim()) {
        delete state.notes[target.dataset.id];
      }
      saveState();
      renderStats();
    }
  });

  document.querySelector("#randomOpen").addEventListener("click", () => chooseRandom("open"));
  document.querySelector("#randomSolved").addEventListener("click", () => chooseRandom("solved"));
  document.querySelector("#exportButton").addEventListener("click", exportState);
  document.querySelector("#newProblemForm").addEventListener("submit", addLocalEntry);
  document.querySelector("#resetLocalButton").addEventListener("click", () => {
    state = { overrides: {}, notes: {}, custom: [] };
    saveState();
    selectedId = "";
    renderAll();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  selectedId = currentOpen[0]?.id || "";
  bindEvents();
  renderAll();
});
