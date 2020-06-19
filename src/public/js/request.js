const Nexmo = require("nexmo");

const nexmo = new Nexmo({
  apiKey: "1d5a96be",
  apiSecret: "zRAxmYIvV0aDBDWV",
});

nexmo.verify.request(
  {
    number: "918668597400",
    brand: "Vonage",
    code_length: "4",
  },
  (err, result) => {
    console.log(err ? err : result);
  }
);

nexmo.verify.check(
  {
    request_id: "REQUEST_ID",
    code: "CODE",
  },
  (err, result) => {
    console.log(err ? err : result);
  }
);
