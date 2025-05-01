export const columns = [
  {
    title: 'Id',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'ReceivedDate',
    dataIndex: 'receivedDate',
    key: 'receivedDate',
  },
  {
    title: 'CompletionDate',
    dataIndex: 'completionDate',
    key: 'completionDate',
  },
  {
    title: 'ProjectCode',
    dataIndex: 'projectCode',
    key: 'projectCode',
  },
  {
    title: 'Quantity',
    dataIndex: 'quantity',
    key: 'quantity',
  },
];

export const codeMapping: Record<string, string> = {
  'COAX ASBUILD / 27240 (EA)': 'CCI - BAU Coax Asbuild/27240',
  'COAX ASBUILT FOOTAGE > 1,500’ / 27529 (FT)': 'CCI - BAU Coax Asbuilt Footage > 1,500’/27529',
  'FIBER ASBUILD / 27242 (EA)': 'CCI - BAU Fiber Asbuild/27242',
  'FIBER ASBUILT FOOTAGE > 1,500’ / 27530 (FT)': 'CCI - BAU Fiber Asbuilt Footage > 1,500’/27530',
  'COAX NEW BUILD < 1,500’ / 27281 (EA)': 'CCI - BAU Coax New Build 1,500’/27281',
  'NEW COAX FOOTAGE OVER 1500 (FT)': 'CCI - BAU Fiber and/or Coax Footage > 1,500’/27280',
  'FIBER NEW BUILD < 1,500’ / 27282 (EA)': 'CCI - BAU Fiber New Build  1,500’/27282',
  'SUBCO ONLY Node Seg/Split Asbuild / 35473 (EA)':
    'CCI - BAU SUBCO ONLY Node Seg/Split Asbuild/35473',
  'NODE SPLIT PRELIM / 35539 (EA)': 'CCI - BAU Node Split Prelim/35539',
};
