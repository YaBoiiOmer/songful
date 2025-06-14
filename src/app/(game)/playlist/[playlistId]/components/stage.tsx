export const Stage = {
  FIRST: 0.1,
  SECOND: 0.5,
  THIRD: 1,
  FOURTH: 3,
  FIFTH: 5,
  SIXTH: 15,
  COOKED: 30,
  GAME_OVER: 0,
};

export const getStageColor = (stage: keyof typeof Stage, type: "bg" | "text") => {
  switch (stage) {
    case "FIRST":
      return `${type}-red-600`;
    case "SECOND":
      return `${type}-orange-600`;
    case "THIRD":
      return `${type}-orange-400`;
    case "FOURTH":
      return `${type}-yellow-400`;
    case "FIFTH":
      return `${type}-green-400`;
    case "SIXTH":
      return `${type}-purple-500`;
    case "COOKED":
      return `${type}-black`;
  }
};
