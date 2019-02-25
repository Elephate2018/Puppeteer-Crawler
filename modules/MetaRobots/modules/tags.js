exports.extractRobotsTag = async function extractRobotsTag(page) {
  let xpath = await page.$x("//meta[@name='robots']/@content");
  let list = new Array();

  for (i = 0; i < xpath.length; i++) {
    let robotsContent = await page.evaluate(el => el.textContent, xpath[i]);
    list.push(robotsContent);
  }
  return list;
}

exports.extractCanonicals = async function extractCanonicals(page) {
  let xpath = await page.$x("//link[@rel='canonical']/@href");
  let list = new Array();

  for (i = 0; i < xpath.length; i++) {
    let canonicalContent = await page.evaluate(el => el.textContent, xpath[i]);
    list.push(encodeURI(canonicalContent));
  }
  return list;
}

exports.isCanonicalised = function isCanonicalised(url, canonicalsList) {
  let canonicalised = false;
  for (let i = 0; i < canonicalsList.length; i++) {
    if (canonicalsList[i].toString() != url) return true;
    else canonicalised = 'self';
  }
  return canonicalised;
}

exports.isIndexable = function isIndexable(robotsList) {
  let indexable = true;
  if (robotsList.toString().includes("noindex")) indexable = false;

  return indexable;
}