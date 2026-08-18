const key = process.env.INDEXNOW_KEY?.trim();

if (!key) {
  console.error("INDEXNOW_KEY is required");
  process.exit(1);
}

const host = "www.relaxfixuae.com";
const urlList = [
  `https://${host}/`,
  `https://${host}/en`,
  `https://${host}/coach-ayman`,
  `https://${host}/swimming-lessons-abu-dhabi`,
  `https://${host}/locations/najda-street`,
  `https://${host}/locations/ics-al-falah`,
  `https://${host}/locations/ics-khalifa`,
  `https://${host}/locations/ics-mushrif`,
];

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host,
    key,
    keyLocation: `https://${host}/indexnow-key.txt`,
    urlList,
  }),
});

if (!response.ok) {
  const body = await response.text();
  console.error(`IndexNow submission failed: ${response.status} ${body}`);
  process.exit(1);
}

console.log(`IndexNow accepted ${urlList.length} Relax Fix UAE URLs (${response.status}).`);
