# main.py  
from fastapi import Depends, FastAPI, HTTPException, UploadFile, File, BackgroundTasks, Query  
from fastapi.middleware.cors import CORSMiddleware  
from fastapi.responses import JSONResponse  
import pandas as pd  
from sqlalchemy.orm import Session  
from database import get_db  
from models import Complaint  
from services import (
    classify_complaint, 
    get_statistics, 
    get_filter_options,
    get_monthly_trend,
    get_country_statistics,
    get_product_statistics
)  
import io  
import logging  
from typing import Optional  

# Configure logging  
logging.basicConfig(level=logging.INFO)  
logger = logging.getLogger(__name__)  

# Create database tables  
# Base.metadata.create_all(bind=engine)  
app = FastAPI(title="CT Complaint Classification System")  

app.add_middleware(  
    CORSMiddleware,  
    allow_origins=["http://localhost:3000"],  # Allowed frontend sources  
    allow_credentials=True,  
    allow_methods=["*"],  # Allow all HTTP methods  
    allow_headers=["*"],  # Allow all HTTP headers  
    expose_headers=["*"],  # Expose all response headers   
)  

@app.post("/upload")  
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):  
    """Upload complaint Excel file and process it"""  
    logger.info(f"Received file upload request: filename={file.filename}")  
    
    # Check file format  
    if not file.filename.endswith(('.xlsx', '.xls')):  
        logger.warning(f"Unsupported file format: {file.filename}")  
        raise HTTPException(status_code=400, detail="Only Excel files are accepted (.xlsx, .xls)")  
    
    try:  
        # Read file contents  
        contents = await file.read()  
        logger.info(f"Successfully read file contents, size: {len(contents)} bytes")  
        
        # Parse Excel file  
        try:  
            datecols =[] # ['Initiate Date', 'Become Aware Date', 'Philips Notified Date']
            df = pd.read_excel(io.BytesIO(contents), header=0, dtype=str, parse_dates=datecols, na_filter=False)  
            # Check if column names are correct  
           
            logger.info(f"Successfully parsed Excel file, rows: {len(df)}")  
        except Exception as e:  
            logger.error(f"Failed to parse Excel file: {str(e)}", exc_info=True)  
            raise HTTPException(status_code=400, detail=f"Excel file format is incorrect: {str(e)}")  
        
        # Check if required columns exist  
        required_columns = ["PR ID", "Short Description"]  
        missing_columns = [col for col in required_columns if col not in df.columns]  
        if missing_columns:  
            logger.warning(f"Excel missing required columns: {missing_columns}, {df.columns}")  
            raise HTTPException(status_code=400, detail=f"Excel file missing required columns: {', '.join(missing_columns)}")  
        
        # Count new and existing complaints  
        new_complaints = 0  
        existing_complaints = 0  
        
        # Process each row  
        for _, row in df.iterrows():  
            try:  
                pr_id = str(row['PR ID'])  
                
                # Check if complaint already exists  
                existing = db.query(Complaint).filter(Complaint.pr_id == pr_id).first()  
                
                if existing:  
                    existing_complaints += 1  
                    continue  
                
                # Create new complaint record  
                short_desc = str(row.get('Short Description', ''))  
                swo_notes = str(row.get('Source Notes', ''))  
                swo_notes = swo_notes.replace('\r', '\n')  
                initdate = row.get('Initiate Date', '')
                init_date=pd.to_datetime(initdate, errors='coerce').date()
                # print(f'initdate={initdate}  init_date={init_date}')
                try: 
                    ba_date=pd.to_datetime(row.get('Become Aware Date', ''),errors='coerce').date()
                    pn_date=pd.to_datetime(row.get('Philips Notified Date', ''),errors='coerce').date()
                except:
                    ba_date = init_date  
                    pn_date = init_date
                complaint = Complaint(  
                    pr_id=pr_id,  
                    short_description=short_desc,  
                    description=str(row.get('Description', '')),  
                    source_customer_description=str(row.get('Source Customer Description', '')),  
                    source_system=str(row.get('Source System', '')),  
                    source_identifier=str(row.get('Source Identifier', '')),  
                    serial_number=str(row.get('Serial Number', '')),  
                    final_reportability=str(row.get('Final Reportability', '')),  
                    comments=str(row.get('Comments', '')),  
                    event_type=str(row.get('Event Type', '')),  
                    event_country=str(row.get('Event Country', '')),  
                    source_notes=swo_notes,  
                    project=str(row.get('Project', '')),  
                    investigation_notes=str(row.get('Investigation Notes', '')),  
                    potential_safety_alert=str(row.get('Potential Safety Alert', '')),   
                    assigned_to=str(row.get('Assigned To', '')),  
                    pr_state=str(row.get('PR State', '')),  
                    initiate_date=init_date,  
                    become_aware_date=ba_date,  
                    philips_notified_date=pn_date,  
                    product_software_revision=str(row.get('Product Software Revision', '')),  
                    investigation_summary=str(row.get('Investigation Summary', '')),  
                    reporting_institution_name=str(row.get('Reporting Institution Name', '')),  

                    catalog_item_name=str(row.get('Catalog Item Name', '')),  
                    catalog_item_identifier=str(row.get('Catalog Item Identifier', ''))  
                )  
                
                # Use classification service to classify  
                # logger.info(f"Classifying PR ID={pr_id}")  
                # try:  
                #     classification = classify_complaint(complaint, db)  
                    
                #     # Update classification info  
                #     complaint.system_component = classification.get('system_component')  
                #     complaint.failure_mode = classification.get('failure_mode')  
                #     complaint.severity = classification.get('severity')  
                #     complaint.priority = classification.get('priority')  
                # except Exception as e:  
                    # logger.error(f"Classification failed, using default values: {str(e)}", exc_info=True)  
                    # Set default classification  
                complaint.system_component = "N/A"  
                complaint.failure_mode = "N/A"  
                complaint.severity = "N/A"  
                complaint.priority = "N/A"  
                
                db.add(complaint)  
                try:
                    db.commit()
                except Exception as e:
                    db.rollback()
                    logger.error(f"Failed to commit new complaint: {pr_id}{str(e)}", exc_info=True)
                    break
                new_complaints += 1  
            except Exception as e:  
                logger.error(f"Failed to process row data: ID={pr_id} {str(e)}", exc_info=True)  
                # Continue processing other rows  
                break  
        
        # Commit transaction  
        # try:  
        #     db.commit()  
        #     logger.info(f"Database commit successful: new={new_complaints}, existing={existing_complaints}")  
        # except Exception as e:  
        #     db.rollback()  
        #     logger.error(f"Database commit failed: {str(e)}", exc_info=True)  
        #     raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")  
        
        return {  
            "status": "success",  
            "new_complaints": new_complaints,  
            "existing_complaints": existing_complaints  
        }  
    
    except HTTPException:  
        # Re-raise HTTP exceptions  
        raise  
    except Exception as e:  
        # Rollback transaction  
        # try:  
        #     db.rollback()  
        # except:  
        #     pass  
        
        logger.error(f"Upload processing failed: {str(e)}", exc_info=True)  
        raise HTTPException(status_code=500, detail=f"Error processing uploaded file: {str(e)}")  

@app.get("/statistics")  
async def get_stats(
    system_component: Optional[list[str]] = Query(None),  
    failure_mode: Optional[list[str]] = Query(None),  
    severity: Optional[list[str]] = Query(None),  
    priority: Optional[list[str]] = Query(None),  
    country: Optional[list[str]] = Query(None),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    catalog_item_identifier: Optional[list[str]] = Query(None),
    pr_state: Optional[list[str]] = Query(None),  
    level2: Optional[list[str]] = Query(None),
    db: Session = Depends(get_db)
):  
    # Debug log for incoming filter parameters
    logger.info(f"Statistics filter params: sys_comp={system_component}, failure={failure_mode}, severity={severity}, "
                f"priority={priority}, country={country}, catalog={catalog_item_identifier}, "
                f"pr_state={pr_state}, level2={level2}, dates={start_date}-{end_date}")
    
    # Pass all filters to the statistics function
    filters = {
        "system_component": system_component,
        "failure_mode": failure_mode,
        "severity": severity,
        "priority": priority,
        "country": country,
        "start_date": start_date,
        "end_date": end_date,
        "catalog_item_identifier": catalog_item_identifier,
        "pr_state": pr_state,
        "level2": level2
    }
    return get_statistics(db, filters)

@app.get("/complaints")  
async def list_complaints(  
    system_component: Optional[list[str]] = Query(None),  
    failure_mode: Optional[list[str]] = Query(None),  
    severity: Optional[list[str]] = Query(None),  
    priority: Optional[list[str]] = Query(None),  
    country: Optional[list[str]] = Query(None),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    catalog_item_identifier: Optional[list[str]] = Query(None),
    pr_state: Optional[list[str]] = Query(None),  
    level2: Optional[list[str]] = Query(None),  
    db: Session = Depends(get_db)  
):  
    # Debug log to see incoming filter parameters
    logger.info(f"Filter params received: sys_comp={system_component}, failure={failure_mode}, severity={severity}, "
                f"priority={priority}, country={country}, catalog={catalog_item_identifier}, "
                f"pr_state={pr_state}, level2={level2}, dates={start_date}-{end_date}")
    
    query = db.query(Complaint)  
    
    # Handle multiple filter values
    if system_component:
        if "" in system_component:  # Empty string means no filter
            system_component.remove("")
        if system_component:  # Check if there are still values after removing empty strings
            query = query.filter(Complaint.system_component.in_(system_component))
            logger.info(f"Filtering by system_component: {system_component}")
    
    if failure_mode:
        if "" in failure_mode:
            failure_mode.remove("")
        if failure_mode:
            query = query.filter(Complaint.failure_mode.in_(failure_mode))
            logger.info(f"Filtering by failure_mode: {failure_mode}")
    
    if severity:
        if "" in severity:
            severity.remove("")
        if severity:
            query = query.filter(Complaint.severity.in_(severity))
            logger.info(f"Filtering by severity: {severity}")
    
    if priority:
        if "" in priority:
            priority.remove("")
        if priority:
            query = query.filter(Complaint.priority.in_(priority))
            logger.info(f"Filtering by priority: {priority}")
    
    if country:
        if "" in country:
            country.remove("")
        if country:
            query = query.filter(Complaint.event_country.in_(country))
            logger.info(f"Filtering by country: {country}")
    
    if catalog_item_identifier:
        if "" in catalog_item_identifier:
            catalog_item_identifier.remove("")
        if catalog_item_identifier:
            query = query.filter(Complaint.catalog_item_identifier.in_(catalog_item_identifier))
            logger.info(f"Filtering by catalog_item_identifier: {catalog_item_identifier}")
    
    if pr_state:
        if "" in pr_state:
            pr_state.remove("")
        if pr_state:
            query = query.filter(Complaint.pr_state.in_(pr_state))
            logger.info(f"Filtering by pr_state: {pr_state}")
    
    if level2:
        if "" in level2:
            level2.remove("")
        if level2:
            query = query.filter(Complaint.level2.in_(level2))
            logger.info(f"Filtering by level2: {level2}")

    # Date range filter
    if start_date:
        try:
            start = pd.to_datetime(start_date).date()
            query = query.filter(Complaint.initiate_date >= start)
            logger.info(f"Filtering by start_date: {start_date}")
        except Exception as e:
            logger.error(f"Error parsing start_date: {str(e)}")
            
    if end_date:
        try:
            end = pd.to_datetime(end_date).date()
            query = query.filter(Complaint.initiate_date <= end)
            logger.info(f"Filtering by end_date: {end_date}")
        except Exception as e:
            logger.error(f"Error parsing end_date: {str(e)}")
    
    result = query.all()
    logger.info(f"Query returned {len(result)} results")
    return result

@app.patch("/complaints/{pr_id}")  
async def update_complaint(pr_id: str, data: dict, db: Session = Depends(get_db)):  
    """Update complaint classification"""  
    complaint = db.query(Complaint).filter(Complaint.pr_id == pr_id).first()  
    if not complaint:  
        raise HTTPException(status_code=404, detail="Complaint record not found")  
    
    # Update classification fields  
    if "system_component" in data:  
        complaint.system_component = data["system_component"]  
    if "failure_mode" in data:  
        complaint.failure_mode = data["failure_mode"]  
    if "severity" in data:  
        complaint.severity = data["severity"]  
    if "priority" in data:  
        complaint.priority = data["priority"]  
    if "level2" in data:
        complaint.level2 = data["level2"]
    if "rational" in data:
        complaint.rational = data["rational"]
    
    db.commit()  
    return {"status": "success", "message": "Classification updated"}

@app.post("/complaints/{pr_id}/classify")  
async def classify_single_complaint(pr_id: str, db: Session = Depends(get_db)):  
    """Use AI to classify a single complaint"""  
    complaint = db.query(Complaint).filter(Complaint.pr_id == pr_id).first()  
    if not complaint:  
        raise HTTPException(status_code=404, detail="Complaint record not found")  
    
    # Use classification service to classify  
    success = classify_complaint(complaint, db)  
    
    if success:  
        return {  
            "status": "success",  
            "message": "Classification completed",  
            "data": {  
                "system_component": complaint.system_component,  
                "failure_mode": complaint.failure_mode,  
                "severity": complaint.severity,  
                "priority": complaint.priority,  
                "level2": complaint.level2,
                "rational": complaint.rational
            }  
        }  
    else:  
        raise HTTPException(status_code=500, detail="Classification failed")

@app.post("/auto-classification/start")  
def start_auto_classification(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):  
    def classify_in_background():  
        unclassified_values = ['Unclassified', 'Uncategorized', '未分类', 'N/A', None]
        unclassified_complaints = db.query(Complaint).filter(  
            Complaint.system_component.in_(unclassified_values)  
        ).all()  
        total = len(unclassified_complaints)  
        logger.info(f"Start auto classification, total={total}")  
        for complaint in unclassified_complaints:  
            classify_complaint(complaint, db)  
        logger.info("Auto classification completed.")  
    background_tasks.add_task(classify_in_background)  
    return {"status": "classification started"}  
    

@app.get("/auto-classification/progress")  
def get_classification_progress(db: Session = Depends(get_db)):  
    total = db.query(Complaint).count()  
    classified = db.query(Complaint).filter(Complaint.system_component != None).count()  
    return {"completed": classified, "total": total}  

@app.get("/filter-options")  
def fetch_filter_options(db: Session = Depends(get_db)):  
    filter_options = get_filter_options(db)  
    return filter_options

@app.get("/monthly-trend")  
async def monthly_trend(
    system_component: Optional[list[str]] = Query(None),  
    failure_mode: Optional[list[str]] = Query(None),  
    severity: Optional[list[str]] = Query(None),  
    priority: Optional[list[str]] = Query(None),  
    country: Optional[list[str]] = Query(None),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    catalog_item_identifier: Optional[list[str]] = Query(None),
    pr_state: Optional[list[str]] = Query(None),  
    level2: Optional[list[str]] = Query(None),
    db: Session = Depends(get_db)
):  
    """Get monthly trend data for complaints"""
    # Debug log for incoming filter parameters
    logger.info(f"Monthly trend filter params: sys_comp={system_component}, failure={failure_mode}, "
                f"severity={severity}, priority={priority}, country={country}, catalog={catalog_item_identifier}, "
                f"pr_state={pr_state}, level2={level2}, dates={start_date}-{end_date}")
    
    # Pass all filters to the statistics function
    filters = {
        "system_component": system_component,
        "failure_mode": failure_mode,
        "severity": severity,
        "priority": priority,
        "country": country,
        "start_date": start_date,
        "end_date": end_date,
        "catalog_item_identifier": catalog_item_identifier,
        "pr_state": pr_state,
        "level2": level2
    }
    return get_monthly_trend(db, filters)

@app.get("/country-statistics")  
async def country_statistics(
    system_component: Optional[list[str]] = Query(None),  
    failure_mode: Optional[list[str]] = Query(None),  
    severity: Optional[list[str]] = Query(None),  
    priority: Optional[list[str]] = Query(None),  
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    catalog_item_identifier: Optional[list[str]] = Query(None),
    pr_state: Optional[list[str]] = Query(None),  
    level2: Optional[list[str]] = Query(None),
    db: Session = Depends(get_db)
):  
    """Get complaint statistics by country"""
    # Debug log for incoming filter parameters
    logger.info(f"Country statistics filter params: sys_comp={system_component}, failure={failure_mode}, "
                f"severity={severity}, priority={priority}, catalog={catalog_item_identifier}, "
                f"pr_state={pr_state}, level2={level2}, dates={start_date}-{end_date}")
    
    # Pass all filters to the country statistics function
    filters = {
        "system_component": system_component,
        "failure_mode": failure_mode,
        "severity": severity,
        "priority": priority,
        "start_date": start_date,
        "end_date": end_date,
        "catalog_item_identifier": catalog_item_identifier,
        "pr_state": pr_state,
        "level2": level2
    }
    return get_country_statistics(db, filters)

@app.get("/product-statistics")  
async def product_statistics(
    system_component: Optional[list[str]] = Query(None),  
    failure_mode: Optional[list[str]] = Query(None),  
    severity: Optional[list[str]] = Query(None),  
    priority: Optional[list[str]] = Query(None),  
    country: Optional[list[str]] = Query(None),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    pr_state: Optional[list[str]] = Query(None),  
    level2: Optional[list[str]] = Query(None),
    db: Session = Depends(get_db)
):  
    """Get complaint statistics by product"""
    # Debug log for incoming filter parameters
    logger.info(f"Product statistics filter params: sys_comp={system_component}, failure={failure_mode}, "
                f"severity={severity}, priority={priority}, country={country}, "
                f"pr_state={pr_state}, level2={level2}, dates={start_date}-{end_date}")
    
    # Pass all filters to the product statistics function
    filters = {
        "system_component": system_component,
        "failure_mode": failure_mode,
        "severity": severity,
        "priority": priority,
        "country": country,
        "start_date": start_date,
        "end_date": end_date,
        "pr_state": pr_state,
        "level2": level2
    }
    return get_product_statistics(db, filters)