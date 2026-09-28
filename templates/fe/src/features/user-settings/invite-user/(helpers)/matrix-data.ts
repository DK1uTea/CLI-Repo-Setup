// TODO: replace with API response once endpoint is available
export const INVITE_USER_MATRIX_DATA = {
  columns: [
    'View Draft Events',
    'View Active Events',
    'Manage Events',
    'Change Events',
    'Manage Ticket',
    'Transmit Ticket',
    'Manage users',
    'Manage files',
    'Show prices',
    'Manage Shop',
    'View Catalog',
    'Checkout Order',
    'NFC Management',
    'Manage NFC Tag',
    'Manage NFC URL',
    'Manage NFC Campaign',
    'NFC Analytics',
    'View NFC Tag',
    'View NFC URL',
    'View NFC Campaign',
    'Manage Rent',
    'Manage User Settings',
    'Manage Trade Fair',
  ],
  roles: [
    {
      title: 'Administrator',
      matrix: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
    },
    {
      title: 'Campaign manager',
      matrix: [true, true, true, true, true, true, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false],
    },
    {
      title: 'Marketing Manager',
      matrix: [true, true, true, true, true, true, false, true, true, true, true, true, true, false, false, false, true, true, true, true, true, true, false],
    },
    {
      title: 'Event manager',
      matrix: [true, true, true, true, true, true, false, true, true, true, true, true, false, false, false, false, false, false, false, false, true, true, false],
    },
    {
      title: 'Sales Rep',
      matrix: [true, true, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, true, false],
    },
    {
      title: 'Logistic Partners',
      matrix: [true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false],
    },
    {
      title: 'Calendar Administrator',
      matrix: [true, true, true, true, false, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, true, false],
    },
    {
      title: 'Tradefair Manager',
      matrix: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true],
    },
    {
      title: 'Sale rep CAM',
      matrix: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    },
    {
      title: 'Installation Cam',
      matrix: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    },
    {
      title: 'Agency CAM',
      matrix: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    },
    {
      title: 'Admin CAM',
      matrix: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    },
  ],
}
