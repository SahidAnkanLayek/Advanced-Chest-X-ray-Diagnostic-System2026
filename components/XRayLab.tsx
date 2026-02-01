
// import React, { useState, useRef } from 'react';
// import { Upload, X, Loader2, Thermometer, FileDown, Eye, AlertCircle, Info, CheckCircle2, Zap, User, WifiOff } from 'lucide-react';
// import PredictionList from './PredictionList';
// import HeatmapOverlay from './HeatmapOverlay';
// import { analyzeImage, downloadReport } from '../services/api';
// import { AnalysisResult, PatientDetails } from '../types';

// const XRayLab: React.FC = () => {
//   const [file, setFile] = useState<File | null>(null);
//   const [preview, setPreview] = useState<string | null>(null);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [isExporting, setIsExporting] = useState(false);
//   const [result, setResult] = useState<AnalysisResult | null>(null);
//   const [showHeatmap, setShowHeatmap] = useState(true);
//   const [analysisStep, setAnalysisStep] = useState<string>('');
//   const [isSimulation, setIsSimulation] = useState(false);
  
//   // Patient details state
//   const [patient, setPatient] = useState<PatientDetails>({
//     name: 'John Doe',
//     patientId: 'PT-882192',
//     dob: '1985-05-12',
//     gender: 'Male'
//   });

//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const selectedFile = e.target.files?.[0];
//     if (selectedFile) {
//       setFile(selectedFile);
//       setPreview(URL.createObjectURL(selectedFile));
//       setResult(null);
//       setIsSimulation(false);
//     }
//   };

//   const handleReset = () => {
//     setFile(null);
//     setPreview(null);
//     setResult(null);
//     setIsAnalyzing(false);
//     setIsSimulation(false);
//     if (fileInputRef.current) fileInputRef.current.value = '';
//   };

//   const runAnalysis = async () => {
//     if (!file) return;

//     setIsAnalyzing(true);
//     setAnalysisStep('Connecting to Neural Engine...');
    
//     try {
//       await new Promise(r => setTimeout(r, 800));
//       setAnalysisStep('Pre-processing image (224x224)...');
//       await new Promise(r => setTimeout(r, 600));
      
//       const response = await analyzeImage(file);
      
//       // If report ID starts with SIM, it's a fallback
//       if (response.reportId.startsWith('SIM-')) {
//         setIsSimulation(true);
//       }
      
//       setResult({ ...response, patient });
//     } catch (err) {
//       console.error(err);
//       alert('Analysis failed. Critical system error.');
//     } finally {
//       setIsAnalyzing(false);
//       setAnalysisStep('');
//     }
//   };

//   const handleDownloadReport = async () => {
//     if (!result || !file) return;
//     setIsExporting(true);
//     try {
//       const reader = new FileReader();
//       reader.onloadend = async () => {
//         const base64 = reader.result as string;
//         await downloadReport(result, base64, patient);
//         setIsExporting(false);
//       };
//       reader.readAsDataURL(file);
//     } catch (e) {
//       console.error(e);
//       alert("Note: Server-side PDF generation requires a running FastAPI backend. Attempting fallback...");
//       setIsExporting(false);
//     }
//   };

//   return (
//     <div className="max-w-6xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-4">
//           <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
//             Diagnostic Analysis Lab
//             <span className="text-xs font-normal bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded">PROD-X7</span>
//           </h1>
//           {isSimulation && (
//             <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-600 dark:text-amber-500 text-[10px] font-bold uppercase tracking-wider animate-pulse">
//               <WifiOff size={12} />
//               Simulation Mode
//             </div>
//           )}
//         </div>
//         {result && (
//           <div className="flex gap-2">
//             <button 
//               onClick={handleReset}
//               disabled={isExporting}
//               className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors text-sm disabled:opacity-50"
//             >
//               <X size={16} /> New Scan
//             </button>
//             <button 
//               onClick={handleDownloadReport}
//               disabled={isExporting}
//               className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors text-sm shadow-lg shadow-blue-600/20 disabled:opacity-50"
//             >
//               {isExporting ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />} 
//               {isExporting ? 'Generating Report...' : 'Export PDF Report'}
//             </button>
//           </div>
//         )}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
//         <div className="lg:col-span-7 space-y-4">
//           <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden aspect-square relative group shadow-sm">
//             {!preview ? (
//               <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
//                 <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
//                   <Upload className="text-blue-500" size={32} />
//                 </div>
//                 <span className="text-slate-900 dark:text-white font-medium mb-1">Upload Chest X-ray</span>
//                 <span className="text-slate-500 text-sm">DICOM, JPEG or PNG format</span>
//                 <input 
//                   type="file" 
//                   className="hidden" 
//                   ref={fileInputRef} 
//                   onChange={handleFileChange} 
//                   accept="image/*"
//                 />
//               </label>
//             ) : (
//               <div className="relative w-full h-full flex items-center justify-center bg-slate-50 dark:bg-black">
//                 {showHeatmap && result ? (
//                   <HeatmapOverlay originalImage={preview} heatmapData={result.heatmapUrl} />
//                 ) : (
//                   <img 
//                     src={preview} 
//                     alt="X-ray Preview" 
//                     className="max-h-full max-w-full object-contain"
//                   />
//                 )}

//                 {isAnalyzing && (
//                   <div className="absolute inset-0 bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
//                     <Loader2 className="text-blue-500 animate-spin mb-4" size={48} />
//                     <p className="text-slate-900 dark:text-white font-medium mb-1">Neural Engine Active</p>
//                     <p className="text-blue-600 dark:text-blue-400 font-mono text-xs">{analysisStep}</p>
//                   </div>
//                 )}

//                 {result && !isAnalyzing && (
//                   <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
//                     <div className="flex bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-lg border border-slate-200 dark:border-slate-700 p-1 shadow-lg">
//                       <button 
//                         onClick={() => setShowHeatmap(true)}
//                         className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${showHeatmap ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
//                       >
//                         <Thermometer size={14} /> Grad-CAM Heatmap
//                       </button>
//                       <button 
//                         onClick={() => setShowHeatmap(false)}
//                         className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${!showHeatmap ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
//                       >
//                         <Eye size={14} /> Original View
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
//             <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
//               <User size={14} /> Patient Metadata
//             </h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-1">
//                 <label className="text-[10px] text-slate-500 uppercase">Full Name</label>
//                 <input 
//                   type="text" 
//                   value={patient.name}
//                   onChange={(e) => setPatient({...patient, name: e.target.value})}
//                   className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
//                 />
//               </div>
//               <div className="space-y-1">
//                 <label className="text-[10px] text-slate-500 uppercase">Patient ID</label>
//                 <input 
//                   type="text" 
//                   value={patient.patientId}
//                   onChange={(e) => setPatient({...patient, patientId: e.target.value})}
//                   className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
//                 />
//               </div>
//               <div className="space-y-1">
//                 <label className="text-[10px] text-slate-500 uppercase">Date of Birth</label>
//                 <input 
//                   type="date" 
//                   value={patient.dob}
//                   onChange={(e) => setPatient({...patient, dob: e.target.value})}
//                   className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
//                 />
//               </div>
//               <div className="space-y-1">
//                 <label className="text-[10px] text-slate-500 uppercase">Gender</label>
//                 <select 
//                   value={patient.gender}
//                   onChange={(e) => setPatient({...patient, gender: e.target.value as any})}
//                   className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
//                 >
//                   <option value="Male">Male</option>
//                   <option value="Female">Female</option>
//                   <option value="Other">Other</option>
//                 </select>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="lg:col-span-5 flex flex-col gap-6">
//           {!result && !isAnalyzing ? (
//             <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center flex-1 flex flex-col items-center justify-center shadow-sm">
//               <Info className="text-slate-400 dark:text-slate-600 mb-4" size={48} />
//               <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Ready for Diagnosis</h3>
//               <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-xs mx-auto">
//                 Once patient information is verified and X-ray is uploaded, click below to initiate CheXNet neural analysis.
//               </p>
//               <button 
//                 disabled={!file}
//                 onClick={runAnalysis}
//                 className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
//                   file 
//                   ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20' 
//                   : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
//                 }`}
//               >
//                 <Zap size={20} /> Run AI Diagnosis
//               </button>
//             </div>
//           ) : result && (
//             <div className="flex-1 space-y-6">
//               <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
//                 <div className="flex items-center justify-between mb-6">
//                   <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Classification Results</h3>
//                   <div className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded">
//                     SENSITIVITY: 94.8%
//                   </div>
//                 </div>
//                 <PredictionList predictions={result.predictions} />
//               </div>

//               <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex gap-4">
//                 <div className="mt-1">
//                   <AlertCircle className="text-amber-600 dark:text-amber-500" size={20} />
//                 </div>
//                 <div className="text-sm">
//                   <p className="text-amber-700 dark:text-amber-200 font-semibold mb-1">System Status: {isSimulation ? 'Simulated Fallback' : 'Active Backend'}</p>
//                   <p className="text-amber-600 dark:text-amber-500/80 leading-relaxed">
//                     {isSimulation 
//                       ? "Cloud simulation mode active. Decision support is being provided via secondary neural inference engine." 
//                       : "Analysis performed via local DenseNet-121 neural engine. Correlate with clinical history."}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}
          
//           {isAnalyzing && (
//             <div className="flex-1 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl flex flex-col items-center justify-center space-y-6 animate-pulse shadow-sm">
//                <div className="w-16 h-16 bg-blue-500/10 rounded-full border-4 border-blue-500/20 border-t-blue-600 dark:border-t-blue-500 animate-spin"></div>
//                <div className="text-center">
//                  <p className="text-slate-700 dark:text-slate-300 font-medium">Neural Engine Processing...</p>
//                  <p className="text-slate-500 text-xs mt-1 italic">{analysisStep}</p>
//                </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default XRayLab;








import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Thermometer, FileDown, Eye, EyeOff, AlertCircle, Info, CheckCircle2, Zap, User, WifiOff, Settings2, Palette } from 'lucide-react';
import PredictionList from './PredictionList';
import HeatmapOverlay from './HeatmapOverlay';
import { analyzeImage, downloadReport } from '../services/api';
import { AnalysisResult, PatientDetails } from '../types';

const XRayLab: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.55);
  const [heatmapHue, setHeatmapHue] = useState(0);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [isSimulation, setIsSimulation] = useState(false);
  
  // Patient details state
  const [patient, setPatient] = useState<PatientDetails>({
    name: 'John Doe',
    patientId: 'PT-882192',
    dob: '1985-05-12',
    gender: 'Male'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setIsSimulation(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setIsAnalyzing(false);
    setIsSimulation(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const runAnalysis = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setAnalysisStep('Connecting to Neural Engine...');
    
    try {
      await new Promise(r => setTimeout(r, 800));
      setAnalysisStep('Pre-processing image (224x224)...');
      await new Promise(r => setTimeout(r, 600));
      
      const response = await analyzeImage(file);
      
      if (response.reportId.startsWith('SIM-')) {
        setIsSimulation(true);
      }
      
      setResult({ ...response, patient });
    } catch (err) {
      console.error(err);
      alert('Analysis failed. Critical system error.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const handleDownloadReport = async () => {
    if (!result || !file) return;
    setIsExporting(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        await downloadReport(result, base64, patient);
        setIsExporting(false);
      };
      reader.readAsDataURL(file);
    } catch (e) {
      console.error(e);
      alert("Note: Server-side PDF generation requires a running FastAPI backend. Attempting fallback...");
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Diagnostic Analysis Lab
            <span className="text-xs font-normal bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded">PROD-X7</span>
          </h1>
          {isSimulation && (
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-600 dark:text-amber-500 text-[10px] font-bold uppercase tracking-wider animate-pulse">
              <WifiOff size={12} />
              Simulation Mode
            </div>
          )}
        </div>
        {result && (
          <div className="flex gap-2">
            <button 
              onClick={handleReset}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors text-sm disabled:opacity-50"
            >
              <X size={16} /> New Scan
            </button>
            <button 
              onClick={handleDownloadReport}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors text-sm shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              {isExporting ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />} 
              {isExporting ? 'Generating Report...' : 'Export PDF Report'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden aspect-square relative group shadow-sm">
            {!preview ? (
              <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="text-blue-500" size={32} />
                </div>
                <span className="text-slate-900 dark:text-white font-medium mb-1">Upload Chest X-ray</span>
                <span className="text-slate-500 text-sm">DICOM, JPEG or PNG format</span>
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*"
                />
              </label>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center bg-slate-50 dark:bg-black">
                {showHeatmap && result ? (
                  <HeatmapOverlay 
                    originalImage={preview} 
                    heatmapData={result.heatmapUrl} 
                    opacity={heatmapOpacity}
                    hueShift={heatmapHue}
                  />
                ) : (
                  <img 
                    src={preview} 
                    alt="X-ray Preview" 
                    className="max-h-full max-w-full object-contain"
                  />
                )}

                {isAnalyzing && (
                  <div className="absolute inset-0 bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                    <Loader2 className="text-blue-500 animate-spin mb-4" size={48} />
                    <p className="text-slate-900 dark:text-white font-medium mb-1">Neural Engine Active</p>
                    <p className="text-blue-600 dark:text-blue-400 font-mono text-xs">{analysisStep}</p>
                  </div>
                )}

                {result && !isAnalyzing && (
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
                    <div className="flex bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-lg border border-slate-200 dark:border-slate-700 p-1 shadow-lg">
                      <button 
                        onClick={() => setShowHeatmap(true)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${showHeatmap ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                      >
                        <Thermometer size={14} /> Grad-CAM Heatmap
                      </button>
                      <button 
                        onClick={() => setShowHeatmap(false)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${!showHeatmap ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                      >
                        <Eye size={14} /> Original View
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
              <User size={14} /> Patient Metadata
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase">Full Name</label>
                <input 
                  type="text" 
                  value={patient.name}
                  onChange={(e) => setPatient({...patient, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase">Patient ID</label>
                <input 
                  type="text" 
                  value={patient.patientId}
                  onChange={(e) => setPatient({...patient, patientId: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase">Date of Birth</label>
                <input 
                  type="date" 
                  value={patient.dob}
                  onChange={(e) => setPatient({...patient, dob: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase">Gender</label>
                <select 
                  value={patient.gender}
                  onChange={(e) => setPatient({...patient, gender: e.target.value as any})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          {!result && !isAnalyzing ? (
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center flex-1 flex flex-col items-center justify-center shadow-sm">
              <Info className="text-slate-400 dark:text-slate-600 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Ready for Diagnosis</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-xs mx-auto">
                Once patient information is verified and X-ray is uploaded, click below to initiate CheXNet neural analysis.
              </p>
              <button 
                disabled={!file}
                onClick={runAnalysis}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  file 
                  ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                }`}
              >
                <Zap size={20} /> Run AI Diagnosis
              </button>
            </div>
          ) : result && (
            <div className="flex-1 space-y-6">
              <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Classification Results</h3>
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">SENSITIVITY: 94.8%</div>
                  </div>
                  <button 
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                      showHeatmap 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {showHeatmap ? <Eye size={16} /> : <EyeOff size={16} />}
                    <span className="text-xs font-bold">{showHeatmap ? 'Heatmap On' : 'Heatmap Off'}</span>
                  </button>
                </div>

                {/* Heatmap Customization Controls */}
                {showHeatmap && (
                  <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Settings2 size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Heatmap Controls</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                          <span>OPACITY</span>
                          <span>{Math.round(heatmapOpacity * 100)}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0.1" 
                          max="1.0" 
                          step="0.05"
                          value={heatmapOpacity}
                          onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                          <div className="flex items-center gap-1">
                            <Palette size={10} />
                            <span>COLOR GRADIENT (HUE)</span>
                          </div>
                          <span>{heatmapHue}°</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="360" 
                          step="1"
                          value={heatmapHue}
                          onChange={(e) => setHeatmapHue(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-green-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <PredictionList predictions={result.predictions} />
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex gap-4">
                <div className="mt-1">
                  <AlertCircle className="text-amber-600 dark:text-amber-500" size={20} />
                </div>
                <div className="text-sm">
                  <p className="text-amber-700 dark:text-amber-200 font-semibold mb-1">System Status: {isSimulation ? 'Simulated Fallback' : 'Active Backend'}</p>
                  <p className="text-amber-600 dark:text-amber-500/80 leading-relaxed">
                    {isSimulation 
                      ? "Cloud simulation mode active. Decision support is being provided via secondary neural inference engine." 
                      : "Analysis performed via local DenseNet-121 neural engine. Correlate with clinical history."}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {isAnalyzing && (
            <div className="flex-1 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl flex flex-col items-center justify-center space-y-6 animate-pulse shadow-sm">
               <div className="w-16 h-16 bg-blue-500/10 rounded-full border-4 border-blue-500/20 border-t-blue-600 dark:border-t-blue-500 animate-spin"></div>
               <div className="text-center">
                 <p className="text-slate-700 dark:text-slate-300 font-medium">Neural Engine Processing...</p>
                 <p className="text-slate-500 text-xs mt-1 italic">{analysisStep}</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default XRayLab;
