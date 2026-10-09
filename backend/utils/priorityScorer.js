/**
 * Calculates the priority score of a court case based on specifications:
 * - Case older than 5 years: +50
 * - Criminal Case: +30
 * - Women Safety: +25
 * - Senior Citizen: +20
 * - Child Related: +20
 * - More than 5 adjournments: +15
 * 
 * @param {Object} caseData - The case data containing caseType, filingDate, adjournmentCount, flags
 * @returns {number} The calculated priority score
 */
const calculatePriorityScore = (caseData) => {
  let score = 0;
  
  // 1. Case older than 5 years (+50)
  if (caseData.filingDate) {
    const filing = new Date(caseData.filingDate);
    const now = new Date();
    const diffTime = Math.abs(now - filing);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffYears = diffDays / 365.25;
    
    if (diffYears > 5) {
      score += 50;
    }
  }

  // 2. Criminal Case (+30)
  if (caseData.caseType === 'Criminal') {
    score += 30;
  }

  // 3. Women Safety (+25)
  if (caseData.isWomenSafety) {
    score += 25;
  }

  // 4. Senior Citizen (+20)
  if (caseData.isSeniorCitizen) {
    score += 20;
  }

  // 5. Child Related (+20)
  if (caseData.isChildRelated) {
    score += 20;
  }

  // 6. More than 5 adjournments (+15)
  if (caseData.adjournmentCount && caseData.adjournmentCount > 5) {
    score += 15;
  }

  return score;
};

module.exports = { calculatePriorityScore };
