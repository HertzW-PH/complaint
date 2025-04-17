import React, { useState } from "react";  
import { X, Save, AlertCircle, Cpu, Search } from "lucide-react";  
import { updateComplaintClassification, aiClassifyComplaint } from "../../utils/api";  

export default function EditComplaintModal({ complaint, onClose, onUpdate }) {  
  const [formData, setFormData] = useState({  
    system_component: complaint.system_component || "",  
    level2: complaint.level2 || "",  
    failure_mode: complaint.failure_mode || "",  
    severity: complaint.severity || "",  
    priority: complaint.priority || "",  
    rational: complaint.rational || "",  
  });  
  const [saving, setSaving] = useState(false);  
  const [analyzing, setAnalyzing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [similarComplaints, setSimilarComplaints] = useState([]);
  const [showSimilar, setShowSimilar] = useState(false);
  const [error, setError] = useState(null);  

  const handleChange = (field, value) => {  
    setFormData({  
      ...formData,  
      [field]: value,  
    });  
  };  

  const handleSave = async () => {  
    setSaving(true);  
    setError(null);  

    try {  
      await updateComplaintClassification(complaint.pr_id, formData);  
      onUpdate({  
        ...complaint,  
        ...formData,  
      });  
      onClose();  
    } catch (err) {  
      setError(err.message);  
    } finally {  
      setSaving(false);  
    }  
  };  

  const handleAIAnalysis = async () => {  
    setAnalyzing(true);  
    setError(null);  

    try {  
      const result = await aiClassifyComplaint(complaint.pr_id);  
      if (result.status === "success") {  
        setFormData({  
          system_component: result.data.system_component || "",  
          level2: result.data.level2 || "",  
          failure_mode: result.data.failure_mode || "",  
          severity: result.data.severity || "",  
          priority: result.data.priority || "",  
          rational: result.data.rational || "",  
        });  
      }  
    } catch (err) {  
      setError(err.message);  
    } finally {  
      setAnalyzing(false);  
    }  
  };

  const handleSimilarComplaints = async () => {
    setSearching(true);
    setError(null);
    setShowSimilar(true);
    
    try {
      setTimeout(() => {
        setSimilarComplaints([
          { pr_id: "PR12345", similarity: 0.89, short_description: "Similar issue with gantry operation" },
          { pr_id: "PR54321", similarity: 0.76, short_description: "Related problem in the same component" },
          { pr_id: "PR67890", similarity: 0.65, short_description: "Another complaint with similar symptoms" }
        ]);
        setSearching(false);
      }, 1500);
    } catch (err) {
      setError(err.message);
      setSearching(false);
    }
  };

  return (  
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">  
      <div className="bg-white rounded-lg shadow-lg w-[90%] h-[90%] flex flex-col">  
        <div className="flex justify-between items-center border-b py-2 px-4">  
          <h3 className="text-base font-medium">Edit Complaint Classification</h3>  
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">  
            <X className="h-5 w-5" />  
          </button>  
        </div>  

        {error && (  
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">  
            <div className="flex">  
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />  
              <span>{error}</span>  
            </div>  
          </div>  
        )}  

        <div className="flex flex-grow overflow-hidden p-6">  
          <div className={`${showSimilar ? 'w-1/2' : 'w-2/3'} pr-6 flex flex-col h-full transition-all duration-300`}>  
            <div className="bg-gray-50 p-4 rounded border mb-4 flex-shrink-0">  
              <h4 className="text-sm font-bold text-gray-700 mb-2">Complaint Information</h4>  
              <div className="text-sm text-gray-600 flex">
                <div className="w-1/3"><span className="font-bold">PR ID:</span> {complaint.pr_id}</div>
                <div className="w-1/3 text-center"><span className="font-bold">Product Name:</span> {complaint.catalog_item_name || "Not Provided"}</div>
                <div className="w-1/3"></div>
              </div>
              
              <p className="text-sm mt-3"><span className="font-bold">Short Description:</span></p>  
              <p className="text-sm text-gray-600">{complaint.short_description}</p>  
              
              <p className="text-sm mt-3"><span className="font-bold">Description:</span></p>  
              <p className="text-sm text-gray-600">{complaint.description || "Not Provided"}</p>  
              
              <p className="text-sm mt-3"><span className="font-bold">Source Customer Description:</span></p>  
              <p className="text-sm text-gray-600">{complaint.source_customer_description || "Not Provided"}</p>  
            </div>  
            
            <div className="flex flex-col flex-grow">  
              <p className="text-sm font-bold text-gray-700 mb-1">Source Notes:</p>      
                <textarea className="w-full text-sm p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow resize-none" style={{ whiteSpace: 'pre-wrap' }} readOnly>{complaint.source_notes || "Not Provided"}</textarea>  
            
            </div>  
          </div>  

          {showSimilar && (
            <div className="w-1/4 flex flex-col h-full px-4 border-l border-r border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-gray-700">Similar Complaints</h4>
                <button 
                  onClick={() => setShowSimilar(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              {searching ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="mt-3 text-sm text-gray-600">Finding similar complaints...</p>
                </div>
              ) : similarComplaints.length > 0 ? (
                <div className="flex-grow overflow-y-auto">
                  {similarComplaints.map((item) => (
                    <div key={item.pr_id} className="mb-3 p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition cursor-pointer">
                      <div className="flex justify-between">
                        <span className="font-bold text-sm text-blue-600">{item.pr_id}</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          {Math.round(item.similarity * 100)}% match
                        </span>
                      </div>
                      <p className="text-sm mt-1 text-gray-600 line-clamp-3">{item.short_description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Search className="h-8 w-8 mb-2 text-gray-400" />
                  <p className="text-sm">No similar complaints found</p>
                </div>
              )}
            </div>
          )}

          <div className={`${showSimilar ? 'w-1/4' : 'w-1/3'} flex flex-col h-full transition-all duration-300`}>  
            <div className="space-y-3 flex-shrink-0">  
              <div>  
                <label className="block text-sm font-bold text-gray-700 mb-1">  
                  System Component  
                </label>  
                <select  
                  className="w-full text-sm p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"  
                  value={formData.system_component}  
                  onChange={(e) => handleChange("system_component", e.target.value)}  
                  required  
                >  
                  <option value="">Please select...</option>  
                  <option value="Gantry">Gantry</option>  
                  <option value="Couch">Couch</option>  
                  <option value="Console">Console</option>  
                  <option value="Application">Applicatoin</option>  
                  <option value="CIRS">CIRS</option>  
                  <option value="Image Quality">Image Quality</option>  
                  <option value="IC">IC</option>  
                  <option value="DMS">DMS</option>  
                  <option value="PC Hardware">PC Hardware</option>  
                  <option value="Enhancement">Enhancement</option>  
                  <option value="Not a complaint">Not a complaint</option>  
                </select>  
              </div>  

              <div>  
                <label className="block text-sm font-bold text-gray-700 mb-1">  
                  Level2  
                </label>  
                <input  
                  type="text"  
                  className="w-full text-sm p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"  
                  value={formData.level2}  
                  onChange={(e) => handleChange("level2", e.target.value)}  
                />  
              </div>  

              <div>  
                <label className="block text-sm font-bold text-gray-700 mb-1">  
                  Failure Mode  
                </label>  
                <select  
                  className="w-full text-sm p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"  
                  value={formData.failure_mode}  
                  onChange={(e) => handleChange("failure_mode", e.target.value)}  
                  required  
                >  
                  <option value="">Please select...</option>  
                  <option value="FM1-System Down">FM1-System Down</option>  
                  <option value="FM2-Fail to scan">FM2-Fail to scan</option>  
                  <option value="FM3-Fail to generate images">FM3-Fail to generate images</option>  
                  <option value="FM4-Image Quality">FM4-Image Quality</option>  
                  <option value="FM5-Fail to initialize/operation">FM5-Fail to initialize/operation</option>  
                  <option value="FM6-Fail to provide correct information">FM6-Fail to provide correct information</option>  
                  <option value="FM7-DICOM/Interoperability">FM7-DICOM/Interoperability</option>  
                  <option value="FM8-Usability">FM8-Usability</option>  
                  <option value="Enhancement">Enhancement</option>  
                  <option value="Not a failure">Not a failure</option>  
                </select>  
              </div>  

              <div className="flex gap-2">
                <div className="w-1/2">  
                  <label className="block text-sm font-bold text-gray-700 mb-1">  
                    Severity  
                  </label>  
                  <select  
                    className="w-full text-sm p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"  
                    value={formData.severity}  
                    onChange={(e) => handleChange("severity", e.target.value)}  
                    required  
                  >  
                    <option value="">Select...</option>  
                    <option value="Safety">Safety</option>  
                    <option value="High">High</option>  
                    <option value="Med">Med</option>  
                    <option value="Low">Low</option>  
                    <option value="Enhancement">Enhancement</option>  
                  </select>  
                </div>  

                <div className="w-1/2">  
                  <label className="block text-sm font-bold text-gray-700 mb-1">  
                    Priority  
                  </label>  
                  <select  
                    className="w-full text-sm p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"  
                    value={formData.priority}  
                    onChange={(e) => handleChange("priority", e.target.value)}  
                    required  
                  >  
                    <option value="">Select...</option>  
                    <option value="High">High</option>  
                    <option value="Med">Med</option>  
                    <option value="Low">Low</option>  
                  </select>  
                </div>  
              </div>
            </div>  

            <div className="mt-2 flex flex-col flex-grow">  
              <label className="block text-sm font-bold text-gray-700 mb-1">  
                Rational  
              </label>  
              <textarea  
                className="w-full text-sm p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow resize-none"  
                value={formData.rational}  
                onChange={(e) => handleChange("rational", e.target.value)}  
              />  
            </div>  
          </div>  
        </div>  

        <div className="flex justify-between gap-2 border-t p-4 mt-auto">
          <div className="flex gap-2">
            <button  
              onClick={handleAIAnalysis}  
              disabled={analyzing}  
              className={`  
                px-4 py-2 rounded-md text-sm text-white flex items-center  
                ${analyzing ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}  
              `}  
            >  
              {analyzing ? (  
                <>  
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">  
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>  
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 7.962 7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>  
                  </svg>  
                  AI Analyzing...  
                </>  
              ) : (  
                <>  
                  <Cpu className="h-4 w-4 mr-1" />  
                  AI Analysis  
                </>  
              )}  
            </button>
            
            <button  
              onClick={handleSimilarComplaints}  
              disabled={searching}  
              className={`  
                px-4 py-2 rounded-md text-sm text-white flex items-center  
                ${searching ? "bg-teal-400 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700"}  
              `}  
            >  
              {searching ? (  
                <>  
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">  
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>  
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 7.962 7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>  
                  </svg>  
                  Searching...  
                </>  
              ) : (  
                <>  
                  <Search className="h-4 w-4 mr-1" />  
                  Similar Complaints  
                </>  
              )}  
            </button>
          </div>
          
          <div className="flex gap-2">
            <button  
              onClick={onClose}  
              className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"  
            >  
              Cancel  
            </button>  
            <button  
              onClick={handleSave}  
              disabled={saving}  
              className={`  
                px-4 py-2 rounded-md text-sm text-white flex items-center  
                ${saving ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}  
              `}  
            >  
              {saving ? (  
                <>  
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">  
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>  
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 7.962 7.962 7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>  
                  </svg>  
                  Saving...  
                </>  
              ) : (  
                <>  
                  <Save className="h-4 w-4 mr-1" />  
                  Save  
                </>  
              )}  
            </button>
          </div>
        </div>  
      </div>  
    </div>  
  );  
}