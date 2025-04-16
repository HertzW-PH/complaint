# models.py  
from sqlalchemy import Column, Integer, String, Date, Text, DateTime, Boolean, create_engine  
from sqlalchemy.ext.declarative import declarative_base  
from sqlalchemy.sql import func  

Base = declarative_base()  

class Complaint(Base):  
    __tablename__ = 'complaints'  
    
    id = Column(Integer, primary_key=True)  
    pr_id = Column(String, unique=True, index=True)  # 确保PR ID唯一  
    assigned_to = Column(Text)  
    event_country = Column(Text)  
    initiate_date = Column(Date)  
    philips_notified_date = Column(Date)  
    become_aware_date = Column(Date)  
    catalog_item_identifier = Column(String)  
    catalog_item_name = Column(String)  
    product_software_revision = Column(String)  
    serial_number = Column(String)  
    short_description = Column(Text)  
    potential_safety_alert = Column(String)  
    final_reportability = Column(String)  
    investigation_notes = Column(Text)  
    comments = Column(Text)  
    reporting_decision_notes = Column(Text)  
    investigation_summary = Column(Text)  
    source_system = Column(String)  
    source_identifier = Column(String)  
    reporting_institution_name = Column(String)  
    pr_state = Column(String)  
    event_type = Column(String)  
    project = Column(String)  
    description = Column(Text)  
    source_notes = Column(Text)  
    source_customer_description = Column(Text)  
    
    # 分类字段  
    system_component = Column(String)  # Gantry, Couch, Software等  
    failure_mode = Column(String)      # FM1, FM2, FM3等  
    severity = Column(String)          # Safety, High, Med, Low, Enhancement  
    priority = Column(String)          # High, Med, Low  
    level2 = Column(String)           # 分类级别2  
    rational = Column(Text)           # 分类原因  
    created_at = Column(DateTime, server_default=func.now())  
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())  