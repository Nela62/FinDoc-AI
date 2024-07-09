// import {
//   fetchAPICacheById,
//   fetchCitationSnippets,
//   fetchCitedDocumentByAPIId,
//   fetchCitedDocumentByPDFId,
//   fetchCitedDocuments,
//   fetchDocumentById,
// } from '../queries';
// import { createClient } from '../supabase/client';

// const getUsedSourceNumsAndCitations = (text: string, citations: any[]) => {
//   const numbers = text.match(/\[(\d+)\]/g);
//   const usedNumbers = [...new Set(numbers)];
//   const usedCitations = usedNumbers.map((num) => {
//     return citations.find((c) => '[' + c.source_num + ']' === num);
//   });
//   return { usedNumbers, usedCitations };
// };

// export const getCitationMapAndInsertNew = async (
//   text: string,
//   citations: any[],
//   reportId: any,
//   userId: string,
//   insertCitedDocuments: any,
//   insertCitationSnippets: any,
//   insertPDFCitations: any,
//   insertAPICitations: any,
// ) => {
//   if (citations.length === 0) return;
//   const { usedCitations } = getUsedSourceNumsAndCitations(text, citations);
//   const supabase = createClient();

//   const mappedSourceNums: any = {};

//   for (let i = 0; i < usedCitations.length; i++) {
//     const { data: citedDocuments } = await fetchCitedDocuments(
//       supabase,
//       reportId,
//     );
//     const { data: citationSnippets } = await fetchCitationSnippets(
//       supabase,
//       reportId,
//     );

//     if (!citedDocuments || !citationSnippets) {
//       console.log('no cited docs or citation snippets');
//       return;
//     }

//     const citation = usedCitations[i];
//     if (!citation) return;
//     let citedDocumentSourceNum: Number = citedDocuments.length + 1;
//     let citationSnippetSourceNum = 1;

//     if (citation.citation_type === 'PDF') {
//       // TODO: use tanstack query to fetch
//       const { data: citedDoc } = await fetchCitedDocumentByPDFId(
//         supabase,
//         reportId,
//         citation.doc_id,
//       );

//       if (!citedDoc) return;

//       if (citedDoc.length === 0) {
//         // If cited doc not in db
//         const { data: pdfDoc } = await fetchDocumentById(
//           supabase,
//           citation.doc_id,
//         );

//         if (!pdfDoc) return;

//         const citedDocRes = await insertCitedDocuments({
//           user_id: userId,
//           report_id: reportId,
//           source_num: citedDocumentSourceNum,
//           top_title: `${pdfDoc[0].company_name} (${pdfDoc[0].company_ticker})`,
//           bottom_title: `${pdfDoc[0].doc_type}${
//             pdfDoc[0].quarter ? ' ' + pdfDoc[0].quarter : ''
//           } ${pdfDoc[0].year}`,
//           citation_type: 'PDF',
//           doc_id: citation.doc_id,
//         });

//         const citationSnippetRes = await insertCitationSnippets({
//           user_id: userId,
//           cited_document_id: citedDocRes[0].id,
//           report_id: reportId,
//           source_num: citationSnippetSourceNum,
//           title: `Page ${citation.page}`,
//           text_snippet: `${citation.text.slice(0, 141)}...`,
//         });

//         await insertPDFCitations({
//           user_id: userId,
//           report_id: reportId,
//           citation_snippet_id: citationSnippetRes[0].id,
//           node_id: citation.node_id,
//           page: citation.page,
//           doc_id: citation.doc_id,
//           text: citation.text,
//         });
//       } else {
//         // Cited doc already in db
//         citedDocumentSourceNum = citedDoc[0].source_num;
//         let snippetExists = false;

//         citedDoc[0].citation_snippets.forEach((snippet) => {
//           // console.log(snippet);
//           if (
//             snippet.pdf_citations.length > 0 &&
//             snippet.pdf_citations[0].node_id === citation.node_id
//           ) {
//             snippetExists = true;
//             citationSnippetSourceNum = snippet.source_num;
//           }
//         });

//         if (!snippetExists) {
//           citationSnippetSourceNum = citedDoc[0].citation_snippets.length + 1;
//           const citationSnippetRes = await insertCitationSnippets({
//             user_id: userId,
//             report_id: reportId,
//             cited_document_id: citedDoc[0].id,
//             source_num: citationSnippetSourceNum,
//             title: `Page ${citation.page}`,
//             text_snippet: `${citation.text.slice(0, 141)}...`,
//           });
//           await insertPDFCitations({
//             user_id: userId,
//             report_id: reportId,
//             citation_snippet_id: citationSnippetRes[0].id,
//             node_id: citation.node_id,
//             page: citation.page,
//             doc_id: citation.doc_id,
//             text: citation.text,
//           });
//         }
//       }
//     } else if (citation.citation_type === 'API') {
//       // apiCitation:
//       // "title": string
//       // "citation_type": "API",
//       // "used_json_data": used_json_data,
//       // "cache_id": cache_id,
//       // "source_num": citation_num,
//       const { data: citedDoc } = await fetchCitedDocumentByAPIId(
//         supabase,
//         reportId,
//         citation.cache_id,
//       );

//       if (!citedDoc) return;

//       if (citedDoc.length === 0) {
//         // If cited doc not in db
//         const { data: cacheDoc } = await fetchAPICacheById(
//           supabase,
//           citation.cache_id,
//         );

//         if (!cacheDoc) return;

//         const citedDocRes = await insertCitedDocuments({
//           user_id: userId,
//           report_id: reportId,
//           source_num: citedDocumentSourceNum,
//           top_title: `${
//             cacheDoc[0].api_provider === 'alpha_vantage'
//               ? 'Alpha Vantage'
//               : 'Other'
//           } API`,
//           bottom_title: `${cacheDoc[0].endpoint}`,
//           citation_type: 'API',
//           cache_id: citation.cache_id,
//         });

//         const citationSnippetRes = await insertCitationSnippets({
//           user_id: userId,
//           cited_document_id: citedDocRes[0].id,
//           report_id: reportId,
//           source_num: citationSnippetSourceNum,
//           title: citation.title,
//           text_snippet: `${citation.used_json_data.slice(0, 141)}...`,
//         });

//         await insertAPICitations({
//           user_id: userId,
//           report_id: reportId,
//           citation_snippet_id: citationSnippetRes[0].id,
//           cache_id: citation.cache_id,
//           used_json_data: citation.used_json_data,
//         });
//       } else {
//         // Cited doc already in db
//         citedDocumentSourceNum = citedDoc[0].source_num;
//         let snippetExists = false;

//         citedDoc[0].citation_snippets.forEach((snippet) => {
//           if (snippet.title === citation.title) {
//             snippetExists = true;
//             citationSnippetSourceNum = snippet.source_num;
//           }
//         });

//         if (!snippetExists) {
//           citationSnippetSourceNum = citedDoc[0].citation_snippets.length + 1;
//           const citationSnippetRes = await insertCitationSnippets({
//             user_id: userId,
//             report_id: reportId,
//             cited_document_id: citedDoc[0].id,
//             source_num: citationSnippetSourceNum,
//             title: citation.title,
//             text_snippet: `${citation.used_json_data.slice(0, 141)}...`,
//           });
//           await insertAPICitations({
//             user_id: userId,
//             report_id: reportId,
//             citation_snippet_id: citationSnippetRes[0].id,
//             cache_id: citation.cache_id,
//             used_json_data: citation.used_json_data,
//           });
//         }
//       }
//     }

//     mappedSourceNums[citation.source_num] = Number(
//       citedDocumentSourceNum + '.' + citationSnippetSourceNum,
//     );
//   }
//   console.log('finished mapping and inserting');
//   return mappedSourceNums;
// };

// export const getCleanText = (text: string, replacementsMap: any[]) => {
//   const newText = text.replace(
//     /\[(\d+)\]/g,
//     (match, number) =>
//       `[${
//         replacementsMap[number] !== undefined ? replacementsMap[number] : number
//       }]`,
//   );
//   return newText;
// };
