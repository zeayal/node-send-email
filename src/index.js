const schedule = require("node-schedule");
const axios = require("axios");
const dotenv = require("dotenv");
const { sendEmail } = require("./service/email");

// 加载环境变量
const envConfig = dotenv.config();
if (envConfig.error) {
  throw envConfig.error;
}

for (const key in envConfig.parsed) {
  process.env[key] = envConfig.parsed[key];
}

// 定时执行规则 https://segmentfault.com/a/1190000022455361
let rule = new schedule.RecurrenceRule();

// 每隔 60 秒执行一次
// rule.second = [0];

// 每小时30分执行
rule.minute = 30;
rule.second = 0;

const job = schedule.scheduleJob(rule, () => {
  getCoinPrirce({
    coinId: "DOGE",
    expectedPrice: 0.4,
  });
});

async function getCoinPrirce(
  { coinId, expectedPrice } = { coinId: "DOGE", expectedPrice: 0.3 }
) {
  console.log(coinId, expectedPrice);
  try {
    // https://www.coindog.com/type/jinse/market
    const res = await axios.get(
      "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest",
      {
        headers: {
          "X-CMC_PRO_API_KEY": process.env.COIN_MARKET_X_CMC_PRO_API_KEY,
        },
        params: {
          start: 1,
          limit: 20
        }
      }
    );
    const coins = res.data ? res.data.data : {};
    // console.log("coins", coins);
    if (Array.isArray(coins)) {
      const selectedCoin = coins.find((item) => item.symbol === coinId);
      // console.log("selectedCoin", selectedCoin);
      // 发送价格，测试服务稳定性
      // if (selectedCoin && selectedCoin.quote.USD.price >= expectedPrice) {
        // 发送邮件
        console.log("发送邮件", Date.now(), selectedCoin);
        sendEmail({
          from: process.env.EMAIL_FORM,
          to: process.env.EMAIL_TO.split(","),
          subject: `gmail提示-$${selectedCoin.quote.USD.price}`,
          text: `$${selectedCoin.quote.USD.price}`,
          html: `<b>$${selectedCoin.quote.USD.price}</b>`,
        }).catch(console.error);
      // }
    }
  } catch (e) {
    console.log("请求失败， 接下来进行重试", e);
    getCoinPrirce({
      coinId: "DOGE",
      expectedPrice: 0.4,
    });
  }
}
