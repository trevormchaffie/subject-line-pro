// src/services/subjectLineService.js
const powerWordService = require("./powerWordService");

const analyzeSubjectLine = async (subjectLine) => {
  // Get all power words
  const powerWords = await powerWordService.getAllPowerWords();

  // Check for power words in the subject line
  const foundPowerWords = [];
  let powerWordScore = 0;

  for (const word of powerWords) {
    if (subjectLine.toLowerCase().includes(word.word.toLowerCase())) {
      foundPowerWords.push(word);
      powerWordScore += word.effectivenessRating;
    }
  }

  // Normalize score (0-100)
  const { min, max } = await powerWordService.getRatingScaleConfig();
  const maxPossibleScore = max * 5; // Assuming max 5 power words for full score
  const normalizedScore = Math.min(
    100,
    (powerWordScore / maxPossibleScore) * 100
  );

  // Include in the analysis results
  return {
    // ...other analysis results
    powerWords: {
      found: foundPowerWords,
      count: foundPowerWords.length,
      score: normalizedScore,
      suggestions: generatePowerWordSuggestions(
        subjectLine,
        powerWords,
        foundPowerWords
      ),
    },
  };
};

const generatePowerWordSuggestions = (
  subjectLine,
  allPowerWords,
  foundPowerWords
) => {
  // Generate suggestions for improving the subject line with power words
  // This is a simplified example
  if (foundPowerWords.length >= 2) {
    return []; // Already using enough power words
  }

  // Find high impact power words not already in use
  const suggestions = [];
  const highImpactWords = allPowerWords
    .filter((word) => word.effectivenessRating >= 4)
    .filter((word) => !foundPowerWords.some((found) => found.id === word.id))
    .slice(0, 3); // Just suggest up to 3

  if (highImpactWords.length > 0) {
    suggestions.push({
      type: "power_words",
      message:
        "Consider adding these high-impact power words to increase effectiveness",
      suggestions: highImpactWords.map((word) => ({
        word: word.word,
        description: word.description,
      })),
    });
  }

  return suggestions;
};
