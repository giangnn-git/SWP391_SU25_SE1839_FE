// utils/WarrantyCalculator.jsx

/**
 * Tính số năm giữa 2 date (làm tròn đến 0.5)
 */
const calculateYearsBetween = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return 0;

  try {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

    const diffTime = Math.abs(end - start);
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const diffYears = diffDays / 365.25;

    // Làm tròn đến 0.5 năm gần nhất
    return Math.round(diffYears * 2) / 2;
  } catch (error) {
    console.error("Error calculating years between dates:", error);
    return 0;
  }
};

export const calculateWarrantyPeriod = (partPolicies) => {
  if (
    !partPolicies ||
    !Array.isArray(partPolicies) ||
    partPolicies.length === 0
  ) {
    return null;
  }

  try {
    // Lấy tất cả các khoảng thời gian unique
    const uniquePeriods = [];
    const periodMap = new Map();

    partPolicies.forEach((policy) => {
      const key = `${policy.startDate}_${policy.endDate}`;
      if (!periodMap.has(key)) {
        periodMap.set(key, {
          startDate: policy.startDate,
          endDate: policy.endDate,
          durationPeriod: policy.durationPeriod,
          partCount: 0,
        });
      }
      periodMap.get(key).partCount++;
    });

    const periods = Array.from(periodMap.values());

    // DEBUG: Log để xem data
    console.log("🔍 WarrantyCalculator - periods:", periods);
    console.log("🔍 WarrantyCalculator - partPolicies:", partPolicies);

    // Nếu chỉ có 1 period duy nhất → đó là warranty period
    if (periods.length === 1) {
      const period = periods[0];
      const years = calculateYearsBetween(period.startDate, period.endDate);
      console.log("✅ Single period found:", { period, years });
      return {
        startDate: period.startDate,
        endDate: period.endDate,
        years: years,
      };
    }

    // Tìm period có nhiều part nhất (common warranty period)
    let maxPartCount = 0;
    let commonPeriod = null;

    periods.forEach((period) => {
      if (period.partCount > maxPartCount) {
        maxPartCount = period.partCount;
        commonPeriod = period;
      }
    });

    console.log("🎯 Most common period:", commonPeriod, "count:", maxPartCount);

    if (commonPeriod && commonPeriod.partCount > 0) {
      const years = calculateYearsBetween(
        commonPeriod.startDate,
        commonPeriod.endDate
      );
      console.log("✅ Common period calculated:", { commonPeriod, years });
      return {
        startDate: commonPeriod.startDate,
        endDate: commonPeriod.endDate,
        years: years,
      };
    }

    console.log("❌ No valid warranty period found");
    return null;
  } catch (error) {
    console.error(" Error calculating warranty period:", error);
    return null;
  }
};

/**
 * Tính warranty years (backward compatibility)
 */
export const calculateWarrantyYears = (partPolicies) => {
  const period = calculateWarrantyPeriod(partPolicies);
  return period ? period.years : 0;
};
