from marshmallow import Schema, fields

class UserBasicSchema(Schema):
    id = fields.Int()
    name = fields.Str()
    lastname = fields.Str()

class CommentSchema(Schema):
    id = fields.Int(dump_only=True)
    event_id = fields.Int(required=True)
    user_id = fields.Int(dump_only=True)
    content = fields.Str(required=True)
    created_at = fields.DateTime()
    user = fields.Nested(UserBasicSchema, dump_only=True)
