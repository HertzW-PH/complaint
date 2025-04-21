# CT Complaint Classification Template Improvements

## Overview
This document outlines the planned improvements for the CT equipment complaint classification prompt template in `backend/services.py`. The improvements focus on code structure, template standardization, and internationalization considerations.

## 1. Code Structure Improvements

### Documentation Block
- Add comprehensive docstring explaining template purpose and usage
- Document character encoding (UTF-8) for Chinese text support
- Detail input parameters and their formats
- Include maintainability guidelines

### Template Constants
```python
# Constants to be added at the top of services.py
TEMPLATE_VERSION = "1.0.0"
HEADING_MARKER = "#"
SEPARATOR = "---"
LANG = "zh-CN"  # For future internationalization
```

### Prompt Structure Improvements
- Current:
```python
prompt = f"""

CT设备投诉自动分类指引  

"""
```
- Improved:
```python
prompt = f"""{SEPARATOR}

{HEADING_MARKER} CT设备投诉自动分类指引

{SEPARATOR}
"""
```

## 2. Template Format Standardization

### Markdown Formatting Rules
1. Headers
   - Main title: Single `#`
   - Sections: Double `##`
   - Subsections: Triple `###`
   
2. Spacing Guidelines
   - Single blank line between sections
   - No consecutive blank lines
   - Consistent indentation (4 spaces for lists)

3. Section Separators
   - Use `---` between major sections
   - Consistent spacing around separators

## 3. Internationalization Considerations

### Language Support
- Add language identifier in template constants
- Prepare structure for template localization
- Document encoding requirements (UTF-8)
- Establish language-specific formatting guidelines

### Future Enhancements
- Support for multiple languages
- Language-specific templates
- Regional formatting variations
- Character encoding validation

## Implementation Steps

1. Add documentation and constants
2. Improve template structure and formatting
3. Implement consistent markdown usage
4. Add language support preparations
5. Update template content with new formatting
6. Test with various input scenarios

## Success Criteria

- Improved code readability
- Consistent markdown formatting
- Clean section transitions
- Proper encoding handling
- Future-ready for internationalization
- Maintainable template structure