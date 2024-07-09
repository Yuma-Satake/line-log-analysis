const fs = require("fs");

// ランダムに0.5-1秒待つ関数
const wait = () => {
  return new Promise((resolve) => {
    const randomTime = Math.floor(Math.random() * 500) + 500;
    setTimeout(() => {
      resolve();
    }, randomTime);
  });
};

function getTotalMinutes(year, month) {
  const date = new Date(year, month, 0);
  const daysInMonth = date.getDate();
  const minutesPerDay = 24 * 60;
  const totalMinutes = daysInMonth * minutesPerDay;
  return totalMinutes;
}

const main = async () => {
  const args = process.argv.slice(2);
  const currentYear = new Date().getFullYear();
  const currentMonth = Number(
    (() => {
      const monthParam = args[0];
      if (!monthParam) return new Date().getMonth() + 1;
      if (isNaN(monthParam)) return monthParam.split("")[0];
      return monthParam;
    })(),
  );

  console.log("\n🚀Target:", currentYear, "年", currentMonth, "月");
  await wait();

  const currentPath = __dirname;
  const filePath = `${currentPath}/momo.txt`;

  fs.readFile(filePath, "utf8", async (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const lineChatData = data.split("\n");
    console.log("✅FileRead...");
    await wait();
    console.log("⌛️Processing...");
    await wait();

    let nowDay = "";
    const chatData = lineChatData.map((line) => {
      if (line.includes("2024/")) {
        nowDay = line.replace("\r", "");
      }
      const [time, name, message] = line.split("\t");
      return { time, name, message: message?.replace("\r", ""), date: nowDay };
    });

    const currentMonthChatData = chatData.filter((chat) => {
      const [year, month] = chat.date.split("/");
      return Number(year) === currentYear && Number(month) === currentMonth;
    });

    const currentMonthCallData = currentMonthChatData.filter((chat) => {
      if (!chat.message) return false;
      return chat.message.includes("Call");
    });

    fs.writeFile("result.js", JSON.stringify(currentMonthCallData), (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("✅Data written to result.js");
    });

    const currentMonthCallCount = currentMonthCallData.length.toString();
    const currentMonthCallTime = currentMonthCallData.reduce((acc, chat) => {
      const time = chat.message.split(" ")[3];
      const splitText = time.split("");
      const count = splitText.filter((text) => text === ":").length;
      if (count === 1) {
        const [min, sec] = time.split(":");
        return acc + Number(min) * 60 + Number(sec);
      }
      const [hour, min, sec] = time.split(":");
      return acc + Number(hour) * 60 * 60 + Number(min) * 60 + Number(sec);
    }, 0);

    const callTimeHour = Math.floor(currentMonthCallTime / 60 / 60).toLocaleString();
    const callTimeMinute = Math.floor(currentMonthCallTime / 60).toLocaleString();
    const totalMinutes = getTotalMinutes(currentYear, currentMonth);
    const percentage = (currentMonthCallTime / totalMinutes).toFixed(2);

    console.log("------------------------------------");
    console.log(`${currentMonth}月の通話回数: `, currentMonthCallCount, "回");
    console.log(`${currentMonth}月の通話時間: `, callTimeHour, "時間", callTimeMinute, "分");
    console.log(`1ヶ月中の割合: `, percentage, "%");
    console.log("------------------------------------");
  });
};

main();
