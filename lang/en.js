// English text and settings for the hummingbird CODAP activity.
// To add a language: copy this file (e.g. lang/es.js), translate the text,
// and set `attributes` to the column names used in that language's CSV.
window.ACTIVITY_LANG = {
  code: "en",

  // Column names exactly as they appear in this language's CSV header.
  attributes: {
    feeders: "feeder abundance",
    beak: "beak pointiness",
    sex: "male or female",
    year: "year"
  },

  frameTitle: "Hummingbird detective",
  title: "Hummingbird detective",
  intro: "People put out sugar-water feeders for hummingbirds. Did the feeders change the shape of their beaks?",
  beakBlunt: "less pointy",
  beakPointy: "more pointy",

  // Intro screen shown before the missions start.
  story: {
    title: "Meet Anna's hummingbird",
    paragraphs: [
      "Anna's hummingbird is a tiny bird that lives in California. It weighs less than a nickel! The males have a shiny pink head.",
      "Lots of people hang sugar-water feeders in their yards. Hummingbirds poke their beaks into the feeders to drink the sweet sugar-water. Scientists wondered: did all those feeders change the hummingbirds' beaks?",
      "To find out, they measured the beaks of hummingbirds kept in museums. Some birds are more than 100 years old!",
      "Now it's your turn. Be a data detective and look at the same data the scientists used."
    ],
    videoTitle: "Anna's hummingbird (Macaulay Library)",
    start: "Start mission"
  },

  missions: {
    1: "Mission 1: Explore the data",
    2: "Mission 2: Follow the feeders",
    3: "Mission 3: Feeders and beaks"
  },

  broken: "Oops, this changed! Do this step again to keep going.",

  missionDone: {
    1: { title: "Mission 1 complete!", body: "You can make a graph, sort the birds, and let CODAP count. Now let's find out what happened to the feeders." },
    2: { title: "Mission 2 complete!", body: "Feeders went up over the years. Now for the big question: did the beaks change too?" }
  },
  nextMission: n => `Go to mission ${n}`,

  progress: (done, total) => `${done} of ${total} steps done`,

  steps: {
    graph: {
      title: "Make a graph",
      body: "Each row in the table is one hummingbird. Click the Graph button in the toolbar at the top of CODAP.",
      done: "You made a graph. Each dot is one hummingbird."
    },
    sexaxis: {
      title: "Sort the birds",
      body: "In the table, find the column “male or female”. Drag its name to the bottom edge of the graph.",
      done: "The birds are sorted into two groups."
    },
    dot: {
      title: "What is a dot?",
      body: "Look at the graph. What does one dot stand for?",
      choices: { bird: "One hummingbird", feeder: "One feeder", county: "One county" },
      correct: "Right! Every dot is a real hummingbird from a museum.",
      wrong: "Not quite. Click a dot and see which row lights up in the table."
    },
    showcount: {
      title: "Let CODAP count",
      body: "Click the graph. Then click the ruler button on its right side and check the box “Count”.",
      done: "Now each group shows how many birds it has."
    },
    count: {
      title: "Read the numbers",
      body: "Look at the numbers on the graph. Which group has more birds?",
      choices: { male: "Males", female: "Females", same: "About the same" },
      correct: "Yes! The museums have more males than females.",
      wrong: "Look again: which group has the bigger number?"
    },
    yearaxis: {
      title: "Time on the bottom",
      body: "Drag “year” to the bottom edge of the graph. It will replace “male or female”.",
      done: "Old birds are on the left, new birds on the right."
    },
    feedaxis: {
      title: "Feeders on the side",
      body: "Now drag “feeder abundance” to the left edge of the graph. Higher means more feeders where the bird lived.",
      done: "Now you can see feeders over time."
    },
    yearline: {
      title: "Add a trend line",
      body: "Click the ruler button again and check “Least Squares Line”. The line shows the overall pattern of all the dots.",
      done: "The trend line is on."
    },
    trend: {
      title: "What happened to feeders?",
      body: "Follow the line from the oldest birds (left) to the newest birds (right). What happened to the number of feeders?",
      choices: { up: "More feeders", down: "Fewer feeders", flat: "No change" },
      correct: "Yes! Over 100 years, people put out more and more feeders.",
      wrong: "Look again: are the dots on the right higher or lower than the dots on the left?"
    },
    predict: {
      title: "Make a prediction",
      body: "Where there are lots of feeders, what do you think the beaks look like?",
      choices: { pointy: "More pointy", blunt: "Less pointy", same: "No difference" },
      done: "Prediction saved. Let's find out!"
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
      body: "The trend line should still be on from Mission 2. If you can't see it, click the ruler button and check “Least Squares Line”.",
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
