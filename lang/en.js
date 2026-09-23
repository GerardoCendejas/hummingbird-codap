// English text and settings for the hummingbird CODAP activity.
// To add a language: copy this file (e.g. lang/es.js), translate the text,
// and set `attributes` to the column names used in that language's CSV.
window.ACTIVITY_LANG = {
  code: "en",

  // Column names exactly as they appear in this language's CSV header.
  attributes: {
    feeders: "feeder abundance",
    beak: "beak pointiness"
  },

  frameTitle: "Hummingbird detective",
  title: "Hummingbird detective",
  intro: "People put out sugar-water feeders for hummingbirds. Did the feeders change the shape of their beaks?",
  beakBlunt: "less pointy",
  beakPointy: "more pointy",

  progress: (done, total) => `${done} of ${total} steps done`,

  steps: {
    predict: {
      title: "Make a prediction",
      body: "Where there are lots of feeders, what do you think the beaks look like?",
      choices: { pointy: "More pointy", blunt: "Less pointy", same: "No difference" },
      done: "Prediction saved. Let's find out!"
    },
    graph: {
      title: "Make a graph",
      body: "Click the Graph button in the toolbar at the top of CODAP.",
      done: "You made a graph."
    },
    xaxis: {
      title: "Put feeders on the bottom",
      body: "In the table, find the column “feeder abundance”. Drag its name to the bottom edge of the graph.",
      swapped: "Almost! Feeders and beaks are switched. Feeders go on the bottom, beaks on the side.",
      done: "Feeders are on the bottom axis."
    },
    yaxis: {
      title: "Put beaks on the side",
      body: "Now drag “beak pointiness” to the left edge of the graph. Each dot is one hummingbird.",
      done: "Every dot is a real hummingbird from a museum."
    },
    line: {
      title: "Add a trend line",
      body: "Click the ruler button next to the graph and turn on “Least Squares Line”.",
      done: "The line shows the overall pattern in all the dots."
    },
    compare: {
      title: "Read the line",
      body: "Follow the line from left to right. What does it do?",
      choices: { up: "It goes up", down: "It goes down", flat: "It stays flat" },
      correct: "Yes! Where there are more feeders, beaks tend to be pointier.",
      wrong: "Look again: follow the line from the left side to the right side. Is the right end higher or lower?",
      matched: "Your prediction was right. Nice thinking!",
      notMatched: "Your prediction was different. That's okay: scientists get surprised by their data all the time."
    },
    map: {
      title: "Where did the birds live?",
      body: "Click the Map button in the toolbar to see where each hummingbird was found.",
      done: "Each dot on the map is one hummingbird."
    }
  },

  finish: {
    title: "Case solved!",
    body: "You found the same pattern the scientists found. Not every dot follows the line, but together they show a trend."
  },

  notInCodap: "This panel works inside CODAP. Open the activity link your teacher gave you.",
  bonus: "Bonus"
};
