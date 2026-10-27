const mockClient = {
  on: jest.fn(),
  connect: jest.fn().mockResolvedValue(undefined),
  get: jest.fn().mockImplementation((key, callback) => {
    if (callback) callback(null, null);
    else return Promise.resolve(null);
  }),
  set: jest.fn().mockImplementation((key, value, ...args) => {
    const callback = args.find((a) => typeof a === 'function');
    if (callback) callback(null, 'OK');
    else return Promise.resolve('OK');
  }),
  setEx: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
  quit: jest.fn().mockResolvedValue('OK'),
};

module.exports = {
  createClient: jest.fn(() => mockClient),
  ...mockClient,
};
