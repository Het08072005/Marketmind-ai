/**
 * Utility for Indian Capital Markets (NSE/BSE) Trading Hours & Timings.
 * Trading Days: Monday - Friday (excluding exchange holidays)
 * Pre-Market: 09:00 - 09:15 IST
 * Regular Market Hours: 09:15 - 15:30 IST
 * Post-Market Closing Session: 15:30 - 16:00 IST
 * Closed: 16:00 - 09:00 IST & Weekends (Saturday, Sunday)
 */

export function getIndianMarketStatus(customDate = null) {
  const now = customDate ? new Date(customDate) : new Date();

  const formatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const partMap = {};
  parts.forEach((p) => {
    partMap[p.type] = p.value;
  });

  const hours = parseInt(partMap.hour, 10) || 0;
  const minutes = parseInt(partMap.minute, 10) || 0;
  const seconds = parseInt(partMap.second, 10) || 0;
  const totalMinutes = hours * 60 + minutes;

  // Day of week: 0 = Sun, 1 = Mon, ..., 6 = Sat
  const weekdayStr = (partMap.weekday || "").toLowerCase();
  const isWeekend = weekdayStr.startsWith("sat") || weekdayStr.startsWith("sun");

  let status = "CLOSED";
  let statusLabel = "Market Closed";
  let isOpen = false;
  let isPreMarket = false;
  let isPostMarket = false;
  let statusColor = "#DC2626"; // red
  let statusBg = "rgba(220, 38, 38, 0.08)";
  let sessionDesc = "Quotes As Of 15:30 IST Closing";

  if (isWeekend) {
    status = "CLOSED";
    statusLabel = "Market Closed";
    isOpen = false;
    sessionDesc = "Weekend · Reopens Mon 09:15 AM IST";
  } else if (totalMinutes >= 540 && totalMinutes < 555) {
    // 09:00 - 09:15 IST
    status = "PRE_OPEN";
    statusLabel = "Pre-Open Session";
    isPreMarket = true;
    isOpen = false;
    statusColor = "#D97706";
    statusBg = "rgba(217, 119, 6, 0.08)";
    sessionDesc = "Price discovery · 09:00 - 09:15 IST";
  } else if (totalMinutes >= 555 && totalMinutes < 930) {
    // 09:15 - 15:30 IST
    status = "OPEN";
    statusLabel = "Market Live";
    isOpen = true;
    statusColor = "#16A34A";
    statusBg = "rgba(22, 163, 74, 0.08)";
    sessionDesc = "Continuous Regular Trading · Live Quotes";
  } else if (totalMinutes >= 930 && totalMinutes < 960) {
    // 15:30 - 16:00 IST
    status = "POST_MARKET";
    statusLabel = "Post-Market Session";
    isPostMarket = true;
    isOpen = false;
    statusColor = "#D97706";
    statusBg = "rgba(217, 119, 6, 0.08)";
    sessionDesc = "Closing Settlement & Official VWAP Fix";
  } else {
    // Before 09:00 or after 16:00
    status = "CLOSED";
    statusLabel = "Market Closed";
    isOpen = false;
    sessionDesc = "Session Closed · Quotes Frozen at 15:30 IST";
  }

  const shortLabel = isOpen ? "NSE · LIVE" : isPreMarket ? "PRE-OPEN" : isPostMarket ? "POST-CLOSE" : "NSE · CLOSED";
  const dateStr = `${partMap.day} ${partMap.month} ${partMap.year}`;
  const timeStr = `${partMap.hour}:${partMap.minute}:${partMap.second}`;
  const fullDateTimeStr = `${partMap.weekday}, ${dateStr} · ${timeStr} IST`;

  return {
    status,
    statusLabel,
    shortLabel,
    isOpen,
    isPreMarket,
    isPostMarket,
    isWeekend,
    statusColor,
    statusBg,
    sessionDesc,
    dateStr,
    timeStr,
    weekday: partMap.weekday,
    fullDateTimeStr,
    hours,
    minutes,
    seconds,
  };
}
