"""init tables

Revision ID: 0001_init_tables
Revises:
Create Date: 2026-11-08 10:30:00.000000

"""

from typing import Sequence, Union

import geoalchemy2  # noqa: F401
import sqlalchemy as sa
from geoalchemy2 import Geometry

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0001_init_tables"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Tabel plots
    op.create_table(
        "plots",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("crop", sa.String(length=30), nullable=False),
        sa.Column("planting_date", sa.Date(), nullable=False),
        sa.Column("irrigation_method", sa.String(length=20), nullable=False),
        sa.Column("area_ha", sa.Numeric(precision=10, scale=4), nullable=False),
        sa.Column("centroid_lat", sa.Float(), nullable=False),
        sa.Column("centroid_lng", sa.Float(), nullable=False),
        sa.Column(
            "geom",
            Geometry(geometry_type="POLYGON", srid=4326, from_text="ST_GeomFromEWKT", name="geometry"),
            nullable=False,
        ),
        sa.Column("is_demo", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # Tabel ndvi_observations
    op.create_table(
        "ndvi_observations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("plot_id", sa.Integer(), sa.ForeignKey("plots.id", ondelete="CASCADE"), nullable=False),
        sa.Column("obs_date", sa.Date(), nullable=False),
        sa.Column("ndvi_mean", sa.Numeric(precision=5, scale=4), nullable=True),
        sa.Column("cloud_cover", sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column("source", sa.String(length=30), server_default="sentinel-2", nullable=False),
    )

    # Tabel irrigation_logs
    op.create_table(
        "irrigation_logs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("plot_id", sa.Integer(), sa.ForeignKey("plots.id", ondelete="CASCADE"), nullable=False),
        sa.Column("log_date", sa.Date(), nullable=False),
        sa.Column("volume_m3", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("irrigation_logs")
    op.drop_table("ndvi_observations")
    op.drop_table("plots")
