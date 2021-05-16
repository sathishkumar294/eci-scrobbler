import HtmlTableToJson from "html-table-to-json";
import requestPromise from "request-promise";

export function getURLAsHTML(url) {
  return requestPromise(url);
  // request({ url, method: 'GET' }).pipe((r) => r.text());
}

export function extractJSONFromHTML(html) {
  const regex = /<table ([\w\W]*)>([\w\W]*)<\/table>/gm;
  const matches = regex.exec(html);
  const tableData = matches[1];

  const parsedData = HtmlTableToJson.parse(tableData);
  // console.log(parsedData);
  const jsonData = parsedData.results;
  // console.log({ jsonData });
  return jsonData;
}

export async function getAllConstituencyCandidateData() {
  try {
    const url = "https://results.eci.gov.in/Result2021/search.htm";
    const html = await getURLAsHTML(url);
    const jsonList = extractJSONFromHTML(html);
    // Get the desired data only
    const requiredDataKeys = ["Candidate", "Constituency", "Party", "State"];
    const data = jsonList.find(
      (jdata) =>
        jdata.length > 0 &&
        requiredDataKeys.length === Object.keys(jdata[0]).length &&
        requiredDataKeys.every((k) => Object.keys(jdata[0]).includes(k))
    );
    // console.log({ data });
    return { data, success: true };
  } catch (e) {
    console.error("Error while getting the candidate data", e);
    return {
      success: false,
      message: "Error while fetching candidate data: " + e.toString(),
    };
  }
}
