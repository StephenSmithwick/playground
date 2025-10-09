async function mediaCapture() {
  var track = {};
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: "browser",
      },
      selfBrowserSurface: "include",
    });

    const video = document.createElement("video");

    video.srcObject = stream;
    video.autoplay = true;

    await new Promise((resolve) => (video.onloadedmetadata = resolve));

    track = stream.getVideoTracks()[0];
    const settings = track.getSettings();

    const canvas = document.createElement("canvas");
    canvas.width = settings.width;
    canvas.height = settings.height;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/png");
  } catch (err) {
    console.error(`Error: ${err}`);
  } finally {
    track.stop?.();
  }
}

async function takeScreenshot() {
  const imgUrl = await mediaCapture();

  if (imgUrl) {
    chrome.downloads.download({
      filename: dateNow`screenshot.${YYYY}.${MM}.${DD}.${HH}.${mm}.${ss}.png`,
      url: imgUrl,
    });
  }
}

const YYYY = "YYYY";
const MM = "MM";
const DD = "DD";
const HH = "HH";
const mm = "mm";
const ss = "ss";

dateParts = {
  YYYY: new Intl.DateTimeFormat("en", { year: "numeric" }),
  MM: new Intl.DateTimeFormat("en", { month: "2-digit" }),
  DD: new Intl.DateTimeFormat("en", { day: "2-digit" }),
  HH: new Intl.DateTimeFormat("en", { hour12: false, hour: "2-digit" }),
  mm: new Intl.DateTimeFormat("en", { minute: "2-digit" }),
  ss: new Intl.DateTimeFormat("en", { second: "2-digit" }),
};

function dateNow(strs, ...exprs) {
  //This is gratuituous but I wanted to explore creating a tagged template
  const now = new Date();

  let result = "";
  strs.forEach((str, i) => {
    result += str;
    if (i < exprs.length) {
      result += dateParts[exprs[i]]?.format(now) || exprs[i];
    }
  });
  return result;
}

document
  .querySelector("#capture")
  .addEventListener("click", () => takeScreenshot());
