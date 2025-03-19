import { spamTriggers } from "../data/spamTriggers";
import { powerWords } from "../data/powerWords";

// Analyzes a subject line and returns comprehensive analysis results
export const analyzeSubjectLine = (subjectLine) => {
  // Normalize input
  const normalizedSubject = subjectLine.toLowerCase();
  const words = normalizedSubject.split(/\s+/);

  // Basic metrics
  const length = subjectLine.length;
  const wordCount = words.length;

  // Analyze spam triggers
  const foundSpamTriggers = spamTriggers.filter((trigger) =>
    normalizedSubject.includes(trigger.word.toLowerCase())
  );

  // Calculate spam score (0-100, higher is worse)
  const spamScore = calculateSpamScore(foundSpamTriggers, subjectLine);

  // Find power words
  const foundPowerWords = powerWords.filter((powerWord) =>
    words.some((word) => word === powerWord.word.toLowerCase())
  );

  // Length score (0-100)
  const lengthScore = calculateLengthScore(length);

  // Capitalization check
  const capsIssue = checkCapitalization(subjectLine);

  // Overall effectiveness score (0-100)
  const overallScore = calculateOverallScore({
    spamScore,
    lengthScore,
    powerWordsCount: foundPowerWords.length,
    hasCapsIssue: !!capsIssue,
    wordCount,
  });

  // Generate suggestions
  const suggestions = generateSuggestions({
    subjectLine,
    length,
    wordCount,
    spamScore,
    foundSpamTriggers,
    foundPowerWords,
    capsIssue,
  });

  // Compile issues
  const issues = [
    ...foundSpamTriggers.map((trigger) => ({
      text: `Contains spam trigger word "${trigger.word}"`,
      impact: trigger.impact,
    })),
    capsIssue ? { text: capsIssue, impact: "medium" } : null,
    length > 70 ? { text: "Subject line is too long", impact: "medium" } : null,
    length < 20 ? { text: "Subject line is too short", impact: "low" } : null,
    wordCount < 3 ? { text: "Too few words", impact: "medium" } : null,
  ].filter(Boolean);

  return {
    subjectLine,
    length,
    wordCount,
    spamScore,
    overallScore,
    powerWords: foundPowerWords.map((pw) => pw.word),
    issues,
    suggestions,
    hasPunctuation: /[!?.]/.test(subjectLine),
  };
};

// Calculate spam score based on found triggers and other factors
const calculateSpamScore = (foundTriggers, subjectLine) => {
  if (foundTriggers.length === 0) return 0;

  // Base score from triggers
  let score = 0;
  foundTriggers.forEach((trigger) => {
    switch (trigger.impact) {
      case "high":
        score += 25;
        break;
      case "medium":
        score += 15;
        break;
      case "low":
        score += 5;
        break;
      default:
        score += 10;
    }
  });

  // Adjust for ALL CAPS sections
  if (subjectLine.match(/[A-Z]{3,}/)) {
    score += 15;
  }

  // Adjust for excessive punctuation
  if (subjectLine.match(/[!]{2,}/)) {
    score += 20;
  }

  return Math.min(100, score);
};

// Calculate score based on subject line length
const calculateLengthScore = (length) => {
  if (length < 20) return 50;
  if (length <= 50) return 100;
  if (length <= 70) return 80;
  return 60;
};

// Check for capitalization issues
const checkCapitalization = (subjectLine) => {
  if (subjectLine.match(/[A-Z]{3,}/)) {
    return "Contains words in ALL CAPS";
  }
  if (subjectLine === subjectLine.toUpperCase()) {
    return "Entire subject is in ALL CAPS";
  }
  return null;
};

// Calculate overall effectiveness score
const calculateOverallScore = ({
  spamScore,
  lengthScore,
  powerWordsCount,
  hasCapsIssue,
  wordCount,
}) => {
  // Start with base score
  let score = 70;

  // Adjust for spam score (negative impact)
  score -= spamScore * 0.4;

  // Adjust for length (positive impact)
  score += lengthScore * 0.2;

  // Adjust for power words (positive impact)
  score += powerWordsCount * 5;

  // Cap power word bonus
  if (powerWordsCount > 3) {
    score -= (powerWordsCount - 3) * 3; // Too many power words becomes negative
  }

  // Penalty for ALL CAPS
  if (hasCapsIssue) {
    score -= 15;
  }

  // Penalty for very short or very long word count
  if (wordCount < 3 || wordCount > 15) {
    score -= 10;
  }

  // Ensure score stays within 0-100
  return Math.min(100, Math.max(0, Math.round(score)));
};

// Generate helpful suggestions
const generateSuggestions = ({
  subjectLine,
  length,
  wordCount,
  spamScore,
  foundSpamTriggers,
  foundPowerWords,
  capsIssue,
}) => {
  const suggestions = [];

  // Length suggestions
  if (length < 20) {
    suggestions.push(
      "Add more detail to increase subject line length (aim for 30-50 characters)"
    );
  } else if (length > 70) {
    suggestions.push(
      "Shorten your subject line to 50-70 characters for better deliverability"
    );
  }

  // Spam trigger suggestions
  if (foundSpamTriggers.length > 0) {
    suggestions.push(
      `Replace spam trigger words: ${foundSpamTriggers
        .map((t) => t.word)
        .join(", ")}`
    );
  }

  // Power word suggestions
  if (foundPowerWords.length === 0) {
    const suggestedPowerWords = powerWords
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((pw) => pw.word);
    suggestions.push(
      `Consider adding power words like: ${suggestedPowerWords.join(", ")}`
    );
  } else if (foundPowerWords.length > 3) {
    suggestions.push("Using too many power words can reduce effectiveness");
  }

  // Capitalization suggestions
  if (capsIssue) {
    suggestions.push("Avoid using ALL CAPS as it can trigger spam filters");
  }

  // Personalization suggestion
  if (
    !subjectLine.includes("[") &&
    !subjectLine.toLowerCase().includes("you")
  ) {
    suggestions.push("Add personalization to increase engagement");
  }

  // Length guideline
  if (wordCount < 3) {
    suggestions.push("Use at least 3-5 words for better impact");
  } else if (wordCount > 15) {
    suggestions.push("Consider reducing word count for better readability");
  }

  return suggestions;
};
