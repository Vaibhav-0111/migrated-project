// Quiz questions for each game - 8 questions per game with formulas and explanations

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  formula?: string;
}

// Angle Shadow Garden - Trigonometry & Shadows
export const angleShadowQuestions: QuizQuestion[] = [
  {
    question: "What is the angle of the sun when it is directly overhead?",
    options: [
      "0 degrees",
      "45 degrees",
      "90 degrees",
      "180 degrees"
    ],
    correctIndex: 2,
    explanation: "When the sun is directly overhead, the angle from the horizon is 90 degrees."
  },
  {
    question: "How does the length of a shadow change as the sun moves from horizon to overhead?",
    options: [
      "Shadows get longer",
      "Shadows get shorter",
      "Shadows stay the same length",
      "Shadows disappear"
    ],
    correctIndex: 1,
    explanation: "As the sun rises higher, shadows become shorter because the light hits objects more directly."
  },
  {
    question: "If the sun is at a 45° angle, how does the shadow length compare to the object's height?",
    options: [
      "Shadow is longer than height",
      "Shadow is equal to height",
      "Shadow is shorter than height",
      "Shadow length is zero"
    ],
    correctIndex: 1,
    explanation: "At 45°, the shadow length equals the object's height because tan(45°) = 1."
  },
  {
    question: "When the sun is at a higher angle in the sky, what happens to shadows?",
    options: [
      "Shadows become longer",
      "Shadows become shorter",
      "Shadows stay the same",
      "Shadows disappear completely"
    ],
    correctIndex: 1,
    explanation: "When the sun is higher in the sky (larger angle from the horizon), shadows become shorter because the light rays hit objects more directly."
  },
  {
    question: "If the sun is at 30° angle and a tree is 10m tall, what is the shadow length?",
    options: [
      "About 17.3 meters",
      "About 5.8 meters",
      "About 10 meters",
      "About 20 meters"
    ],
    correctIndex: 0,
    explanation: "Shadow length = Height ÷ tan(angle). So 10 ÷ tan(30°) = 10 ÷ 0.577 ≈ 17.3 meters.",
    formula: "Shadow = Height ÷ tan(θ)"
  },
  {
    question: "What trigonometric ratio relates the height of an object to its shadow length?",
    options: [
      "Sine (sin)",
      "Cosine (cos)",
      "Tangent (tan)",
      "Secant (sec)"
    ],
    correctIndex: 2,
    explanation: "Tangent relates the opposite side (height) to the adjacent side (shadow length). tan(θ) = Height ÷ Shadow Length.",
    formula: "tan(θ) = opposite ÷ adjacent"
  },
  {
    question: "At what sun angle would a 5m pole cast a 5m shadow?",
    options: [
      "30 degrees",
      "45 degrees",
      "60 degrees",
      "90 degrees"
    ],
    correctIndex: 1,
    explanation: "When the shadow equals the height, tan(θ) = 1, which means θ = 45°. This is a special angle where opposite and adjacent sides are equal.",
    formula: "tan(45°) = 1"
  },
  {
    question: "If tan(θ) = 2, what does this mean about the shadow?",
    options: [
      "The shadow is twice as long as the object",
      "The shadow is half as long as the object",
      "The shadow equals the object height",
      "The shadow is zero"
    ],
    correctIndex: 1,
    explanation: "tan(θ) = Height ÷ Shadow. If tan(θ) = 2, then Height = 2 × Shadow, meaning the shadow is half the height.",
    formula: "tan(θ) = Height ÷ Shadow = 2"
  },
  {
    question: "Why do shadows get longer during sunrise and sunset?",
    options: [
      "The sun gets bigger",
      "The sun angle is very small",
      "The Earth rotates faster",
      "Objects grow taller"
    ],
    correctIndex: 1,
    explanation: "At sunrise and sunset, the sun is near the horizon with a very small angle. Since Shadow = Height ÷ tan(θ), and tan of small angles is small, the shadow becomes very long."
  },
  {
    question: "What is the value of tan(60°)?",
    options: [
      "1",
      "√3 (about 1.73)",
      "1/√3 (about 0.58)",
      "2"
    ],
    correctIndex: 1,
    explanation: "tan(60°) = √3 ≈ 1.73. This is one of the special angle values you should remember!",
    formula: "tan(60°) = √3 ≈ 1.732"
  },
  {
    question: "A building casts a 25m shadow when the sun is at 53°. What is the building's height?",
    options: [
      "About 25 meters",
      "About 33 meters",
      "About 19 meters",
      "About 50 meters"
    ],
    correctIndex: 1,
    explanation: "Height = Shadow × tan(θ) = 25 × tan(53°) = 25 × 1.33 ≈ 33 meters.",
    formula: "Height = Shadow × tan(θ)"
  }
];

// Mountain Rescue - Sine & Right Triangles
export const mountainRescueQuestions: QuizQuestion[] = [
  {
    question: "What is the hypotenuse in a right triangle?",
    options: [
      "The longest side",
      "The shortest side",
      "The side opposite the right angle",
      "The side adjacent to the right angle"
    ],
    correctIndex: 0,
    explanation: "The hypotenuse is the longest side of a right triangle, opposite the right angle."
  },
  {
    question: "In a right triangle, what does sin(angle) equal?",
    options: [
      "Adjacent ÷ Hypotenuse",
      "Opposite ÷ Hypotenuse",
      "Opposite ÷ Adjacent",
      "Hypotenuse ÷ Opposite"
    ],
    correctIndex: 1,
    explanation: "Sine of an angle equals the opposite side divided by the hypotenuse. Remember SOH-CAH-TOA: Sine = Opposite/Hypotenuse.",
    formula: "sin(θ) = Opposite ÷ Hypotenuse"
  },
  {
    question: "If a rescue rope is 50m long and makes a 30° angle, how high can it reach?",
    options: [
      "25 meters",
      "43.3 meters",
      "50 meters",
      "100 meters"
    ],
    correctIndex: 0,
    explanation: "Height = Rope × sin(30°) = 50 × 0.5 = 25 meters. sin(30°) = 0.5 is a special value!",
    formula: "Height = Hypotenuse × sin(θ)"
  },
  {
    question: "What is the value of sin(30°)?",
    options: [
      "0.25",
      "0.5",
      "0.707",
      "0.866"
    ],
    correctIndex: 1,
    explanation: "sin(30°) = 0.5 or 1/2. This is one of the special angle values you should memorize!",
    formula: "sin(30°) = 1/2 = 0.5"
  },
  {
    question: "A ladder 10m long leans against a wall at 60°. How high up the wall does it reach?",
    options: [
      "5 meters",
      "7.07 meters",
      "8.66 meters",
      "10 meters"
    ],
    correctIndex: 2,
    explanation: "Height = 10 × sin(60°) = 10 × 0.866 = 8.66 meters.",
    formula: "sin(60°) = √3/2 ≈ 0.866"
  },
  {
    question: "What is sin(90°)?",
    options: [
      "0",
      "0.5",
      "0.707",
      "1"
    ],
    correctIndex: 3,
    explanation: "sin(90°) = 1. At 90°, the opposite side equals the hypotenuse, so their ratio is 1.",
    formula: "sin(90°) = 1"
  },
  {
    question: "If sin(θ) = 0.6 and the hypotenuse is 100m, what is the opposite side?",
    options: [
      "40 meters",
      "60 meters",
      "80 meters",
      "166.7 meters"
    ],
    correctIndex: 1,
    explanation: "Opposite = Hypotenuse × sin(θ) = 100 × 0.6 = 60 meters.",
    formula: "Opposite = Hypotenuse × sin(θ)"
  },
  {
    question: "What is the relationship between sin(θ) and cos(90° - θ)?",
    options: [
      "They are equal",
      "They are opposites",
      "They add to 1",
      "They multiply to 1"
    ],
    correctIndex: 0,
    explanation: "sin(θ) = cos(90° - θ). These are called co-functions. For example, sin(30°) = cos(60°) = 0.5.",
    formula: "sin(θ) = cos(90° - θ)"
  },
  {
    question: "A drone at 45° needs to drop a rope to reach someone 70m below. How long should the rope be?",
    options: [
      "70 meters",
      "49.5 meters",
      "99 meters",
      "140 meters"
    ],
    correctIndex: 2,
    explanation: "Rope = Height ÷ sin(45°) = 70 ÷ 0.707 ≈ 99 meters. The rope (hypotenuse) must be longer than the height.",
    formula: "Hypotenuse = Opposite ÷ sin(θ)"
  }
];

// Wave Balance Lab - Pythagorean Identity
export const waveLabQuestions: QuizQuestion[] = [
  {
    question: "What is the Pythagorean Identity in trigonometry?",
    options: [
      "sin(θ) + cos(θ) = 1",
      "sin²(θ) + cos²(θ) = 1",
      "sin(θ) × cos(θ) = 1",
      "sin²(θ) - cos²(θ) = 1"
    ],
    correctIndex: 1,
    explanation: "The Pythagorean Identity states that sin²(θ) + cos²(θ) = 1 for any angle θ. This comes from the Pythagorean theorem applied to the unit circle.",
    formula: "sin²(θ) + cos²(θ) = 1"
  },
  {
    question: "If sin(θ) = 0.6, what is cos(θ)?",
    options: [
      "0.4",
      "0.6",
      "0.8",
      "1.0"
    ],
    correctIndex: 2,
    explanation: "Using sin²(θ) + cos²(θ) = 1: 0.36 + cos²(θ) = 1, so cos²(θ) = 0.64, and cos(θ) = 0.8.",
    formula: "cos(θ) = √(1 - sin²(θ))"
  },
  {
    question: "At what angle are sin(θ) and cos(θ) equal?",
    options: [
      "30 degrees",
      "45 degrees",
      "60 degrees",
      "90 degrees"
    ],
    correctIndex: 1,
    explanation: "At 45°, sin(45°) = cos(45°) = √2/2 ≈ 0.707. This is the balance point where both values are equal.",
    formula: "sin(45°) = cos(45°) = √2/2"
  },
  {
    question: "What is the value of sin²(30°) + cos²(30°)?",
    options: [
      "0.5",
      "0.75",
      "1",
      "1.25"
    ],
    correctIndex: 2,
    explanation: "By the Pythagorean Identity, sin²(θ) + cos²(θ) = 1 for ANY angle. It always equals 1!",
    formula: "sin²(30°) + cos²(30°) = 0.25 + 0.75 = 1"
  },
  {
    question: "If cos(θ) = 0.5, what are the possible values of sin(θ)?",
    options: [
      "Only 0.866",
      "Only -0.866",
      "Either 0.866 or -0.866",
      "0.5"
    ],
    correctIndex: 2,
    explanation: "sin²(θ) = 1 - 0.25 = 0.75, so sin(θ) = ±√0.75 = ±0.866. The sign depends on which quadrant the angle is in.",
    formula: "sin(θ) = ±√(1 - cos²(θ))"
  },
  {
    question: "What does sin²(θ) mean?",
    options: [
      "sin(θ²)",
      "sin(θ) × sin(θ)",
      "2 × sin(θ)",
      "sin(2θ)"
    ],
    correctIndex: 1,
    explanation: "sin²(θ) is shorthand for [sin(θ)]², which means sin(θ) multiplied by itself.",
    formula: "sin²(θ) = [sin(θ)]² = sin(θ) × sin(θ)"
  },
  {
    question: "On the unit circle, what represents sin(θ) and cos(θ)?",
    options: [
      "sin is the radius, cos is the angle",
      "sin is the x-coordinate, cos is the y-coordinate",
      "sin is the y-coordinate, cos is the x-coordinate",
      "Both are the radius"
    ],
    correctIndex: 2,
    explanation: "On the unit circle, cos(θ) is the x-coordinate and sin(θ) is the y-coordinate. The radius is always 1, which is why x² + y² = 1.",
    formula: "x = cos(θ), y = sin(θ)"
  },
  {
    question: "If sin²(θ) = 0.36, what is sin²(θ) + cos²(θ)?",
    options: [
      "0.36",
      "0.64",
      "1",
      "Cannot determine"
    ],
    correctIndex: 2,
    explanation: "No matter what sin²(θ) equals, sin²(θ) + cos²(θ) ALWAYS equals 1. That's the beauty of the Pythagorean Identity!",
    formula: "sin²(θ) + cos²(θ) = 1 (always!)"
  }
];

// Balance Garden - Variables & Expressions
export const balanceGardenQuestions: QuizQuestion[] = [
  { question: "What is a variable in algebra?", options: ["A fixed number", "A symbol representing an unknown value", "An equation", "A constant"], correctIndex: 1, explanation: "A variable is a symbol (like x or y) that represents an unknown or changing value." },
  { question: "If x + 3 = 7, what is x?", options: ["3", "4", "7", "10"], correctIndex: 1, explanation: "Subtract 3 from both sides: x = 7 - 3 = 4", formula: "x + 3 = 7 → x = 4" },
  { question: "What does the equals sign (=) mean?", options: ["Add these numbers", "Both sides have the same value", "Subtract these numbers", "Multiply"], correctIndex: 1, explanation: "The equals sign means both sides of the equation have exactly the same value." },
  { question: "If 2 + x = 2 + 5, what is x?", options: ["2", "5", "7", "0"], correctIndex: 1, explanation: "Since both sides must be equal and 2 is on both sides, x must equal 5." },
  { question: "What is an algebraic expression?", options: ["Only numbers", "A combination of numbers, variables, and operations", "Only variables", "An equation with ="], correctIndex: 1, explanation: "An algebraic expression combines numbers, variables, and operations like 3x + 2." },
  { question: "In x + 2 = 5, what operation isolates x?", options: ["Add 2", "Subtract 2", "Multiply by 2", "Divide by 2"], correctIndex: 1, explanation: "To isolate x, subtract 2 from both sides: x = 5 - 2 = 3", formula: "x + 2 - 2 = 5 - 2" },
  { question: "If a box represents x and x = 4, what is 2 boxes worth?", options: ["4", "6", "8", "2"], correctIndex: 2, explanation: "2 boxes = 2x = 2 × 4 = 8", formula: "2x = 2 × 4 = 8" },
  { question: "What keeps an equation balanced?", options: ["Adding to one side only", "Doing the same thing to both sides", "Removing from one side", "Changing the variable"], correctIndex: 1, explanation: "Whatever you do to one side, you must do to the other to keep the equation balanced." }
];

// Equation Factory - Solving Equations
export const equationFactoryQuestions: QuizQuestion[] = [
  { question: "Solve: 2x = 10", options: ["x = 2", "x = 5", "x = 10", "x = 20"], correctIndex: 1, explanation: "Divide both sides by 2: x = 10 ÷ 2 = 5", formula: "2x ÷ 2 = 10 ÷ 2" },
  { question: "Solve: x + 7 = 12", options: ["x = 5", "x = 7", "x = 12", "x = 19"], correctIndex: 0, explanation: "Subtract 7 from both sides: x = 12 - 7 = 5" },
  { question: "Solve: 3x + 2 = 11", options: ["x = 2", "x = 3", "x = 4", "x = 5"], correctIndex: 1, explanation: "First subtract 2: 3x = 9. Then divide by 3: x = 3", formula: "3x + 2 = 11 → 3x = 9 → x = 3" },
  { question: "What is the inverse of addition?", options: ["Multiplication", "Division", "Subtraction", "Addition"], correctIndex: 2, explanation: "Subtraction is the inverse of addition. We use it to 'undo' addition." },
  { question: "Solve: x - 4 = 10", options: ["x = 6", "x = 10", "x = 14", "x = 40"], correctIndex: 2, explanation: "Add 4 to both sides: x = 10 + 4 = 14" },
  { question: "Solve: 4x - 8 = 12", options: ["x = 3", "x = 4", "x = 5", "x = 6"], correctIndex: 2, explanation: "Add 8: 4x = 20. Divide by 4: x = 5", formula: "4x = 20 → x = 5" },
  { question: "What is the inverse of multiplication?", options: ["Addition", "Subtraction", "Division", "Multiplication"], correctIndex: 2, explanation: "Division is the inverse of multiplication. We use it to 'undo' multiplication." },
  { question: "Solve: x/3 = 4", options: ["x = 1", "x = 7", "x = 12", "x = 4"], correctIndex: 2, explanation: "Multiply both sides by 3: x = 4 × 3 = 12", formula: "(x/3) × 3 = 4 × 3" }
];

// Pattern Portal - Patterns & Substitution
export const patternPortalQuestions: QuizQuestion[] = [
  { question: "What comes next: 2, 4, 8, 16, ?", options: ["18", "20", "24", "32"], correctIndex: 3, explanation: "Each number doubles: 16 × 2 = 32", formula: "Pattern: ×2" },
  { question: "If n = 3 in the expression 2n + 1, what is the result?", options: ["5", "6", "7", "8"], correctIndex: 2, explanation: "Substitute n = 3: 2(3) + 1 = 6 + 1 = 7", formula: "2n + 1 = 2(3) + 1 = 7" },
  { question: "What is the pattern: 1, 4, 9, 16, 25?", options: ["Add 3", "Add 5", "Square numbers", "Multiply by 2"], correctIndex: 2, explanation: "These are perfect squares: 1², 2², 3², 4², 5²", formula: "n² pattern" },
  { question: "If a = 2 and b = 3, what is a + b?", options: ["5", "6", "23", "1"], correctIndex: 0, explanation: "Substitute values: a + b = 2 + 3 = 5" },
  { question: "What comes next: 3, 6, 9, 12, ?", options: ["13", "14", "15", "18"], correctIndex: 2, explanation: "Add 3 each time: 12 + 3 = 15", formula: "Pattern: +3" },
  { question: "If x = 5, what is 3x - 2?", options: ["8", "11", "13", "15"], correctIndex: 2, explanation: "Substitute x = 5: 3(5) - 2 = 15 - 2 = 13", formula: "3x - 2 = 3(5) - 2 = 13" },
  { question: "What is the 5th term of: 2, 5, 8, 11, ?", options: ["13", "14", "15", "16"], correctIndex: 1, explanation: "Add 3 each time: 11 + 3 = 14", formula: "aₙ = 2 + 3(n-1)" },
  { question: "If y = x + 2 and x = 4, what is y?", options: ["2", "4", "6", "8"], correctIndex: 2, explanation: "Substitute x = 4: y = 4 + 2 = 6" }
];

// Shape Fill Playground - Understanding Volume
export const shapeFillQuestions: QuizQuestion[] = [
  { question: "What is volume?", options: ["The outside of a shape", "The space inside a 3D shape", "The length of a shape", "The weight of a shape"], correctIndex: 1, explanation: "Volume is the amount of space inside a three-dimensional shape.", formula: "Volume = Space inside" },
  { question: "What is the volume of a cube with side 3cm?", options: ["9 cm³", "18 cm³", "27 cm³", "36 cm³"], correctIndex: 2, explanation: "Volume of cube = side × side × side = 3 × 3 × 3 = 27 cm³", formula: "V = s³" },
  { question: "If you double the height of a box, what happens to the volume?", options: ["Stays the same", "Doubles", "Triples", "Quadruples"], correctIndex: 1, explanation: "Volume = length × width × height. If you double height, volume doubles.", formula: "V = l × w × h" },
  { question: "Which unit measures volume?", options: ["cm", "cm²", "cm³", "m"], correctIndex: 2, explanation: "Volume is measured in cubic units like cm³ (cubic centimeters) because it measures 3D space." },
  { question: "A cylinder has radius 2cm and height 5cm. What formula finds its volume?", options: ["πr²", "πr²h", "2πrh", "πd"], correctIndex: 1, explanation: "The volume of a cylinder = π × radius² × height", formula: "V = πr²h" },
  { question: "A sphere has radius 3cm. What's its volume?", options: ["36π cm³", "27π cm³", "12π cm³", "9π cm³"], correctIndex: 0, explanation: "Volume of sphere = (4/3)πr³ = (4/3)π(3)³ = (4/3)π(27) = 36π cm³", formula: "V = (4/3)πr³" },
  { question: "If two containers have the same volume, will they always have the same shape?", options: ["Yes, always", "No, different shapes can have the same volume", "Only if they're both cubes", "Only if they're both spheres"], correctIndex: 1, explanation: "Different shapes can hold the same amount of space. A tall thin container and a short wide container can have equal volumes." },
  { question: "What is the volume of a rectangular prism 4×3×2 cm?", options: ["9 cm³", "14 cm³", "24 cm³", "48 cm³"], correctIndex: 2, explanation: "Volume = length × width × height = 4 × 3 × 2 = 24 cm³", formula: "V = l × w × h" }
];

// Wrap the Gift Studio - Surface Area
export const wrapGiftQuestions: QuizQuestion[] = [
  { question: "What is surface area?", options: ["The space inside a shape", "The total area of all faces of a 3D shape", "The length around a shape", "The weight of a shape"], correctIndex: 1, explanation: "Surface area is the total area of all the surfaces (faces) that cover a 3D shape.", formula: "Surface Area = Sum of all faces" },
  { question: "How many faces does a cube have?", options: ["4", "6", "8", "12"], correctIndex: 1, explanation: "A cube has 6 faces - top, bottom, front, back, left, and right." },
  { question: "What is the surface area of a cube with side 2cm?", options: ["8 cm²", "12 cm²", "24 cm²", "48 cm²"], correctIndex: 2, explanation: "Each face = 2 × 2 = 4 cm². A cube has 6 faces. Surface area = 6 × 4 = 24 cm²", formula: "SA = 6s²" },
  { question: "If you unfold a box, what do you get?", options: ["A circle", "A net", "A line", "A cube"], correctIndex: 1, explanation: "When you unfold a 3D shape, you get a flat pattern called a net." },
  { question: "A rectangular box is 3×4×5 cm. How many pairs of matching faces does it have?", options: ["2 pairs", "3 pairs", "4 pairs", "6 pairs"], correctIndex: 1, explanation: "A rectangular prism has 3 pairs of matching opposite faces." },
  { question: "What's the surface area of a cylinder (closed)?", options: ["2πr² + πrh", "2πr² + 2πrh", "πr² + 2πrh", "πr²h"], correctIndex: 1, explanation: "Cylinder SA = 2 circles (top + bottom) + rectangle (side). SA = 2πr² + 2πrh", formula: "SA = 2πr² + 2πrh" },
  { question: "Does a sphere have any flat faces?", options: ["Yes, one", "Yes, many", "No", "Yes, six"], correctIndex: 2, explanation: "A sphere has no flat faces - it's completely curved." },
  { question: "If you double all dimensions of a cube, what happens to surface area?", options: ["Doubles", "Triples", "Quadruples", "Increases 8 times"], correctIndex: 2, explanation: "Surface area depends on length². If length doubles, area quadruples (2² = 4).", formula: "New SA = 4 × Original SA" }
];

// Build & Balance City - Volume vs Surface Area
export const buildCityQuestions: QuizQuestion[] = [
  { question: "A shape with more volume and less surface area is:", options: ["More sphere-like", "More flat", "More spread out", "More spikey"], correctIndex: 0, explanation: "Spheres have the best volume-to-surface-area ratio. This is why bubbles are spherical!" },
  { question: "Why do igloos have a dome shape?", options: ["It looks nice", "Maximum inside space with minimum heat loss", "It's easy to build", "Snow only comes in round pieces"], correctIndex: 1, explanation: "Domes have good volume-to-surface-area ratio, keeping heat inside while using less material." },
  { question: "To maximize storage in a warehouse, you should:", options: ["Make it very flat", "Make it cube-like", "Make it very tall and thin", "Make many small rooms"], correctIndex: 1, explanation: "A cube-like shape provides more volume for a given surface area than flat or thin shapes." },
  { question: "A 1×1×8 box and a 2×2×2 box. Which has more volume?", options: ["The 1×1×8 box", "The 2×2×2 box", "They're equal", "Cannot tell"], correctIndex: 2, explanation: "1×1×8 = 8 cubic units. 2×2×2 = 8 cubic units. Same volume!", formula: "Both = 8 units³" },
  { question: "That same 1×1×8 vs 2×2×2. Which has more surface area?", options: ["The 1×1×8 box", "The 2×2×2 box", "They're equal", "Cannot tell"], correctIndex: 0, explanation: "1×1×8: SA = 2(1×1) + 4(1×8) = 34 units². 2×2×2: SA = 6(4) = 24 units². The long box has more surface area." },
  { question: "To minimize material cost for a fixed volume, choose:", options: ["Flat shapes", "Compact, cube-like shapes", "Long, thin shapes", "Shapes with many corners"], correctIndex: 1, explanation: "Compact shapes minimize surface area for a given volume, reducing material needs." },
  { question: "A building doubles in all dimensions. What happens to the floor area it covers?", options: ["Doubles", "Quadruples", "Increases 6 times", "Increases 8 times"], correctIndex: 1, explanation: "Floor area (length × width) quadruples when both dimensions double (2 × 2 = 4)." },
  { question: "That same building doubles in all dimensions. What happens to its volume?", options: ["Doubles", "Quadruples", "Increases 6 times", "Increases 8 times"], correctIndex: 3, explanation: "Volume (l × w × h) increases 8 times when all three dimensions double (2 × 2 × 2 = 8).", formula: "New Volume = 8 × Original" }
];

// Chance Garden - Probability as Likelihood
export const chanceGardenQuiz: QuizQuestion[] = [
  { question: "If a basket has 8 blue balls and 2 yellow balls, which color is MORE likely to come out?", options: ["Yellow", "Blue", "Both equally likely", "Cannot tell"], correctIndex: 1, explanation: "Blue is more likely because there are more blue balls (8) than yellow balls (2)." },
  { question: "A bag has 5 red marbles and 5 green marbles. What can we say about picking each color?", options: ["Red is more likely", "Green is more likely", "Both are equally likely", "Neither can be picked"], correctIndex: 2, explanation: "When there are equal amounts, both outcomes are equally likely." },
  { question: "Which event is CERTAIN to happen?", options: ["Rolling a 7 on a regular dice", "The sun rising tomorrow", "Flipping heads 10 times in a row", "Picking a red ball from a bag of only blue balls"], correctIndex: 1, explanation: "The sun rising is certain (probability = 1). The others are either impossible or unlikely." },
  { question: "If there are more blue balls in a basket than red balls, what does this mean?", options: ["Blue is less likely to be picked", "Blue is more likely to be picked", "Red is more likely to be picked", "Colors don't matter"], correctIndex: 1, explanation: "The more of something there is, the more likely it is to be chosen." },
  { question: "A jar has 1 gold coin and 99 silver coins. Is picking gold likely or unlikely?", options: ["Very likely", "Somewhat likely", "Unlikely", "Impossible"], correctIndex: 2, explanation: "With only 1 gold coin out of 100, picking gold is unlikely." },
  { question: "What word describes something that CANNOT happen?", options: ["Certain", "Likely", "Unlikely", "Impossible"], correctIndex: 3, explanation: "Impossible means something has zero chance of happening (probability = 0)." },
  { question: "If you add more red balls to a basket, what happens to the chance of picking red?", options: ["Decreases", "Stays the same", "Increases", "Becomes impossible"], correctIndex: 2, explanation: "Adding more of a color increases the chance of picking that color." },
  { question: "A spinner has a LARGE blue section and a SMALL red section. Which is more likely?", options: ["Red", "Blue", "Both equal", "Neither"], correctIndex: 1, explanation: "Larger sections on a spinner are more likely to be landed on." }
];

// Spinner & Dice Lab - Fairness and Comparing Outcomes
export const spinnerDiceLabQuiz: QuizQuestion[] = [
  { question: "A spinner has 4 equal sections. What is a FAIR spinner?", options: ["One section is bigger", "All sections are the same size", "One section always wins", "The spinner is broken"], correctIndex: 1, explanation: "A fair spinner has equal-sized sections, giving each outcome the same chance." },
  { question: "On a fair 6-sided dice, which number is most likely to be rolled?", options: ["1", "6", "They're all equally likely", "It depends"], correctIndex: 2, explanation: "On a fair dice, each number (1-6) has an equal chance of being rolled." },
  { question: "A spinner has half red and half blue. How would you describe this?", options: ["Unfair to red", "Unfair to blue", "Fair - both have equal chance", "Impossible to tell"], correctIndex: 2, explanation: "When sections are equal in size, the spinner is fair and both colors have equal chances." },
  { question: "If a spinner has 3 equal sections (red, blue, green), what's the chance of landing on red?", options: ["Very small", "About 1 in 3", "About 1 in 2", "Certain"], correctIndex: 1, explanation: "With 3 equal sections, each has a 1 in 3 (or 1/3) chance." },
  { question: "Which is MORE likely on a fair dice: rolling a 4 OR rolling a 1?", options: ["Rolling a 4", "Rolling a 1", "Both equally likely", "Rolling a 6"], correctIndex: 2, explanation: "On a fair dice, every number has the same chance, so 4 and 1 are equally likely." },
  { question: "A spinner has 75% blue and 25% red. Is this fair?", options: ["Yes, it's fair", "No, blue has more chance", "No, red has more chance", "It depends on who spins"], correctIndex: 1, explanation: "This spinner is unfair because blue takes up more space and is more likely." },
  { question: "To make an unfair spinner fair, you should:", options: ["Spin it faster", "Make all sections equal size", "Add more sections", "Remove all colors"], correctIndex: 1, explanation: "A fair spinner needs all sections to be equal in size." },
  { question: "A dice has three 1s and three 6s (no other numbers). What's special about this dice?", options: ["It's fair between all numbers 1-6", "It's fair between 1 and 6 only", "It always rolls 1", "It always rolls 6"], correctIndex: 1, explanation: "This dice is fair between 1 and 6 (each has 3 faces), but unfair for other numbers (0 chance)." }
];

// Prediction Park - Experimental Probability and Patterns
export const predictionParkQuiz: QuizQuestion[] = [
  { question: "You flip a coin 10 times and get 7 heads. What's the EXPERIMENTAL probability of heads?", options: ["50%", "70%", "30%", "100%"], correctIndex: 1, explanation: "Experimental probability = results you got / total tries = 7/10 = 70%." },
  { question: "If you run MORE experiments, what happens to your results?", options: ["They get less accurate", "They get closer to the true probability", "They stay exactly the same", "They become random"], correctIndex: 1, explanation: "More experiments give more reliable results that approach the true probability." },
  { question: "A ball drop gave: Red 40 times, Blue 60 times. Which is more likely based on this?", options: ["Red", "Blue", "Both equal", "Cannot tell"], correctIndex: 1, explanation: "Based on experiments, Blue happened more often (60 > 40), so Blue seems more likely." },
  { question: "You flip a coin and get heads 5 times in a row. What's most likely next?", options: ["Definitely heads", "Definitely tails", "Still 50-50 either way", "Impossible to flip again"], correctIndex: 2, explanation: "Each flip is independent - past results don't affect future ones. It's still 50-50!" },
  { question: "After many experiments, if bars show Red=30, Blue=50, Green=20, which is most likely?", options: ["Red", "Blue", "Green", "All equal"], correctIndex: 1, explanation: "Blue has the tallest bar (50), meaning it happened most often and is most likely." },
  { question: "What does it mean if experimental results don't match expected probability?", options: ["The math is wrong", "More experiments are needed", "Probability doesn't work", "The experiment is broken"], correctIndex: 1, explanation: "With few experiments, results can vary. More experiments help results match expected probability." },
  { question: "In 100 spins, Red appeared 25 times. What's the experimental probability of Red?", options: ["25%", "75%", "50%", "100%"], correctIndex: 0, explanation: "Experimental probability = 25/100 = 0.25 = 25%.", formula: "P(Red) = 25/100 = 25%" },
  { question: "Why do scientists repeat experiments many times?", options: ["They forget the results", "To get more reliable data", "Experiments are fun", "They have extra time"], correctIndex: 1, explanation: "Repeating experiments gives more data, making the results more reliable and accurate." }
];

// Share & Slice Café - Fractions (8 questions)
export const shareSliceQuiz: QuizQuestion[] = [
  { question: "If you cut a pizza into 4 equal slices and eat 1, what fraction did you eat?", options: ["1/2", "1/4", "1/3", "2/4"], correctIndex: 1, explanation: "You ate 1 out of 4 equal parts = 1/4." },
  { question: "A cake is cut into 8 equal pieces. 4 friends each take 2 pieces. Is this fair?", options: ["Yes", "No", "Not enough info", "Depends on cake size"], correctIndex: 0, explanation: "8 pieces ÷ 4 friends = 2 pieces each. Equal sharing is fair!" },
  { question: "Which fraction is bigger: 1/2 or 1/4?", options: ["1/4", "1/2", "They're equal", "Cannot compare"], correctIndex: 1, explanation: "1/2 is bigger because you're dividing into fewer pieces, so each piece is larger." },
  { question: "If 3 friends share 6 cookies equally, how many does each friend get?", options: ["1", "2", "3", "6"], correctIndex: 1, explanation: "6 cookies ÷ 3 friends = 2 cookies each." },
  { question: "What fraction of a pizza is left if you eat 3 out of 8 slices?", options: ["3/8", "5/8", "3/5", "8/3"], correctIndex: 1, explanation: "8 slices - 3 eaten = 5 remaining. That's 5/8 of the pizza left." },
  { question: "If you have 1/2 of a cake and get 1/2 more, how much cake do you have?", options: ["1/4", "1/2", "1 whole", "2 cakes"], correctIndex: 2, explanation: "1/2 + 1/2 = 2/2 = 1 whole cake!" },
  { question: "Which is the smallest fraction: 1/2, 1/3, or 1/4?", options: ["1/2", "1/3", "1/4", "All equal"], correctIndex: 2, explanation: "The bigger the bottom number, the smaller each piece. 1/4 is smallest." },
  { question: "If 2/4 of a chocolate bar is eaten, what simplified fraction is left?", options: ["2/4", "1/2", "1/4", "3/4"], correctIndex: 1, explanation: "2/4 eaten means 2/4 left. 2/4 simplifies to 1/2." },
];

// Liquid Measure Lab - Fractions, Decimals, Percentages (8 questions)
export const liquidLabQuiz: QuizQuestion[] = [
  { question: "Half a glass is the same as what percentage?", options: ["25%", "50%", "75%", "100%"], correctIndex: 1, explanation: "Half = 1/2 = 0.5 = 50%." },
  { question: "Which shows the same amount: 0.25 or 1/4?", options: ["0.25 is more", "1/4 is more", "They're equal", "Cannot compare"], correctIndex: 2, explanation: "0.25 and 1/4 are the same! 1÷4 = 0.25." },
  { question: "If a container is 75% full, what fraction is that?", options: ["1/2", "1/4", "3/4", "1/3"], correctIndex: 2, explanation: "75% = 75/100 = 3/4." },
  { question: "What decimal equals 1/2?", options: ["0.2", "0.5", "0.25", "0.75"], correctIndex: 1, explanation: "1 ÷ 2 = 0.5." },
  { question: "If a beaker is 0.1 full, what percentage is that?", options: ["1%", "10%", "100%", "0.1%"], correctIndex: 1, explanation: "0.1 = 10/100 = 10%." },
  { question: "What is 1/5 as a percentage?", options: ["5%", "15%", "20%", "25%"], correctIndex: 2, explanation: "1/5 = 0.2 = 20%." },
  { question: "Which is larger: 0.3 or 1/4?", options: ["0.3", "1/4", "They're equal", "Cannot compare"], correctIndex: 0, explanation: "0.3 = 30% and 1/4 = 25%. Since 30% > 25%, 0.3 is larger." },
  { question: "If you pour out 25% of a full container, what fraction remains?", options: ["1/4", "2/4", "3/4", "4/4"], correctIndex: 2, explanation: "100% - 25% = 75% remaining. 75% = 3/4." },
];

// Growing Money Garden - Interest & Growth (8 questions)
export const moneyGardenQuiz: QuizQuestion[] = [
  { question: "If you save $100 and it grows by 10%, how much do you have?", options: ["$100", "$110", "$10", "$1000"], correctIndex: 1, explanation: "10% of $100 = $10 growth. $100 + $10 = $110." },
  { question: "What happens to savings if you wait longer?", options: ["They shrink", "They stay the same", "They grow more", "They disappear"], correctIndex: 2, explanation: "With interest, money grows over time. Longer wait = more growth!" },
  { question: "If something grows by 50%, it becomes how many times the original?", options: ["0.5 times", "1 time (same)", "1.5 times", "2 times"], correctIndex: 2, explanation: "Original (1) + Growth (0.5) = 1.5 times the original." },
  { question: "Why is saving early better than saving later?", options: ["Money gets old", "More time to grow", "Banks close early", "It's not better"], correctIndex: 1, explanation: "Starting early gives your money more time to grow with interest!" },
  { question: "If $200 grows by 5%, what's the new amount?", options: ["$205", "$210", "$250", "$10"], correctIndex: 1, explanation: "5% of $200 = $10. $200 + $10 = $210.", formula: "Growth = Principal × Rate" },
  { question: "What does 'interest' mean in saving money?", options: ["The bank takes money", "Extra money you earn", "A type of loan", "A bank fee"], correctIndex: 1, explanation: "Interest is extra money you earn when you save. The bank pays you for keeping money with them!" },
  { question: "If a plant doubles in size, what percentage did it grow?", options: ["50%", "100%", "150%", "200%"], correctIndex: 1, explanation: "Doubling means it grew by 100% of its original size." },
  { question: "Which grows more: $100 at 10% or $50 at 20%?", options: ["$100 at 10%", "$50 at 20%", "Both grow the same", "Neither grows"], correctIndex: 2, explanation: "$100 × 10% = $10 and $50 × 20% = $10. Both grow by $10!" },
];
