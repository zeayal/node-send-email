const schedule = require("node-schedule");
const axios = require("axios");
const dotenv = require('dotenv');
const { sendEmail } = require("./service/email");

// 加载环境变量
const envConfig = dotenv.config()
if (envConfig.error) {
  throw envConfig.error
}

for(const key in envConfig.parsed) {
    process.env[key] = envConfig.parsed[key];
}

console.log(envConfig.parsed)

// 定时执行规则 https://segmentfault.com/a/1190000022455361
let rule = new schedule.RecurrenceRule();

// 每隔 10 秒执行一次
rule.second = [0, 10, 20, 30, 40, 50]; 

// 每小时30分执行
// rule.minute = 30;
// rule.second = 0;


const job = schedule.scheduleJob(rule, () => {
  getCoinPrirce({
    coinId: 'dogecoin',
    expectedPrice: 0.1
  });
});

async function getCoinPrirce(
  { coinId, expectedPrice } = { coinId: "dogecoin", expectedPrice: 0.3 }
) {
  console.log(coinId, expectedPrice);
  const res = await axios.get(
    "https://fxhapi.feixiaohao.com/public/v1/ticker?limit=30"
  );
  const coins = res.data;
  if (Array.isArray(coins)) {
    const selectedCoin = coins.find((item) => item.id === coinId);
    if (selectedCoin && selectedCoin.price_usd >= expectedPrice) {
      // 发送邮件
      sendEmail({
        from: process.env.EMAIL_FORM,
        to: process.env.EMAIL_TO.split(','),
        subject: "gmail提示",
        text: `${coinId}-价格变动`,
        html: `<b>${coinId}-当前价格$${selectedCoin.price_usd}</b>`,
      }).catch(console.error);
    }
  }
}
