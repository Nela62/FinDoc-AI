export type Citation = {
  node_id: string | null;
  text: string;
  source_num: number;
  page: number | null;
  doc_id: string | null;
  // status: 'Approved' | 'Rejected' | 'Pending'
};
