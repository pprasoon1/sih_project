// A map of all available badges in the system
const badgeDefinitions = {
  first_report: { name: "First Report", icon: "📝" },
  problem_solver_1: { name: "Problem Solver I", icon: "✅" },
  problem_solver_5: { name: "Problem Solver V", icon: "⭐⭐" },
  community_voice_10: { name: "Community Voice", icon: "🗣️" },
};

// Calculates user's rank and progress based on points
export const calculateRank = (points) => {
  if (points >= 200) {
    return { rank: "Civic Champion", pointsToNextRank: 0 };
  }
  if (points >= 100) {
    return { rank: "Senior Reporter", pointsToNextRank: 200 - points };
  }
  if (points >= 25) {
    return { rank: "Community Reporter", pointsToNextRank: 100 - points };
  }
  return { rank: "New Reporter", pointsToNextRank: 25 - points };
};

// Takes an array of badge IDs and returns full badge objects
export const getBadgeDetails = (badgeIds) => {
  return badgeIds.map(id => ({ id, ...badgeDefinitions[id] })).filter(Boolean);
};