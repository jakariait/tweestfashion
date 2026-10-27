const mockTransport = {
  sendMail: jest.fn().mockResolvedValue({ messageId: 'test-msg-id' }),
};

const nodemailer = {
  createTransport: jest.fn(() => mockTransport),
};

module.exports = nodemailer;
