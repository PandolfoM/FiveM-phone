export function compareTime(armyTime: string) {
  // Parse the army time string into a Date object
  const armyTimeArray = armyTime.split(":");
  const hours = parseInt(armyTimeArray[0]);
  const minutes = parseInt(armyTimeArray[1]);
  const armyDate = new Date();
  armyDate.setHours(hours);
  armyDate.setMinutes(minutes);

  // Calculate the time difference in milliseconds
  const timeDifference = Date.now() - armyDate.getTime();

  // Convert the time difference to minutes
  const minutesDifference = Math.floor(timeDifference / (1000 * 60));

  // Format the result
  if (minutesDifference < 1) {
    return "just now";
  } else if (minutesDifference === 1) {
    return "1 minute ago";
  } else if (minutesDifference < 60) {
    return minutesDifference + " minutes ago";
  } else {
    const hoursDifference = Math.floor(minutesDifference / 60);
    if (hoursDifference === 1) {
      return "1 hour ago";
    } else {
      return hoursDifference + " hours ago";
    }
  }
}

export function formatPhoneNumber(number: string) {
  // Remove all non-digit characters from the phone number
  const cleaned = ("" + number).replace(/\D/g, "");

  // Extract the first 3 digits
  const areaCode = cleaned.slice(0, 3);

  // Extract the next 3 digits
  const middlePart = cleaned.slice(3, 6);

  // Extract the last 4 digits
  const lastPart = cleaned.slice(6, 10);

  // Format the phone number as (111) 222-333
  return `(${areaCode}) ${middlePart}-${lastPart}`;
}

export function secondsToTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const remainingMinutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  const formattedMinutes =
    remainingMinutes < 10 ? `0${remainingMinutes}` : remainingMinutes;
  const formattedSeconds =
    remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
  return `${hours}:${formattedMinutes}:${formattedSeconds}`;
}

export function GetCurrentDateKey() {
  const CurrentDate = new Date();
  const CurrentMonth = CurrentDate.getMonth();
  const CurrentDOM = CurrentDate.getDate();
  const CurrentYear = CurrentDate.getFullYear();
  const CurDate = "" + CurrentDOM + "-" + CurrentMonth + "-" + CurrentYear + "";

  return CurDate;
}

export function FormatMessageTime() {
  const NewDate = new Date();
  const NewHour = NewDate.getHours();
  const NewMinute = NewDate.getMinutes();
  let Minutessss = NewMinute;
  let Hourssssss = NewHour;
  if (NewMinute < 10) {
    Minutessss = 0 + NewMinute;
  }
  if (NewHour < 10) {
    Hourssssss = 0 + NewHour;
  }
  const MessageTime = Hourssssss + ":" + Minutessss;
  return MessageTime;
}