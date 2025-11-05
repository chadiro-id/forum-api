const directories = Object.assign({}, {});

class DomainErrorTranslator {
  static translate(error) {
    return directories[error.message] || error;
  }
}

module.exports = DomainErrorTranslator;