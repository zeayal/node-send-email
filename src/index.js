require('dotenv').config()
const schedule = require("node-schedule");
const axios = require("axios");


console.log('process.env.EMAIL_SMTP_HOST', process.env.EMAIL_SMTP_HOST);

const { sendEmail } = require("./service/email");
const logger = require("./service/logger");

// for (const key in envConfig.parsed) {
//   process.env[key] = envConfig.parsed[key];
// }

// 定时执行规则 https://segmentfault.com/a/1190000022455361
let rule = new schedule.RecurrenceRule();

// 每隔 60 秒执行一次
// rule.second = [0];

// 每小时30分执行
rule.minute = [0, 10, 20, 30, 40, 50];
rule.second = 0;

const job = schedule.scheduleJob(rule, () => {
  startRequest();
});

const startRequest = () => {
  getCoinPrirce({
    coinId: process.env.COINID || "BTC",
    expectedPrice: process.env.EXPECTEDPRICE || 100000,
  });
};

startRequest();

async function getCoinPrirce({ coinId, expectedPrice }) {
  const timestemp = Date.now();
  const CONTRACT =
    process.env.CONTRACT || "0x882c173bc7ff3b7786ca16dfed3dfffb9ee7847b";
  const CHAIN = process.env.CHAIN || "bsc";

  try {
    const url = `https://avedex.cc/v1api/v1/tokens/${CONTRACT}-${CHAIN}`;
    logger.info("发送请求", coinId, url);
    const res = await axios.get(`${url}?t=${timestemp}`, {
      headers: {
        "sec-ch-ua": `"Google Chrome";v="95", "Chromium";v="95", ";Not A Brand";v="99"`,
        DNT: "1",
        "sec-ch-ua-mobile": "?0",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36",
        "sec-ch-ua-platform": "macOS",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        Referer: `${url}`,
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language":
          "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,zh-TW;q=0.6,ja;q=0.5",
        Cookie:
          "_ga=GA1.1.1561920205.1635414544; _ga_LFKW8KRD0V=GS1.1.1636421584.8.0.1636421584.0",
      },
    });
    const token = res?.data?.token || {};

    if (token?.current_price_usd) {
      const { current_price_usd } = token || {};
      // console.log("selectedCoin", selectedCoin);
      // 发送价格，测试服务稳定性
      // if (selectedCoin && selectedCoin.quote.USD.price >= expectedPrice) {
      // 发送邮件
      logger.info("请求到价格", coinId, current_price_usd);
      sendEmail({
        from: process.env.EMAIL_FORM,
        to: process.env.EMAIL_TO.split(","),
        subject: `${coinId}-${current_price_usd}`,
        text: `$${current_price_usd}`,
        html: `<b>$${current_price_usd}</b>`,
      }).catch((e) => {
        console.log(Date.now(), "发送邮件失败， 10分钟后进行重试", e);
        logger.error("发送邮件失败，10分钟后进行重试", coinId, e);
        setTimeout(() => startRequest(), 6000 * 10);
      });
    } else {
      logger.error("未查询到价格，10分钟后进行重试", coinId);
      setTimeout(() => startRequest(), 6000 * 10);
    }
  } catch (e) {
    logger.error("axios 请求失败， 10分钟后进行重试", e);
    setTimeout(() => startRequest(), 6000 * 10);
  }
}
