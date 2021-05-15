import { getAllConstituencyCandidateData } from '../server/extract-eci-info.js';

(async function test1() {
  const results = await getAllConstituencyCandidateData();
  console.info({ results });
}());
