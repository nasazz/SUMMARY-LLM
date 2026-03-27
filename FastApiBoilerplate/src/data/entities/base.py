from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    """
    This is the equivalent of an empty BaseEntity class in C#.
    All SQLAlchemy models will inherit from this to map to SQL tables.
    """
    pass
