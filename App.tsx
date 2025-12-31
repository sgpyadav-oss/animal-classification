
import React, { useState, useRef, useCallback } from 'react';
import { performObjectDetection } from './services/geminiService';
import { AppState, Detection } from './types';
import BoundingBoxOverlay from './components/BoundingBoxOverlay';
import { 
  CameraIcon, 
  ArrowUpTrayIcon, 
  TrashIcon, 
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    image: null,
    detections: [],
    isLoading: false,
    error: null,
  });
  
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setState({
          image: base64,
          detections: [],
          isLoading: false,
          error: null,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight, clientWidth, clientHeight } = e.currentTarget;
    setImageSize({ width: clientWidth, height: clientHeight });
  };

  const runDetection = async () => {
    if (!state.image) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const results = await performObjectDetection(state.image);
      setState(prev => ({ 
        ...prev, 
        detections: results, 
        isLoading: false 
      }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: "Failed to detect objects. Please try again or check your API key." 
      }));
    }
  };

  const reset = () => {
    setState({
      image: null,
      detections: [],
      isLoading: false,
      error: null,
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center max-w-7xl mx-auto">
      {/* Header */}
      <header className="w-full flex flex-col md:flex-row justify-between items-center mb-10 space-y-4 md:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-sky-500 rounded-lg shadow-lg shadow-sky-500/30">
            <CameraIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">VisionQuest AI</h1>
            <p className="text-slate-400 text-sm">Professional Computer Vision Workbench</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center px-3 py-1 bg-slate-800 rounded-full border border-slate-700 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
            Model: Gemini 3 Flash
          </div>
        </div>
      </header>

      <main className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Display Area */}
        <div className="lg:col-span-2 space-y-6">
          <div 
            className="glass-effect rounded-2xl p-4 min-h-[500px] flex items-center justify-center relative overflow-hidden group"
            ref={containerRef}
          >
            {!state.image ? (
              <div 
                className="flex flex-col items-center justify-center space-y-4 cursor-pointer w-full h-full border-2 border-dashed border-slate-700 rounded-xl hover:border-sky-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <ArrowUpTrayIcon className="w-12 h-12 text-slate-500 group-hover:text-sky-500 transition-colors" />
                <div className="text-center">
                  <p className="text-slate-300 font-medium">Click or Drag to Upload</p>
                  <p className="text-slate-500 text-xs">JPG, PNG up to 10MB</p>
                </div>
              </div>
            ) : (
              <div className="relative inline-block w-full h-full max-h-[600px]">
                <img 
                  src={state.image} 
                  alt="Target" 
                  className="w-full h-full object-contain rounded-lg shadow-2xl"
                  onLoad={handleImageLoad}
                />
                {state.isLoading && <div className="scan-line"></div>}
                
                {!state.isLoading && state.detections.length > 0 && (
                  <BoundingBoxOverlay 
                    detections={state.detections}
                    containerWidth={imageSize.width}
                    containerHeight={imageSize.height}
                  />
                )}
              </div>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>

          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-3">
              <button
                onClick={runDetection}
                disabled={!state.image || state.isLoading}
                className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:hover:bg-sky-500 text-white font-semibold rounded-lg shadow-lg shadow-sky-500/20 flex items-center transition-all"
              >
                {state.isLoading ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CameraIcon className="w-5 h-5 mr-2" />
                    Analyze Image
                  </>
                )}
              </button>
              <button
                onClick={reset}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg border border-slate-700 flex items-center transition-all"
              >
                <TrashIcon className="w-5 h-5 mr-2 text-slate-400" />
                Clear
              </button>
            </div>

            {state.error && (
              <div className="flex items-center text-rose-400 text-sm">
                <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                {state.error}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar / Stats */}
        <div className="space-y-6">
          <div className="glass-effect rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              Detection Results
              {state.detections.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-sky-500/20 text-sky-400 text-xs rounded-full">
                  {state.detections.length} Items
                </span>
              )}
            </h3>

            {state.detections.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <p className="text-slate-500 text-sm">No objects detected yet.</p>
                <p className="text-slate-600 text-xs">Upload and analyze an image to see results.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {state.detections.sort((a,b) => b.confidence - a.confidence).map((det, i) => (
                  <div 
                    key={i} 
                    className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 flex justify-between items-center group hover:border-sky-500 transition-all cursor-default"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white group-hover:text-sky-400 transition-colors uppercase tracking-wider">
                        {det.label}
                      </p>
                      <p className="text-xs text-slate-500">
                        Class: {det.label.toLowerCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">
                        {Math.round(det.confidence * 100)}%
                      </p>
                      <p className="text-[10px] text-slate-600 font-mono">
                        CONF SCORE
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-700">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Model Specs</h4>
              <ul className="space-y-2">
                <li className="flex justify-between text-xs">
                  <span className="text-slate-400">Model Architecture</span>
                  <span className="text-slate-200">Vision Transformer</span>
                </li>
                <li className="flex justify-between text-xs">
                  <span className="text-slate-400">Inference Device</span>
                  <span className="text-slate-200">Gemini TPU v5</span>
                </li>
                <li className="flex justify-between text-xs">
                  <span className="text-slate-400">Latency</span>
                  <span className="text-slate-200">~1.5s</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="glass-effect rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Export</h3>
            <button 
              disabled={state.detections.length === 0}
              className="w-full py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:hover:bg-slate-700 rounded-lg text-xs font-bold text-white transition-all uppercase"
              onClick={() => {
                const blob = new Blob([JSON.stringify(state.detections, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'detections.json';
                a.click();
              }}
            >
              Export JSON Report
            </button>
          </div>
        </div>
      </main>

      <footer className="mt-12 py-6 text-slate-500 text-xs text-center border-t border-slate-800 w-full max-w-2xl">
        <p>&copy; 2024 VisionQuest AI. Powered by Google Gemini 3 Flash Vision.</p>
        <div className="flex justify-center space-x-4 mt-2">
          <a href="#" className="hover:text-sky-400 transition-colors">Documentation</a>
          <span>&bull;</span>
          <a href="#" className="hover:text-sky-400 transition-colors">API Status</a>
          <span>&bull;</span>
          <a href="#" className="hover:text-sky-400 transition-colors">Privacy</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
