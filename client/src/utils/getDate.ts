export const getNowDate = (): string => {
  const now = new Date();
  return formatTimestamp(now.toISOString());
};

export const getStartDate = (type?: string): string => {
  const date = new Date();

  if (type === "week") {
    const day = date.getDay();
    const diff = date.getDate() - day;
    date.setDate(diff);
  }

  date.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정
  return formatTimestamp(date.toISOString()); // 변환된 시간을 반환
};

export const formatTimestamp = (isoString: string): string => {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const toISOWithTimezone = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toISOString();
};
