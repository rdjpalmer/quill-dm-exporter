const qs = require("query-string");
const curl = new (require("./curl"))();
const fs = require("fs");
const fetch = require("node-fetch");

const stream = fs.createWriteStream("output.txt", { flags: "a" });

const DM_ID = "CHANGE-ME";
const BEFORE_VALUE = decodeURIComponent("CHANGE-ME");
const AUTH_HEADER = "CHANGE-ME";
const QUILL_SESSION = "CHANGE-ME";

const getUrl = (dm, before) => {
  const url = new URL("https://api.quill.chat/thread/history");
  const search = new URLSearchParams({
    includeThread: true,
    dm,
  });

  if (before) {
    search.set("before", before);
  }

  url.search = search.toString();

  return url.toString();
};

function getFile(dm, file, name) {
  return fetch(
    `https://api.quill.chat/file/?dm=${dm}&file=${file}&name=${name}`,
    {
      headers: {
        Host: "api.quill.chat",
        Accept:
          "image/webp,image/png,image/svg+xml,image/*;q=0.8,video/*;q=0.8,*/*;q=0.5",
        Connection: "keep-alive",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) QuillMacOS/1.44.0 Release (iPhone) Version/13.1.1 Safari/605.1.15",
        "Accept-Language": "en-GB,en;q=0.9",
        Referer: "https://app.quill.chat/",
      },
    }
  ).then((res) => res.body.pipe(fs.createWriteStream(`./files/${name}`)));
}

async function getDms(id, before) {
  curl.setHeaders([
    "Host: api.quill.chat",
    "Accept: application/json",
    `Authorization: ${AUTH_HEADER}`,
    `X-Quill-Session: ${QUILL_SESSION}`,
    "X-Quill-Version: appversion=1.153.0 platform=macOS package=chat.quill.app browser=safari",
    "Accept-Language: en-GB,en;q=0.9",
    "Cache-Control: max-age=0",
    "Origin: https://app.quill.chat",
    "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) QuillMacOS/1.44.0 ,Release (iPhone) Version/13.1.1 Safari/605.1.15",
    "Referer: https://app.quill.chat/",
    "Connection: keep-alive",
    "Content-Type: application/json",
  ]);

  const u = getUrl(id, before);
  const res = await curl.get(u);

  console.log("run!");

  for (let i = 0; i < res.body?.messages?.length; i++) {
    const { message } = res.body.messages[i];

    if (message?.file) {
      await getFile(id, message?.file?.file, message?.file?.name);
      continue;
    }

    if (message?.quote?.quoted) {
      const quotes = message?.quote?.quoted.map(
        (quote) => `> ${quote?.user}: ${quote?.text?.body}`
      );
      quotes.forEach((quote) => {
        // console.log(`${message.user}: ${quote}`);
        stream.write(`${message.user}: ${quote}\n`);
      });
      continue;
    }

    if (message?.link?.url) {
      //   console.log(`${message.user}: ${message?.link?.url}`);
      stream.write(`${message.user}: ${message?.link?.url}\n`);
      continue;
    }

    if (message?.slackMessage?.message?.activityRowText) {
      //   console.log(
      //     `${message.user}: ${message?.slackMessage?.message?.activityRowText}\n`
      //   );
      stream.write(
        `${message.user}: ${message?.slackMessage?.activityRowText}\n`
      );
      continue;
    }

    if (message?.text?.body) {
      stream.write(`${message.user}: ${message?.text?.body}\n`);
      continue;
    }

    console.log("unknown type");
  }

  if (res.body?.beforeCursor?.hasMore) {
    return getDms(
      id,
      new Date(res.body?.beforeCursor?.timestamp).toISOString()
    );
  }

  return;
}

async function init() {
  await getDms(DM_ID, BEFORE_VALUE);

  stream.end();
}

init();
