class CommentLike {
  constructor(payload) {
    this.id = payload.id;
    this.commentId = payload.commentId;
    this.userId = payload.userId;
  }
}

module.exports = CommentLike;