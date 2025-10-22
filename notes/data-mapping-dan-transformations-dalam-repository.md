# Strategi Data Mapping dan Transformasi (di Repository)

## Sample kode

`CommentRepository.js`
```js
class CommentRepositoryPostgres extends CommentsRepository {
	constructor(pool, idGenerator) {
		super()
		this._pool = pool
		this._idGenerator = idGenerator
	}

	async addComment(payloadThread) {
		const { content, threadId, owner } = payloadThread
		const id = `comment-${this._idGenerator()}`
		const date = new Date()

		const query = {
			text: `INSERT INTO "comments" VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner`,
			values: [id, content, date, threadId, owner],
		}

		const result = await this._pool.query(query)

        // Disini Mas melakukan transforming data raw dari db ke entity
        // kebetulan nama kolom dan property entity nya sama, jadi tidak mapping,
        // Dan juga, ini menjadikan repository tidak konsisten dalam hal penanganan data,
        // karena yang lain mengembalikan data raw,
		return new AddedComment({ ...result.rows[0] }) 
	}

	async deleteComment(commentId) {
		const query = {
			text: `UPDATE "comments" SET is_delete=true WHERE id=$1`,
			values: [commentId],
		}

		await this._pool.query(query)
	}

	async getCommentById(commentId) {
		const query = {
			text: `SELECT * FROM comments WHERE id=$1`,
			values: [commentId],
		}

		const result = await this._pool.query(query)

		if (!result.rowCount) {
			throw new NotFoundError('Comment id tidak ditemukan')
		}
        // Disini mengembalika raw data,
		return result.rows[0]
	}

	async verifyCommentOwner(commentId, owner) {
		const query = {
			text: `SELECT * FROM comments WHERE id=$1 AND owner=$2`,
			values: [commentId, owner],
		}

		const result = await this._pool.query(query)

		if (!result.rowCount) {
			throw new AuthorizationError(
				'Anda tidak memiliki akses untuk comment ini'
			)
		}

		return result.rows[0]
	}

	async getCommentByThreadId(threadId) {
		const queryComment = {
			text: `SELECT commen.id, commen.content, commen.date, users.username, commen.is_delete, CAST(COUNT(likes.id) AS INTEGER) AS like_count
          FROM comments AS commen
          LEFT JOIN users ON commen.owner = users.id
          LEFT JOIN likes ON commen.id = likes.comment_id 
          WHERE commen.thread_id = $1 GROUP BY commen.id, users.id ORDER BY commen.date ASC`,
			values: [threadId],
		}

		const result = await this._pool.query(queryComment)

		if (!result.rowCount) {
			return []
		}

		return result.rows
	}
}

module.exports = CommentRepositoryPostgres
```

## Kenapa saya menganggap mapping di entity itu melanggar dependency rule

Sepemahaman saya, dependency dalam clean arsitektur itu luas, bukan sekedar dependency dalam lingkup kode (import atau require),
Tapi bener2 ketergantungan dalam hal apapun,
```js
class CommentDetail {
	constructor(payload) {
		this._verifyPayload(payload)

		const {
			id,
			content,
			date,
			username,
            // Ini kalo suatu saat nama kolom db berubah, maka menjadikan entity harus mengikuti perubahan yang ada di db
            // dimana db itu layer luar, berarti entity memiliki ketergantungan terhadap layer luar
			is_delete: isDelete,
			replies,
			like_count: likeCount,
		} = payload

		this.id = id
		this.content = isDelete ? '**komentar telah dihapus**' : content
		this.date = date
		this.username = username
		this.replies = replies
		this.likeCount = likeCount
	}

	_verifyPayload({
		id,
		content,
		date,
		username,
		is_delete: isDelete,
		replies,
		like_count: likeCount,
	}) {
		if (!id || !content || !date || !username || !replies) {
			throw new Error('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')
		}

		if (
			typeof id !== 'string' ||
			typeof content !== 'string' ||
			typeof username !== 'string' ||
			typeof isDelete !== 'boolean' ||
			!(replies instanceof Array) ||
			typeof likeCount !== 'number'
		) {
			throw new Error('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')
		}
	}
}

module.exports = CommentDetail
```

## kesimpulan
Mohon maaf mas, saya kurang bisa menjelaskan.