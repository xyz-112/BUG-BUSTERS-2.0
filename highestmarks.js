const marks = [56, 89, 78, 90, 99, 67];

let highest = marks[0];

for (let i = 1; i < marks.length; i++) {
  if (marks[i] > highest) {
    highest = marks[i];
  }
}

console.log("Highest mark is:", highest);