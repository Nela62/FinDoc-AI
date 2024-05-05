import {
  fetchCitationSnippets,
  fetchCitedDocumentByPDFId,
  fetchCitedDocuments,
} from '../queries';
import { createClient } from '../supabase/client';

const getUsedSourceNumsAndCitations = (text: string, citations: any[]) => {
  const numbers = text.match(/\[(\d+)\]/g);
  const usedNumbers = [...new Set(numbers)];
  const usedCitations = usedNumbers.map((num) => {
    return citations.find((c) => c.source_num === num);
  });
  return { usedNumbers, usedCitations };
};

export const getCitationMapAndInsertNew = async (
  citations: any[],
  reportId: any,
  insertCitedDocuments: any,
  insertCitationSnippets: any,
  insertPDFCitations: any,
  insertAPICitations: any,
) => {
  const supabase = createClient();

  const mappedSourceNums: any = {};

  const newCitations: any[] = [];

  const { data: citedDocuments } = await fetchCitedDocuments(
    supabase,
    reportId,
  );
  const { data: citationSnippets } = await fetchCitationSnippets(
    supabase,
    reportId,
  );

  if (!citedDocuments || !citationSnippets) {
    return;
  }
  let newCitedDocuments = 0;

  for (let i = 0; i < citations.length; i++) {
    const citation = citations[i];
    let citedDocumentSourceNum: Number =
      citedDocuments.length + newCitedDocuments + 1;
    let citationSnippetSourceNum = 1;

    if (citation.citation_type === 'PDF') {
      // Check if the pdf document is already in the cited or new cited documents
      const { data: dbDoc } = await fetchCitedDocumentByPDFId(
        supabase,
        reportId,
        citation.doc_id,
      );

      console.log('fetched cited doc by pdf id', dbDoc, citation.doc_id);

      if (!dbDoc) return;

      if (dbDoc.length === 0) {
        console.log('dbDoc not found');
        // Check if the PDF document has already been added
        const localDoc = newCitations.find(
          (doc) => doc.docId === citation.doc_id,
        );

        if (!localDoc) {
          // Not in db and not locally
          console.log('localDoc not found. inserting new cited doc');

          newCitedDocuments += 1;
          console.log(mappedSourceNums);
          const { id: citedDocId } = insertCitedDocuments({
            report_id: reportId,
            source_num: citedDocumentSourceNum,
            top_title: '',
            bottom_title: '',
            citation_type: 'PDF',
          });
          console.log('citedDocId ', citedDocId);
          const { id: citationSnippetId } = insertCitationSnippets({
            cited_document_id: citedDocId,
            source_num: citationSnippetSourceNum,
            title: `Page ${citation.page}`,
            text_snippet: '',
          });
          insertPDFCitations({
            citation_snippet_id: citationSnippetId,
            node_id: citation.node_id,
            page: citation.page,
            doc_id: citation.doc_id,
            text: citation.text,
          });

          newCitations.push({
            citedDocId: citedDocId,
            citedDocumentSourceNum: citedDocumentSourceNum,
            citationSnippetId: citationSnippetId,
            citationSnippetSourceNum: citationSnippetSourceNum,
            nodeId: citation.node_id,
            docId: citation.doc_id,
          });
        } else {
          // Not in db but locally
          console.log('localDoc found');
          const { citedDocId, citedDocumentSourceNum: localCitedDocSourceNum } =
            localDoc;
          citedDocumentSourceNum = localCitedDocSourceNum;

          const localSnippet = newCitations.find(
            (newCitation) =>
              newCitation.citedDocId === citedDocId &&
              newCitation.nodeId === citation.node_id,
          );

          if (!localSnippet) {
            console.log('localSnippet not found');
            const snippets = newCitations.filter(
              (citation) => citation.citedDocId === citedDocId,
            );
            citationSnippetSourceNum = snippets.length + 1;

            const { id: citationSnippetId } = insertCitationSnippets({
              cited_document_id: citedDocId,
              source_num: citationSnippetSourceNum,
              title: `Page ${citation.page}`,
              text_snippet: '',
            });
            insertPDFCitations({
              citation_snippet_id: citationSnippetId,
              node_id: citation.node_id,
              page: citation.page,
              doc_id: citation.doc_id,
              text: citation.text,
            });

            newCitations.push({
              citedDocId: citedDocId,
              citedDocumentSourceNum: citedDocumentSourceNum,
              citationSnippetId: citationSnippetId,
              citationSnippetSourceNum: citationSnippetSourceNum,
              nodeId: citation.node_id,
              docId: citation.doc_id,
            });
          } else {
            console.log('localSnippet found, skipping');
          }
        }
      } else {
        // Cited doc already in db
        citedDocumentSourceNum = dbDoc[0].source_num;
        let snippetExists = false;

        dbDoc[0].citation_snippets.forEach((snippet) => {
          if (snippet.pdf_citations[0].node_id === citation.node_id) {
            snippetExists = true;
            citationSnippetSourceNum = snippet.source_num;
          }
        });

        if (!snippetExists) {
          citationSnippetSourceNum = dbDoc[0].citation_snippets.length + 1;

          const { id: citationSnippetId } = insertCitationSnippets({
            cited_document_id: citedDocumentSourceNum,
            source_num: citationSnippetSourceNum,
            title: `Page ${citation.page}`,
            text_snippet: '',
          });
          insertPDFCitations({
            citation_snippet_id: citationSnippetId,
            node_id: citation.node_id,
            page: citation.page,
            doc_id: citation.doc_id,
            text: citation.text,
          });
        }
      }
    } else if (citation.citation_type === 'API') {
    }

    mappedSourceNums[citation.source_num] = Number(
      citedDocumentSourceNum + '.' + citationSnippetSourceNum,
    );
  }
};

export const getCleanTextAndCitations = async (
  text: string,
  citations: any[],
  reportId: string,
) => {
  const { usedNumbers, usedCitations } = getUsedSourceNumsAndCitations(
    text,
    citations,
  );
};
