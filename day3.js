// Day 3: Arrays & Objects

let students = [
  { name: "Harshil", marks: [85, 90, 78] },
  { name: "Aman", marks: [88, 76, 95] },
  { name: "Riya", marks: [92, 81, 89] }
];

// map -> total marks
let totals = students.map(s => {
  return { name: s.name, total: s.marks.reduce((a, b) => a + b, 0) };
});

console.log("Total Marks of Students:", totals);

// filter -> toppers
let toppers = totals.filter(s => s.total > 250);
console.log("Toppers:", toppers);

// reduce -> class average
let classTotal = totals.reduce((sum, s) => sum + s.total, 0);
let classAvg = classTotal / students.length;
console.log("Class Average:", classAvg);
