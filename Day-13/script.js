// ==========================================
// LOGIC FOUNDATION - BEGINNER EXERCISES
// ==========================================

console.log("🎯 Starting Logic Foundation Exercises...\n");

// ==========================================
// PART 1: Variables & Math Operations
// ==========================================

console.log("--- PART 1: Variables & Math ---\n");

// Create two number variables
const num1 = 15;
const num2 = 4;

console.log(`Number 1: ${num1}`);
console.log(`Number 2: ${num2}\n`);

// Calculate sum
const sum = num1 + num2;
console.log(`Sum: ${num1} + ${num2} = ${sum}`);

// Calculate product
const product = num1 * num2;
console.log(`Product: ${num1} × ${num2} = ${product}`);

// Calculate remainder (modulo)
const remainder = num1 % num2;
console.log(`Remainder: ${num1} % ${num2} = ${remainder}\n`);

// ==========================================
// PART 2: String Concatenation
// ==========================================

console.log("--- PART 2: String Concatenation ---\n");

// User name variable
let userName = "Alex";

// Create welcome message using concatenation
const welcomeMessage = "Welcome, " + userName + "! Let's learn JavaScript together.";
console.log(welcomeMessage);

// Alternative: Template literal (modern way)
const welcomeMessage2 = `Hello ${userName}, great to see you here!`;
console.log(welcomeMessage2 + "\n");

// ==========================================
// PART 3: Data Type Inspection with typeof
// ==========================================

console.log("--- PART 3: Data Type Inspection ---\n");

// Check types of our variables
console.log(`typeof num1: ${typeof num1}`);
console.log(`typeof num2: ${typeof num2}`);
console.log(`typeof sum: ${typeof sum}`);
console.log(`typeof userName: ${typeof userName}`);
console.log(`typeof welcomeMessage: ${typeof welcomeMessage}\n`);

// ==========================================
// BONUS: Magic 8-Ball Simulator
// ==========================================

console.log("--- BONUS: Magic 8-Ball ---\n");

// Array of possible responses
const responses = [
  "Yes, definitely!",
  "It is certain.",
  "Reply hazy, try again.",
  "Cannot predict now.",
  "Don't count on it.",
  "My sources say no."
];

// Generate random index
const randomIndex = Math.floor(Math.random() * responses.length);
const magicAnswer = responses[randomIndex];

// User's question
const question = "Will I master JavaScript?";

console.log(`🎱 Magic 8-Ball says...`);
console.log(`Question: ${question}`);
console.log(`Answer: ${magicAnswer}\n`);

// ==========================================
// PRACTICE EXERCISES (Try these yourself!)
// ==========================================

console.log("--- PRACTICE EXERCISES ---\n");

// Exercise 1: Create your own calculation
const myNum1 = 10;
const myNum2 = 3;
const difference = myNum1 - myNum2;
const quotient = myNum1 / myNum2;

console.log(`Exercise 1: ${myNum1} - ${myNum2} = ${difference}`);
console.log(`Exercise 1: ${myNum1} ÷ ${myNum2} = ${quotient.toFixed(2)}\n`);

// Exercise 2: Experiment with string concatenation
const firstName = "Jane";
const lastName = "Doe";
const fullName = firstName + " " + lastName;

console.log(`Exercise 2: Full name is ${fullName}`);
console.log(`typeof fullName: ${typeof fullName}\n`);

// Exercise 3: Type checking mixed operations
const mixedResult = "5" + 5; // String concatenation
const numericResult = 5 + 5; // Numeric addition

console.log(`Exercise 3: "5" + 5 = ${mixedResult} (type: ${typeof mixedResult})`);
console.log(`Exercise 3: 5 + 5 = ${numericResult} (type: ${typeof numericResult})\n`);

console.log("✅ Logic Foundation Complete!");
console.log("💡 Try modifying the values and see what happens!");