// Day 1: JavaScript Basics

let name = "Harshil";
let age = 20;
let isStudent = true;
let marks = [85, 90, 78, 88];

let totalMarks = marks[0] + marks[1] + marks[2] + marks[3];
let avg = totalMarks / marks.length;

console.log("Name:", name);
console.log("Age:", age);
console.log("Is Student:", isStudent);
console.log("Marks:", marks);
console.log("Total Marks:", totalMarks);
console.log("Average Marks:", avg);

let student = {
  id: 101,
  name: "Harshil Kumar",
  course: "B.Tech AIML",
  year: "2nd Year",
  email: "harshil@example.com"
};

console.log("\n--- Student Details ---");
for (let key in student) {
  console.log(`${key}: ${student[key]}`);
}
