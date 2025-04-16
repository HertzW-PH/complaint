# database.py  
from sqlalchemy import create_engine  
from sqlalchemy.ext.declarative import declarative_base  
from sqlalchemy.orm import sessionmaker, Session  
from typing import Generator  

# 创建SQLite数据库引擎  
# 对于生产环境，可以替换为PostgreSQL连接  
SQLALCHEMY_DATABASE_URL = "sqlite:///./ct_complaints.db"  
# 对于PostgreSQL，使用如下格式  
# SQLALCHEMY_DATABASE_URL = "postgresql://user:password@postgresserver/db"  

# 创建SQLite引擎，check_same_thread=False仅适用于SQLite  
engine = create_engine(  
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}  
)  

# 创建数据库会话工厂  
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)  

# 创建模型基类  
Base = declarative_base()  

# 数据库依赖项函数 - 提供数据库会话  
def get_db() -> Generator[Session, None, None]:  
    """  
    创建并提供一个数据库会话，处理完请求后自动关闭  
    
    这个函数作为FastAPI依赖项使用，用于处理数据库会话的生命周期  
    """  
    db = SessionLocal()  
    try:  
        yield db  
    finally:  
        db.close()  