import requestPromise from "request-promise";
import * as cheerio from "cheerio";

export function getURLAsHTML(url) {
  return requestPromise(url);
  // request({ url, method: 'GET' }).pipe((r) => r.text());
}

/**
 *
 * @param {string} html
 * @returns {{
 *  Party: string,
 *  Constituency: string,
 *  State: string,
 *  constituencyCode: string,
 *  stateCode: string,
 *  Candidate: string
 *  }[]}
 */
export function extractDataFromECISearchPage(html) {
  const regex = /<table ([\w\W]*)>([\w\W]*)<\/table>/gm;
  const matches = regex.exec(html);
  const tableData = matches[1];
  const chData = cheerio.load("<table" + tableData + "></table>", null, false);
  const headers = chData("#tabTable > thead > tr > th")
    .toArray()
    .map((th) => th.firstChild.data);
  // .map((el) => el.data());
  const trs = chData("#tabTable > tbody > tr").toArray();
  const data = trs.map((tr) => {
    const link = tr.children[0].children[0].attribs.href;
    const matches = /Constituencywise([SU]\d{2})(\d+)\.htm\?ac=(\d+)/gm.exec(
      link
    );
    let constituencyCode = "",
      stateCode = "";
    if (matches && matches.length >= 4) {
      constituencyCode = matches[3];
      stateCode = matches[1];
    } else {
      console.error("Cannot find code for link:", { link });
    }
    const obj = {
      [headers[0]]: tr.children[0].children[0].children[0].data,
      [headers[1]]: tr.children[1].children[0].data,
      [headers[2]]: tr.children[2].children[0].data,
      [headers[3]]: tr.children[3].children[0].data,
    };
    return {
      ...obj,
      link,
      constituencyCode,
      stateCode,
    };
  });

  return data;
}

export async function getAllConstituencyCandidateData() {
  try {
    const url = "https://results.eci.gov.in/Result2021/search.htm";
    const html = await getURLAsHTML(url);
    const data = extractDataFromECISearchPage(html);
    const states = {};
    const candidates = {};
    const constituencies = {};
    data.forEach((record) => {
      if (!states[record.State]) {
        states[record.State] = { state: record.State, code: record.stateCode };
      }
      const constiKey = `${record.State}-${record.Constituency}-${record.constituencyCode}`;
      if (!constituencies[constiKey]) {
        constituencies[constiKey] = {
          constituency: record.Constituency,
          code: record.constituencyCode,
          state: record.State,
        };
      }
      const candiKey = `${record.constituencyCode}-${record.Candidate}-${record.Party}`;
      if (!candidates[candiKey]) {
        candidates[candiKey] = {
          candidate: record.Candidate,
          constituency: record.Constituency,
          party: record.Party,
          state: record.State,
        };
      } else {
        console.warn("Duplicate candidate: " + candiKey, { record });
      }
    });
    return {
      data: {
        states: Object.values(states),
        candidates: Object.values(candidates),
        constituencies: Object.values(constituencies),
      },
      success: true,
    };
  } catch (e) {
    console.error("Error while getting the candidate data", e);
    return {
      success: false,
      message: "Error while fetching candidate data: " + e.toString(),
    };
  }
}
