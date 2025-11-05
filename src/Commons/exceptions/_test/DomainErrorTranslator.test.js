const DomainErrorTranslator = require('../DomainErrorTranslator');

describe('DomainErrorTranslator', () => {
  it('should return original error when error message is not needed to translate', () => {
    const error = new Error('some-error-message');

    const translatedError = DomainErrorTranslator.translate(error);

    expect(translatedError).toStrictEqual(error);
  });
});