import type { Character, Puzzle } from './types';

export const CHARACTERS: Character[] = [
  {
    id: 1,
    name: "Loop Lord",
    description: "Overconfident brawler who overwhelms opponents with repeating strikes.",
    powerType: "Loop Attacks",
    color: "fuchsia",
  },
  {
    id: 2,
    name: "Debugger",
    description: "Calm and analytical, finds flaws in the enemy's code to counter.",
    powerType: "Error Cancels",
    color: "cyan",
  },
  {
    id: 3,
    name: "Array Queen",
    description: "Fierce and commanding, summons data minions to swarm her foes.",
    powerType: "Multi-minion Attacks",
    color: "emerald",
  },
  {
    id: 4,
    name: "Syntax Samurai",
    description: "A disciplined warrior whose attacks are as swift and precise as perfect code.",
    powerType: "Fast Slash Combos",
    color: "red",
  },
];

export const PUZZLES: Puzzle[] = [
    // --- Coding Fundamentals Puzzles ---
    { id: 1, level: 1, concept: "Print Statements", problem: "Display the message 'Hello World' in the console.", question: `console.log("{INPUT}");`, answer: "Hello World", tags: ['fundamentals'], explanation: "The console.log() function is used to print messages. Text, also called strings, must be wrapped in quotes." },
    { id: 2, level: 1, concept: "Variables", problem: "Create a variable named 'power' and assign it the numeric value 9001.", question: `let power = {INPUT};`, answer: "9001", tags: ['fundamentals'], explanation: "A variable is a container for a value. Here, 'power' is assigned the number 9001." },
    { id: 4, level: 2, concept: "Strings", problem: `Combine the string "Code " with another string to create "Code Clash".`, question: `const msg = "Code " + "{INPUT}";`, answer: `"Clash"`, tags: ['fundamentals'], explanation: "The '+' operator can be used to join (concatenate) strings together to form a new string. Remember to include quotes for a string value." },
    { id: 5, level: 3, concept: "Conditions", problem: `If the 'health' variable is less than 10, set the 'action' variable to the string "heal".`, question: `if (health < 10) { action = "{INPUT}"; }`, answer: `"heal"`, tags: ['fundamentals'], explanation: "An 'if' statement runs code only if its condition is true. If health is below 10, the action is to 'heal'." },
    { id: 6, level: 3, concept: "Functions", problem: "Define a function called 'blast' that returns the boolean value indicating success.", question: `function blast() { return {INPUT}; }`, answer: "true", tags: ['fundamentals'], explanation: "A function is a reusable block of code. The 'return' keyword specifies the value the function should output. 'true' is a boolean value." },
    { id: 9, level: 2, concept: "Operators", problem: "Complete the expression so that 'isReady' is true if either side of the operator is true.", question: `const isReady = true {INPUT} false; // Should be true`, answer: "||", tags: ['fundamentals'], explanation: "The logical OR (||) operator returns true if at least one of the operands is true." },
    { id: 15, level: 4, concept: "String to Number", problem: "The string '100' needs to be converted into a number and stored in the 'score' variable.", question: `const score = {INPUT}("100");`, answer: "parseInt", tags: ['fundamentals'], explanation: "The parseInt() function parses a string argument and returns an integer. This is needed to perform math on numbers stored as text." },
    { id: 20, level: 1, concept: "Operators", problem: "Complete the addition to make the variable 'c' equal 3.", question: `let a = 1; let b = 2; const c = a {INPUT} b;`, answer: "+", tags: ['fundamentals'], explanation: "The '+' operator is used for addition." },
    { id: 21, level: 2, concept: "String Properties", problem: "Get the length of the 'message' string.", question: `const message = "Hello"; let count = {INPUT};`, answer: "message.length", tags: ['fundamentals'], explanation: "The '.length' property of a string gives you the number of characters it contains." },
    { id: 22, level: 1, concept: "Comments", problem: "What is the term for a line of code that will be ignored by the computer?", question: `// This is a {INPUT}`, answer: "comment", tags: ['fundamentals'], explanation: "Comments are notes for human readers and are ignored by the compiler or interpreter." },
    { id: 23, level: 1, concept: "Booleans", problem: "Assign the boolean value for 'true' to the 'isReady' variable.", question: `let isReady = {INPUT};`, answer: "true", tags: ['fundamentals'], explanation: "Booleans are a data type that can only be 'true' or 'false'." },
    { id: 24, level: 2, concept: "Console", problem: "Use the console to display the value of the 'planet' variable.", question: `const planet = "Earth"; console.{INPUT}(planet);`, answer: "log", tags: ['fundamentals'], explanation: "console.log() is a common way to inspect values and debug code." },
    { id: 25, level: 2, concept: "Operators", problem: "Complete the division to make the quotient equal 5.", question: `const quotient = 10 / {INPUT};`, answer: "2", tags: ['fundamentals'], explanation: "The '/' operator is used for division." },
    { id: 26, level: 3, concept: "Operators", problem: "Find the remainder of 10 divided by 3.", question: `const remainder = 10 % {INPUT};`, answer: "3", tags: ['fundamentals'], explanation: "The modulo operator (%) gives the remainder of a division." },
    { id: 27, level: 3, concept: "Operators", problem: "Increment the value of x by 1.", question: `let x = 5; x{INPUT};`, answer: "++", tags: ['fundamentals'], explanation: "The increment operator (++) adds one to its operand." },
    { id: 28, level: 3, concept: "Conditions", problem: "Provide the keyword for what to do if an 'if' statement is false.", question: `if (score > 100) { status = "Expert"; } {INPUT} { status = "Novice"; }`, answer: "else", tags: ['fundamentals'], explanation: "The 'else' statement specifies a block of code to be executed if the condition in the 'if' statement is false." },
    { id: 29, level: 2, concept: "Strings", problem: "Concatenate the strings to form 'Hi Bob', with a space in the middle.", question: `const greeting = 'Hi'; const person = 'Bob'; const message = greeting + '{INPUT}' + person;`, answer: `" "`, tags: ['fundamentals'], explanation: "To add a space between variables when joining strings, you must explicitly add a space string ' '." },

    // --- Loop Lord Puzzles ---
    { id: 3, level: 2, concept: "For Loops", problem: "Create a 'for' loop that runs exactly 5 times.", question: `for(let i=0; i < {INPUT}; i++)`, answer: "5", tags: ['loop'], explanation: "A 'for' loop repeats code. This loop runs as long as 'i' is less than 5 (for i = 0, 1, 2, 3, 4)." },
    { id: 10, level: 3, concept: "While Loops", problem: "Use a 'while' loop to count down from 5 until the condition is no longer met.", question: `let i = 5; while (i > {INPUT}) { i--; }`, answer: "0", tags: ['loop'], explanation: "A 'while' loop continues as long as its condition is true. The loop stops when 'i' is no longer greater than 0." },
    { id: 11, level: 4, concept: "For...of Loops", problem: "Write a 'for...of' loop to iterate over an array called 'items'.", question: `for (const item of {INPUT}) { }`, answer: "items", tags: ['loop'], explanation: "The 'for...of' loop iterates over iterable objects like arrays, executing code for each element." },
    { id: 12, level: 2, concept: "Loop Control", problem: "Inside a loop, if the counter 'i' is exactly 3, skip the rest of the code in that iteration.", question: `if (i === 3) { {INPUT}; }`, answer: "continue", tags: ['loop'], explanation: "The 'continue' statement skips the current iteration of a loop and proceeds to the next one." },
    { id: 30, level: 1, concept: "For Loops", problem: "Inside this loop, log the current value of the counter 'i'.", question: `for (let i = 1; i <= 3; i++) { console.log({INPUT}); }`, answer: "i", tags: ['loop'], explanation: "The variable declared in the loop initializer (here, 'i') is available inside the loop's body." },
    { id: 31, level: 2, concept: "While Loops", problem: "Increment the 'count' variable inside this 'while' loop to prevent it from running forever.", question: `let count = 0; while (count < 2) { count{INPUT}; }`, answer: "++", tags: ['loop'], explanation: "It's crucial to change the condition variable inside a while loop to eventually make the condition false and exit the loop." },
    { id: 32, level: 3, concept: "Loop Control", problem: "Use a keyword to stop and exit this loop completely when i is 5.", question: `for (let i = 0; i < 10; i++) { if (i === 5) { {INPUT}; } }`, answer: "break", tags: ['loop'], explanation: "The 'break' statement terminates the current loop and transfers control to the statement following the terminated statement." },
    { id: 33, level: 4, concept: "For...of Loops", problem: "Provide the keyword that separates the element variable from the array in a 'for...of' loop.", question: `const letters = ['a','b','c']; for (const letter {INPUT} letters) {}`, answer: "of", tags: ['loop'], explanation: "The 'of' keyword is used in 'for...of' loops to iterate over the values of an iterable object." },
    { id: 34, level: 2, concept: "For Loops", problem: "Create a 'for' loop that counts down by decrementing the counter.", question: `for (let i = 5; i > 0; i{INPUT}) {}`, answer: "--", tags: ['loop'], explanation: "The decrement operator (--) subtracts one from its operand, useful for counting backwards." },
    { id: 35, level: 3, concept: "Do...while Loops", problem: "Make this 'do...while' loop run 3 times.", question: `let text = ''; let i = 0; do { text += 'A'; i++; } while (i < {INPUT});`, answer: "3", tags: ['loop'], explanation: "A 'do...while' loop checks its condition at the end, so it always runs at least once." },
    { id: 36, level: 1, concept: "Loop Concepts", problem: "A loop that runs forever is called an ____ loop.", question: `// It is an {INPUT} loop.`, answer: "infinite", tags: ['loop'], explanation: "An infinite loop occurs when the loop's exit condition is never met." },
    { id: 37, level: 4, concept: "For...of Loops", problem: "Inside this 'for...of' loop, add the current element's value to the 'sum'.", question: `let sum = 0; const nums = [10,20]; for (const num of nums) { sum += {INPUT}; }`, answer: "num", tags: ['loop'], explanation: "The variable declared in the 'for...of' loop (here, 'num') holds the value of the current element in the iteration." },
    
    // --- Debugger Puzzles ---
    { id: 8, level: 4, concept: "Fixing Addition", problem: "Fix the following code so that the variable 'x' equals 15.", question: `let x = 10 {INPUT} 5; // Should be 15`, answer: "+", tags: ['debug'], explanation: "Debugging means finding and fixing errors. To get 15 from 10 and 5, you need the addition operator '+'." },
    { id: 13, level: 2, concept: "Case Sensitivity", problem: `A variable 'name' has been declared. Print its value to the console, paying attention to case sensitivity.`, question: `const name = "AI"; console.log({INPUT});`, answer: "name", tags: ['debug'], explanation: "JavaScript is case-sensitive. The variable 'name' must be referenced with the same casing it was declared with." },
    { id: 14, level: 3, concept: "Comparison", problem: "Check if the 'level' variable is exactly equal to 9. A single '=' is for assignment.", question: `if (level {INPUT} 9) { }`, answer: "===", tags: ['debug'], explanation: "The strict equality operator (===) checks if two values are equal without performing type conversion. A single '=' is for assignment." },
    { id: 50, level: 3, concept: "Assignment vs Comparison", problem: "This 'if' statement is assigning 5 to 'a' instead of checking for equality. Fix it.", question: `if (a {INPUT} 5) {}`, answer: "===", tags: ['debug'], explanation: "A common bug is using a single equals sign (assignment) instead of double or triple equals (comparison) in a condition." },
    { id: 51, level: 4, concept: "Type Coercion", problem: "The result is '255', not 30, due to string concatenation. Fix this by converting the string to a number first.", question: `const numStr = "25"; const num = {INPUT}(numStr) + 5;`, answer: "parseInt", tags: ['debug'], explanation: "When you add a number to a string, the number is converted to a string. Use parseInt() to treat the string as a number." },
    { id: 52, level: 2, concept: "Off-by-one Error", problem: "This loop runs 6 times (0 to 5). To make it run 5 times, change the condition.", question: `for (let i=0; i {INPUT} 5; i++) {}`, answer: "<", tags: ['debug'], explanation: "Off-by-one errors are common in loops. Using '<' instead of '<=' makes the loop run from 0 to 4, which is 5 times." },
    { id: 53, level: 2, concept: "Case Sensitivity", problem: "Accessing 'person.Name' will fail because the property is named 'name' (lowercase). This is an error of ____ sensitivity.", question: `// Error due to {INPUT} sensitivity`, answer: "case", tags: ['debug'], explanation: "JavaScript property names and variables are case-sensitive. 'Name' and 'name' are different." },
    { id: 54, level: 1, concept: "Syntax Error", problem: "This line of code is missing a semicolon at the end, which is good practice. Add it.", question: `const msg = "Hello"{INPUT}`, answer: ";", tags: ['debug'], explanation: "While optional in some cases, semicolons are used to separate statements in JavaScript." },
    { id: 55, level: 3, concept: "Syntax Error", problem: "This function is missing its closing brace. Add it.", question: `function greet() { return "Hi" {INPUT}`, answer: "}", tags: ['debug'], explanation: "Code blocks opened with '{' must be closed with '}'." },
    { id: 56, level: 1, concept: "Syntax Error", problem: "This array is missing a comma between 'green' and 'blue'.", question: `const colors = ["red", "green" {INPUT} "blue"];`, answer: ",", tags: ['debug'], explanation: "Array elements must be separated by commas." },
    { id: 57, level: 4, concept: "Type Coercion", problem: "Initializing 'total' as a string causes issues. To fix this, initialize 'total' as a number.", question: `let total = {INPUT}; total += 5;`, answer: "0", tags: ['debug'], explanation: "Always initialize variables with the correct data type (number for math, string for text) to avoid unexpected behavior." },

    // --- Array Queen Puzzles ---
    { id: 7, level: 4, concept: "Adding Items", problem: `Add the string "Debugger" as a new element to the 'team' array.`, question: `const team = ["Lord", "Queen", {INPUT}];`, answer: `"Debugger"`, tags: ['array'], explanation: "An array is a list of values. To add a string value like 'Debugger' to the list, it must be enclosed in quotes." },
    { id: 16, level: 2, concept: "Accessing Items", problem: "Access the very first element from an array called 'items' and store it in a variable.", question: `const first = items[{INPUT}];`, answer: "0", tags: ['array'], explanation: "Array elements are accessed using zero-based indexing. The first element is at index 0." },
    { id: 17, level: 3, concept: "Array Length", problem: "Get the total number of elements in an array called 'items' and store it in the 'count' variable.", question: `const count = items.{INPUT};`, answer: "length", tags: ['array'], explanation: "The '.length' property of an array returns the number of elements it contains." },
    { id: 18, level: 4, concept: "Adding to End", problem: "Add the string 'new' to the very end of the 'items' array.", question: `items.{INPUT}("new");`, answer: "push", tags: ['array'], explanation: "The .push() method adds one or more elements to the end of an array and returns the new length." },
    { id: 40, level: 2, concept: "Array Length", problem: "Get the number of colors in the array.", question: `const colors = ["red", "green", "blue"]; const colorCount = colors.{INPUT};`, answer: "length", tags: ['array'], explanation: "The .length property tells you how many items are in an array." },
    { id: 41, level: 3, concept: "Array Methods", problem: "Use an array method to add 'banana' to the end of the 'fruits' array.", question: `const fruits = ["apple"]; fruits.{INPUT}("banana");`, answer: "push", tags: ['array'], explanation: ".push() is a method that adds an element to the end of an array." },
    { id: 42, level: 3, concept: "Array Methods", problem: "Use an array method to remove the last element from the 'numbers' array.", question: `const numbers = [1, 2, 3]; const last = numbers.{INPUT}();`, answer: "pop", tags: ['array'], explanation: ".pop() is a method that removes the last element from an array." },
    { id: 43, level: 2, concept: "Array Indexing", problem: "Access the character 'b' from the 'letters' array using its index.", question: `const letters = ['a', 'b', 'c']; const b = letters[{INPUT}];`, answer: "1", tags: ['array'], explanation: "Arrays are zero-indexed, so the second element is at index 1." },
    { id: 44, level: 1, concept: "Creating Arrays", problem: "Complete the array of primary colors by adding 'blue'.", question: `const primaryColors = ["red", "yellow", {INPUT}];`, answer: `"blue"`, tags: ['array'], explanation: "Elements in an array are separated by commas. String elements need to be in quotes." },
    { id: 45, level: 3, concept: "Array Length", problem: "Get the size of the 'team' array after adding two members.", question: `const team = []; team.push("John"); team.push("Jane"); const teamSize = team.{INPUT};`, answer: "length", tags: ['array'], explanation: "The .length property dynamically updates as you add or remove items." },
    { id: 46, level: 4, concept: "Array Methods", problem: "Find the index of the element 'dog' in the 'pets' array.", question: `const pets = ['cat', 'dog']; const dogIndex = pets.indexOf({INPUT});`, answer: `'dog'`, tags: ['array'], explanation: "The .indexOf() method returns the first index at which a given element can be found in the array." },
    { id: 47, level: 1, concept: "Creating Arrays", problem: "Create a new, empty array.", question: `const emptyArray = {INPUT};`, answer: "[]", tags: ['array'], explanation: "An empty pair of square brackets is the syntax for an empty array literal." },
    { id: 48, level: 4, concept: "Modifying Arrays", problem: "Change the element 'Fall' to 'Autumn' in the 'seasons' array using its index.", question: `const seasons = ['Spring', 'Summer', 'Fall', 'Winter']; seasons[{INPUT}] = 'Autumn';`, answer: "2", tags: ['array'], explanation: "'Fall' is at index 2. You can change an element by assigning a new value to a specific index." },
];


export const GAME_CONSTANTS = {
    PLAYER_MAX_HEALTH: 100,
    OPPONENT_MAX_HEALTH: 100,
    PUZZLE_TIMER_SECONDS: 10,
    BASE_ATTACK_DAMAGE: 15,
    POWER_ATTACK_BONUS: 10,
    FAIL_DAMAGE: 10,
    OPPONENT_ATTACK_DAMAGE: 8,
    OPPONENT_TURN_DELAY_MS: 1500,
};

export const FUNNY_FAIL_MESSAGES = [
    "Compiling your failure...",
    "Error 404: Skill not found.",
    "You've been deprecated!",
    "Oops! You just created a memory leak of shame.",
    "Your code is buggier than a swamp.",
    "Task failed successfully.",
    "Segmentation fault (your fault).",
];

export const CONCEPTS = [
  { name: 'Coding Fundamentals', description: 'Start your journey here. Learn how to store information in variables, understand different data types like strings and numbers, and use operators for basic math and logic.', tags: ['fundamentals'] },
  { name: 'Loops', description: "Learn how to make your code repeat actions automatically using 'for' and 'while' loops. Essential for saving time and writing efficient code.", tags: ['loop'] },
  { name: 'Arrays', description: 'Discover how to store and manage collections of items in a single variable. You will learn to access, add, and manage data within these powerful lists.', tags: ['array'] },
  { name: 'Debugging', description: 'Every programmer creates bugs! This module teaches you how to identify common mistakes, understand error messages, and fix your code when things go wrong.', tags: ['debug'] },
];