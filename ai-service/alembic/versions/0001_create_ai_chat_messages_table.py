"""create_ai_chat_messages_table

Revision ID: 0001_create_ai_chat_messages_table
Revises: 
Create Date: 2026-08-14 22:50:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0001_create_ai_chat_messages_table'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'ai_chat_messages',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('role', sa.String(length=10), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_ai_chat_messages_user_id', 'ai_chat_messages', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_ai_chat_messages_user_id', table_name='ai_chat_messages')
    op.drop_table('ai_chat_messages')
