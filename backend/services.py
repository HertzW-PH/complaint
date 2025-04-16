# services.py
import requests
import json
from sqlalchemy import func, extract
from sqlalchemy.orm import Session
from models import Complaint
import traceback
import datetime

def get_filter_options(db: Session):
    """Fetch unique filter options dynamically from the database."""
    try:
        # Fetch unique values for each filter field
        system_components = db.query(Complaint.system_component).distinct().all()
        failure_modes = db.query(Complaint.failure_mode).distinct().all()
        severities = db.query(Complaint.severity).distinct().all()
        priorities = db.query(Complaint.priority).distinct().all()
        countries = db.query(Complaint.event_country).distinct().all()
        product_identifiers = db.query(Complaint.catalog_item_identifier).distinct().all()
        level2_categories = db.query(Complaint.level2).distinct().all()
        openstate = db.query(Complaint.pr_state).distinct().all()
        
        # Fetch product names along with their identifiers
        product_details = db.query(
            Complaint.catalog_item_identifier, 
            Complaint.catalog_item_name
        ).distinct().all()
        
        # Create a list of product name objects with identifier and name
        product_names = [
            {"identifier": item[0], "name": item[1]} 
            for item in product_details 
            if item[0] and item[1]  # Only include entries with both identifier and name
        ]

        # Convert results to a list of strings
        return {
            "system_components": ['']+[item[0] for item in system_components if item[0]],
            "failure_modes": ['']+[item[0] for item in failure_modes if item[0]],
            "severities": ['']+[item[0] for item in severities if item[0]],
            "priorities": ['']+[item[0] for item in priorities if item[0]],
            "countries": ['']+[item[0] for item in countries if item[0]],
            "is_open":['']+[item[0] for item in openstate if item[0]],
            "product_identifiers": ['']+[item[0] for item in product_identifiers if item[0]],
            "product_names": product_names,
            "level2_categories": ['']+[item[0] for item in level2_categories if item[0]],
        }
    except Exception as e:
        print(f"Error fetching filter options: {e}")
        traceback.print_exc()
        return {}

def get_prompt_for_classification(complaint):  
    """生成用于分类的提示词"""  
    
    # 提取需要分析的字段  
    short_description = complaint.short_description or ""  
    description = complaint.description or ""  
    source_customer_description = complaint.source_customer_description or ""  
    source_notes = complaint.source_notes or ""  
    
    prompt = f"""  
    作为医疗CT设备投诉分类专家，拥有丰富的CT产品知识和医疗器械法规知识。请分析以下CT设备投诉信息，并按照指定的分类系统进行分类。  
    
    投诉信息:  
    短描述: {short_description}  
    详细描述: {description}  
    客户描述: {source_customer_description}  
    来源记录: {source_notes}  
    
    请根据以上信息，将投诉严格分类为以下几类:  
    
    1. 系统主要构成 (严格按照下面分类选择其中一项，不要发明新的分类名称):  

       - Gantry: 与CT扫描仪的机架部分相关的问题  
       - Couch: 与患者床/台以及附件相关的问题  
       - Software: 与扫描控制，用户操作，图像浏览及处理软件功能相关的问题  
       - CIRS: 与图像重建，重建性能或包含CIRS/Recon字样的相关的问题
       - Image Quality: 与图像质量相关的问题  
       - IC: 与CT球管和高压相关的问题
       - DMS: 与CT探测器以及模块更换相关的问题
       - PC Hardware: 与计算机硬件相关的问题，如鼠标，键盘，显示器，硬盘等  
       - Enhancement: 功能增强请求  
       - Not a complaint: 不是投诉  
    
    2. 失效模式 (严格按照下面分类选择其中一项，不要发明新的分类名称):  
       - FM1-System Down: 系统完全无法工作  
       - FM2-Fail to scan: 无法进行扫描  
       - FM3-Fail to generate images: 无法生成图像  
       - FM4-Image Quality: 图像质量问题  
       - FM5-Fail to initialize/operation: 初始化或操作失败  
       - FM6-Fail to provide correct information: 无法提供正确信息  
       - FM7-DICOM/Interoperability: DICOM或互操作性问题  
       - FM8-Usability: 可用性问题  
       - Not a failure: 不是失效  
    
    3. 严重程度 (严格按照下面分类选择其中一项，不要发明新的分类名称):  
       - Safety: 安全相关问题  
       - High: 高严重性  
       - Med: 中等严重性  
       - Low: 低严重性  
       - Enhancement: 功能增强  
    
    4. 优先级 (严格按照下面分类选择其中一项，不要发明新的分类名称):  
       - High: 高优先级  
       - Med: 中等优先级  
       - Low: 低优先级 
        
    5. 二级分类（根据系统主要构成进行二级分类）
        - Gantry:  
           - Power Supply: 电源/PDU相关故障  
           - Communication: 机架通讯相关故障  
           - Slipring: 滑环相关故障  
           - Cover: 外罩以及Mylar Ring相关问题  
           - Panel: 控制面板相关问题  
           - Intercom: 技师与患者对讲相关问题
           - CT Box: CT控制盒问题
           - Noise: 噪声问题  
           - Firmware: 固件问题
           - Software: 软件问题
           - Other: 其他问题
        - Couch:  
           - Accessory: 头托，延长板，床垫，绑带，脚踏开关等相关问题  
           - Motion Control: 床运动控制相关问题  
           - Noise: 噪声问题
           - Cable: 电缆相关问题,比如PIM，Encoder电缆等  
           - Servo: 伺服相关问题
           - PCBA: PCBA相关问题
           - User Experience: 用户体验相关问题
           - Other: 其他问题
        - CIRS:
            - Timesync: CIRS服务器Time Sync相关问题
            - Slowness: 重建速度慢问题
            - IQ: 图像质量相关问题
            - No Image: 重建不出图像或丢失图像问题
            - Stuck: 卡死
            - Other: 其他问题
            
        - Software:  
           - Configuration: 系统设置(协议, DICOM, 时间）配置相关问题  
           - DICOM/Connectivity: DICOM/PACS/RIS/HIS 图像传输及Worklist/MPPS相关问题  
           - ExamCard: 扫描协议/EC相关问题
           - Usability: 可用性相关问题  
           - Security: 信息安全相关问题  
           - Bolus Tracking: Bolus Tracking, 对比剂增强扫描触发相关问题  
           - Film/Report: 打印胶片或报告相关问题  
           - IVC: IVC软件问题
           - BSOD/Crash: BSOD/蓝屏及系统崩溃相关问题
           - Stuck/Slowness: 系统卡死、速度慢相关问题
           - Restart: 重启问题
           - Dose: 放射剂量相关问题
           - Application: 应用程序问题, 特别的图像处理相关的应用程序，比如MPR, VR, 3D, CTA等
           - Tools: 服务工具类问题
           - Other: 其他问题
        - Image Quality:  
           - Calibration: 校正问题，重新校正可恢复  
           - Dose: 放射剂量相关问题  
           - Preview IQ: 预览图像质量问题  
           - Poor IQ: 整体图像质量问题，笼统的图像质量抱怨
           - Artifact: 图像伪影
           - DMS Module: DMS模块问题
           - Other: 其他问题
        - DMS:
            - Module: 模块替换相关问题  
            - Firmware: 固件问题  
            - Noise: 噪声问题  
            - Calibration: 校准问题
            - Power: 电源相关问题
            - Other: 其他问题
        - IC:
            - Tube: 球管相关故障  
            - Generator: 高压发生器相关故障 
            - PB: Power Block 相关故障
            - CLU/Heat Exchanger: 换热器相关故障 
            - Other: 其他问题  

    请以JSON格式返回结果，包含以下字段: system_component, failure_mode, severity, priority, level2 ，不要包含任何解释。  
    """  
    
    return prompt  

def classify_complaint(complaint, db: Session):  
    """使用Ollama对投诉进行分类"""  
    prompt = get_prompt_for_classification(complaint)  
    # 调用本地Ollama API  
    response = requests.post(  
        "http://130.147.128.192:11434/api/generate",  
        json={  
            "model": "deepseek-r1:14b",  # 或根据您部署的模型修改  
            "prompt": prompt,  
            "stream": False  
        }  
    )  
    
    if response.status_code == 200:  
        result = response.json()  
        response_text = result.get("response", "")  

        # 尝试从响应中提取JSON  
        try:  
            # 查找JSON部分  
            print(f"Complaint: {complaint.pr_id} {complaint.short_description}")
            start_rational = response_text.find('<think>')+7
            end_rational = response_text.rfind('</think>')
            rational = response_text[start_rational:end_rational]
            start_idx = response_text.find('{', end_rational)  
            end_idx = response_text.rfind('}') + 1  
            print(rational)
            if start_idx >= 0 and end_idx > 0:  
                json_str = response_text[start_idx:end_idx]  
                print(json_str)
                try:
                    classification = json.loads(json_str)  
                    
                    # 更新投诉记录  
                    complaint.system_component = classification.get("system_component")  
                    complaint.failure_mode = classification.get("failure_mode")  
                    complaint.severity = classification.get("severity")  
                    complaint.priority = classification.get("priority")  
                    
                    level2 = str(classification.get("level2"))
                    
                    complaint.level2 = level2
                except:
                    print('multi-classification start')
                    system_component = ''
                    failure_mode = ''
                    severity = ''
                    priority = ''
                    level2 = ''
                    brack_start = 0
                    brack_end = json_str.find('}', brack_start)+1
                    print("initializing")
                    while(brack_end != -1 and brack_start != -1):
                        print(f"starting {brack_start}-{brack_end}")
                        sub_json = json_str[brack_start:brack_end]
                        print(sub_json)
                        brack_start = json_str.find('{', brack_end)
                        brack_end = json_str.find('}', brack_start)+1
                        sub_classification = json.loads(sub_json)
                        print(sub_classification)
                        system_component = sub_classification.get("system_component") 
                        failure_mode = sub_classification.get("failure_mode")
                        if(brack_end == -1):
                            system_component += '|'
                            failure_mode += '|'
                            print("continue sub_classification")
                        severity = sub_classification.get("severity")
                        priority = sub_classification.get("priority")
                         
                        level2 = sub_classification.get("level2")
                        
                    complaint.system_component = system_component
                    complaint.failure_mode = str(failure_mode)
                    complaint.severity = str(severity)
                    complaint.priority = str(priority)
                    complaint.level2 = str(level2)
                    print("multiple classification")
                complaint.rational = rational    
                complaint.updated_at = func.now()  
                
                db.commit()  
                return True  
        except Exception as e:  
            print(f"解析分类结果时出错: {e} {e.__cause__}")  
            traceback.print_exc()  
    
    return False  

def get_statistics(db: Session, filters=None):  
    """获取分类统计信息"""
    # Start with the base query
    query = db.query(Complaint)
    
    # Apply filters if provided
    if filters:
        # Handle system_component filter
        if filters.get("system_component"):
            system_component = filters["system_component"]
            if "" in system_component:
                system_component.remove("")
            if system_component:
                query = query.filter(Complaint.system_component.in_(system_component))
        
        # Handle failure_mode filter
        if filters.get("failure_mode"):
            failure_mode = filters["failure_mode"]
            if "" in failure_mode:
                failure_mode.remove("")
            if failure_mode:
                query = query.filter(Complaint.failure_mode.in_(failure_mode))
        
        # Handle severity filter
        if filters.get("severity"):
            severity = filters["severity"]
            if "" in severity:
                severity.remove("")
            if severity:
                query = query.filter(Complaint.severity.in_(severity))
        
        # Handle priority filter
        if filters.get("priority"):
            priority = filters["priority"]
            if "" in priority:
                priority.remove("")
            if priority:
                query = query.filter(Complaint.priority.in_(priority))
        
        # Handle country filter
        if filters.get("country"):
            country = filters["country"]
            if "" in country:
                country.remove("")
            if country:
                query = query.filter(Complaint.event_country.in_(country))
        
        # Handle catalog_item_identifier filter
        if filters.get("catalog_item_identifier"):
            catalog = filters["catalog_item_identifier"]
            if "" in catalog:
                catalog.remove("")
            if catalog:
                query = query.filter(Complaint.catalog_item_identifier.in_(catalog))
        
        # Handle pr_state filter
        if filters.get("pr_state"):
            pr_state = filters["pr_state"]
            if "" in pr_state:
                pr_state.remove("")
            if pr_state:
                query = query.filter(Complaint.pr_state.in_(pr_state))
        
        # Handle level2 filter
        if filters.get("level2"):
            level2 = filters["level2"]
            if "" in level2:
                level2.remove("")
            if level2:
                query = query.filter(Complaint.level2.in_(level2))
        
        # Date range filter
        if filters.get("start_date"):
            try:
                import pandas as pd
                start = pd.to_datetime(filters["start_date"]).date()
                query = query.filter(Complaint.initiate_date >= start)
            except Exception as e:
                print(f"Error parsing start_date: {str(e)}")
                
        if filters.get("end_date"):
            try:
                import pandas as pd
                end = pd.to_datetime(filters["end_date"]).date()
                query = query.filter(Complaint.initiate_date <= end)
            except Exception as e:
                print(f"Error parsing end_date: {str(e)}")
    
    # Get filtered complaints and calculate statistics
    filtered_complaints = query
    
    # 系统主要构成统计  
    system_component_stats = filtered_complaints.with_entities(
        Complaint.system_component, func.count(Complaint.id)
    ).group_by(Complaint.system_component).all()
    
    # 失效模式统计  
    failure_mode_stats = filtered_complaints.with_entities(
        Complaint.failure_mode, func.count(Complaint.id)
    ).group_by(Complaint.failure_mode).all()
    
    # 严重程度统计  
    severity_stats = filtered_complaints.with_entities(
        Complaint.severity, func.count(Complaint.id)
    ).group_by(Complaint.severity).all()
    
    # 优先级统计  
    priority_stats = filtered_complaints.with_entities(
        Complaint.priority, func.count(Complaint.id)
    ).group_by(Complaint.priority).all()
    
    # 是否开放状态统计
    is_open_stats = filtered_complaints.with_entities(
        Complaint.pr_state, func.count(Complaint.id)
    ).group_by(Complaint.pr_state).all()
    
    # 二级分类统计 - L2 category statistics
    level2_stats = filtered_complaints.with_entities(
        Complaint.level2, func.count(Complaint.id)
    ).group_by(Complaint.level2).all()
    
    return {  
        "system_component": dict(system_component_stats),  
        "failure_mode": dict(failure_mode_stats),  
        "severity": dict(severity_stats),  
        "priority": dict(priority_stats),
        "is_open": dict(is_open_stats),
        "level2": dict(level2_stats)
    }

def get_monthly_trend(db: Session, filters=None):
    """Get monthly trend data for complaints"""
    # Start with the base query
    query = db.query(Complaint)
    
    # Apply filters if provided (same as in get_statistics)
    if filters:
        # Handle system_component filter
        if filters.get("system_component"):
            system_component = filters["system_component"]
            if "" in system_component:
                system_component.remove("")
            if system_component:
                query = query.filter(Complaint.system_component.in_(system_component))
        
        # Handle failure_mode filter
        if filters.get("failure_mode"):
            failure_mode = filters["failure_mode"]
            if "" in failure_mode:
                failure_mode.remove("")
            if failure_mode:
                query = query.filter(Complaint.failure_mode.in_(failure_mode))
        
        # Handle severity filter
        if filters.get("severity"):
            severity = filters["severity"]
            if "" in severity:
                severity.remove("")
            if severity:
                query = query.filter(Complaint.severity.in_(severity))
        
        # Handle priority filter
        if filters.get("priority"):
            priority = filters["priority"]
            if "" in priority:
                priority.remove("")
            if priority:
                query = query.filter(Complaint.priority.in_(priority))
        
        # Handle country filter
        if filters.get("country"):
            country = filters["country"]
            if "" in country:
                country.remove("")
            if country:
                query = query.filter(Complaint.event_country.in_(country))
        
        # Handle catalog_item_identifier filter
        if filters.get("catalog_item_identifier"):
            catalog = filters["catalog_item_identifier"]
            if "" in catalog:
                catalog.remove("")
            if catalog:
                query = query.filter(Complaint.catalog_item_identifier.in_(catalog))
        
        # Handle pr_state filter
        if filters.get("pr_state"):
            pr_state = filters["pr_state"]
            if "" in pr_state:
                pr_state.remove("")
            if pr_state:
                query = query.filter(Complaint.pr_state.in_(pr_state))
        
        # Handle level2 filter
        if filters.get("level2"):
            level2 = filters["level2"]
            if "" in level2:
                level2.remove("")
            if level2:
                query = query.filter(Complaint.level2.in_(level2))
        
        # Date range filter
        if filters.get("start_date"):
            try:
                import pandas as pd
                start = pd.to_datetime(filters["start_date"]).date()
                query = query.filter(Complaint.initiate_date >= start)
            except Exception as e:
                print(f"Error parsing start_date: {str(e)}")
                
        if filters.get("end_date"):
            try:
                import pandas as pd
                end = pd.to_datetime(filters["end_date"]).date()
                query = query.filter(Complaint.initiate_date <= end)
            except Exception as e:
                print(f"Error parsing end_date: {str(e)}")
    
    # Get monthly data (format as YYYY-MM)
    monthly_data = query.with_entities(
        func.strftime('%Y-%m', Complaint.initiate_date).label('month'),
        func.count(Complaint.id).label('count')
    ).group_by(func.strftime('%Y-%m', Complaint.initiate_date)).order_by('month').all()
    
    # Convert to list of dictionaries
    result = [{'month': item[0], 'count': item[1]} for item in monthly_data if item[0] is not None]
    
    # Ensure we have at least the last 12 months represented
    if not result:
        # If no data, return empty list
        return []
    
    # Fill in missing months with zero counts
    today = datetime.date.today()
    full_result = []
    
    # Get the earliest month in our data
    try:
        earliest_month = min([datetime.datetime.strptime(item['month'], '%Y-%m') for item in result])
        
        # Ensure we have at least the past 12 months
        twelve_months_ago = datetime.datetime(today.year - 1, today.month, 1)
        earliest_month = min(earliest_month, twelve_months_ago)
        
        # Generate all months from earliest to current
        current_month = earliest_month
        end_month = datetime.datetime(today.year, today.month, 1)
        
        while current_month <= end_month:
            month_str = current_month.strftime('%Y-%m')
            existing = next((item for item in result if item['month'] == month_str), None)
            
            if existing:
                full_result.append(existing)
            else:
                full_result.append({'month': month_str, 'count': 0})
            
            # Move to next month
            if current_month.month == 12:
                current_month = datetime.datetime(current_month.year + 1, 1, 1)
            else:
                current_month = datetime.datetime(current_month.year, current_month.month + 1, 1)
    except Exception as e:
        print(f"Error filling missing months: {str(e)}")
        traceback.print_exc()
        return result  # Return original result if error
        
    return full_result

def get_country_statistics(db: Session, filters=None):
    """Get complaint statistics by country"""
    # Start with the base query
    query = db.query(Complaint)
    
    # Apply filters (same as in get_statistics)
    if filters:
        # Handle system_component filter
        if filters.get("system_component"):
            system_component = filters["system_component"]
            if "" in system_component:
                system_component.remove("")
            if system_component:
                query = query.filter(Complaint.system_component.in_(system_component))
        
        # Handle failure_mode filter
        if filters.get("failure_mode"):
            failure_mode = filters["failure_mode"]
            if "" in failure_mode:
                failure_mode.remove("")
            if failure_mode:
                query = query.filter(Complaint.failure_mode.in_(failure_mode))
        
        # Handle severity filter
        if filters.get("severity"):
            severity = filters["severity"]
            if "" in severity:
                severity.remove("")
            if severity:
                query = query.filter(Complaint.severity.in_(severity))
        
        # Handle priority filter
        if filters.get("priority"):
            priority = filters["priority"]
            if "" in priority:
                priority.remove("")
            if priority:
                query = query.filter(Complaint.priority.in_(priority))
        
        # Handle catalog_item_identifier filter
        if filters.get("catalog_item_identifier"):
            catalog = filters["catalog_item_identifier"]
            if "" in catalog:
                catalog.remove("")
            if catalog:
                query = query.filter(Complaint.catalog_item_identifier.in_(catalog))
        
        # Handle pr_state filter
        if filters.get("pr_state"):
            pr_state = filters["pr_state"]
            if "" in pr_state:
                pr_state.remove("")
            if pr_state:
                query = query.filter(Complaint.pr_state.in_(pr_state))
        
        # Handle level2 filter
        if filters.get("level2"):
            level2 = filters["level2"]
            if "" in level2:
                level2.remove("")
            if level2:
                query = query.filter(Complaint.level2.in_(level2))
        
        # Date range filter
        if filters.get("start_date"):
            try:
                import pandas as pd
                start = pd.to_datetime(filters["start_date"]).date()
                query = query.filter(Complaint.initiate_date >= start)
            except Exception as e:
                print(f"Error parsing start_date: {str(e)}")
                
        if filters.get("end_date"):
            try:
                import pandas as pd
                end = pd.to_datetime(filters["end_date"]).date()
                query = query.filter(Complaint.initiate_date <= end)
            except Exception as e:
                print(f"Error parsing end_date: {str(e)}")
    
    # Count complaints by country
    country_stats = query.with_entities(
        Complaint.event_country, 
        func.count(Complaint.id)
    ).group_by(Complaint.event_country).all()
    
    # Convert to dictionary
    result = {}
    for country, count in country_stats:
        if country and country.strip():  # Skip empty countries
            result[country] = count
    
    return result

def get_product_statistics(db: Session, filters=None):
    """Get complaint statistics by product"""
    # Start with the base query
    query = db.query(Complaint)
    
    # Apply filters (same as in get_statistics)
    if filters:
        # Handle system_component filter
        if filters.get("system_component"):
            system_component = filters["system_component"]
            if "" in system_component:
                system_component.remove("")
            if system_component:
                query = query.filter(Complaint.system_component.in_(system_component))
        
        # Handle failure_mode filter
        if filters.get("failure_mode"):
            failure_mode = filters["failure_mode"]
            if "" in failure_mode:
                failure_mode.remove("")
            if failure_mode:
                query = query.filter(Complaint.failure_mode.in_(failure_mode))
        
        # Handle severity filter
        if filters.get("severity"):
            severity = filters["severity"]
            if "" in severity:
                severity.remove("")
            if severity:
                query = query.filter(Complaint.severity.in_(severity))
        
        # Handle priority filter
        if filters.get("priority"):
            priority = filters["priority"]
            if "" in priority:
                priority.remove("")
            if priority:
                query = query.filter(Complaint.priority.in_(priority))
        
        # Handle country filter
        if filters.get("country"):
            country = filters["country"]
            if "" in country:
                country.remove("")
            if country:
                query = query.filter(Complaint.event_country.in_(country))
        
        # Handle pr_state filter
        if filters.get("pr_state"):
            pr_state = filters["pr_state"]
            if "" in pr_state:
                pr_state.remove("")
            if pr_state:
                query = query.filter(Complaint.pr_state.in_(pr_state))
        
        # Handle level2 filter
        if filters.get("level2"):
            level2 = filters["level2"]
            if "" in level2:
                level2.remove("")
            if level2:
                query = query.filter(Complaint.level2.in_(level2))
        
        # Date range filter
        if filters.get("start_date"):
            try:
                import pandas as pd
                start = pd.to_datetime(filters["start_date"]).date()
                query = query.filter(Complaint.initiate_date >= start)
            except Exception as e:
                print(f"Error parsing start_date: {str(e)}")
                
        if filters.get("end_date"):
            try:
                import pandas as pd
                end = pd.to_datetime(filters["end_date"]).date()
                query = query.filter(Complaint.initiate_date <= end)
            except Exception as e:
                print(f"Error parsing end_date: {str(e)}")
    
    # Count complaints by product
    product_stats = query.with_entities(
        Complaint.catalog_item_name, 
        func.count(Complaint.id)
    ).group_by(Complaint.catalog_item_name).all()
    
    # Convert to dictionary
    result = {}
    for product, count in product_stats:
        if product and product.strip():  # Skip empty products
            result[product] = count
    
    return result
