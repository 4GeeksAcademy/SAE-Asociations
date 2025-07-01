"""Merge migration heads

Revision ID: f60cf9fa56ff
Revises: 102aaf999c0e, 10e011d56d7c
Create Date: 2025-06-30 21:01:16.599849

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f60cf9fa56ff'
down_revision = ('102aaf999c0e', '10e011d56d7c')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
