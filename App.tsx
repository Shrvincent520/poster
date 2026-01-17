import React, { useState, useRef, useEffect } from 'react';
import { toBlob } from 'html-to-image';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import { Download, Printer, Layers, Loader2, Users, Plus, FileSpreadsheet, Upload, FileUp, AlertTriangle, FileArchive, Edit3 } from 'lucide-react';
import PosterCanvas from './components/PosterCanvas';
import Editor from './components/Editor';
import { INITIAL_DATA, PosterData, JobPosition } from './types';

function App() {
  const posterRef = useRef<HTMLDivElement>(null);
  // Separate ref for the hidden export element
  const hiddenPosterRef = useRef<HTMLDivElement>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Global Image State - These settings apply to ALL companies
  const [globalImages, setGlobalImages] = useState<{headerImage?: string, backgroundImage?: string}>({});

  const [data, setData] = useState<PosterData>(INITIAL_DATA);
  const [companyList, setCompanyList] = useState<PosterData[]>([INITIAL_DATA]);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_DATA.id);
  const [isExporting, setIsExporting] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{current: number, total: number, name: string} | null>(null);
  const [scale, setScale] = useState(0.15); // Scale for on-screen preview

  // Handle switching between companies & syncing global images
  useEffect(() => {
    const selected = companyList.find(c => c.id === selectedId);
    if (selected) {
        // Always merge the selected company data with the global image settings
        setData({
            ...selected,
            ...globalImages
        });
    }
  }, [selectedId, companyList, globalImages]);

  const handleDataChange = (newData: PosterData) => {
    // 1. Check for image changes and update global state
    // If the new data has different images than our global state, update the global state.
    if (newData.headerImage !== globalImages.headerImage || newData.backgroundImage !== globalImages.backgroundImage) {
        setGlobalImages({
            headerImage: newData.headerImage,
            backgroundImage: newData.backgroundImage
        });
    }

    // 2. Update local data state immediately for UI responsiveness
    setData(newData);
    
    // 3. Update Company List (Text Content)
    // We update the list with newData. Note that newData includes the images, 
    // but when we read back from the list in the useEffect above, we overwrite/merge 
    // with the latest globalImages anyway, so it stays consistent.
    setCompanyList(prev => prev.map(c => c.id === newData.id ? newData : c));
  };

  const handleAddCompany = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    // Inherit properties from current data but reset specific fields
    // The new company will visually inherit the global images via the useEffect merge
    const newCompany = { 
        ...data, 
        id: newId, 
        companyName: `新公司 ${companyList.length + 1}`,
        jobs: [] 
    };
    setCompanyList([...companyList, newCompany]);
    setSelectedId(newId);
  };

  /**
   * Generates and downloads an Excel template
   */
  const handleDownloadTemplate = () => {
    const headers = [
      "企业名称", 
      "单位简介", 
      "单位地址", 
      "应聘邮箱", 
      "职位名称", 
      "专业类别", 
      "学历要求"
    ];
    
    // Sample rows showing both "filled" and "empty" styles
    const rows = [
      [
        "示例科技有限公司", 
        "这里填写公司简介...（首行填写完整信息）", 
        "苏州工业园区XX路", 
        "hr@example.com", 
        "高级工程师", 
        "计算机类", 
        "本科"
      ],
      [
        "", "", "", "", // Empty company info implies continuation of the company above
        "人事专员", 
        "管理类", 
        "本科"
      ],
      [
        "示例科技有限公司", // Duplicate name is also supported (Merging logic)
        "这里填写公司简介...（重复填写也可以自动合并）", 
        "苏州工业园区XX路", 
        "hr@example.com", 
        "销售经理", 
        "市场营销", 
        "大专"
      ],
      [
        "第二家公司示例", 
        "这是第二家公司的简介", 
        "独墅湖大道1号", 
        "contact@company2.com", 
        "财务主管", 
        "会计学", 
        "本科"
      ]
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    // Set column widths for better UX
    ws['!cols'] = [
        { wch: 25 }, // Name
        { wch: 40 }, // Intro
        { wch: 20 }, // Address
        { wch: 20 }, // Email
        { wch: 20 }, // Job Name
        { wch: 15 }, // Category
        { wch: 10 }  // Edu
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "导入模板");
    XLSX.writeFile(wb, "批量导入模板.xlsx");
  };

  /**
   * Handle Excel Import
   */
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
        const bstr = evt.target?.result;
        if (!bstr) return;
        
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        // Read as array of arrays to handle the structure manually
        const jsonData = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });

        // Remove header row
        const rows = jsonData.slice(1);
        
        const newCompanies: PosterData[] = [];
        let currentCompany: PosterData | null = null;

        rows.forEach((row, index) => {
            // Column Mapping (Chinese Headers):
            // 0: 企业名称
            // 1: 单位简介
            // 2: 单位地址
            // 3: 应聘邮箱
            // 4: 职位名称
            // 5: 专业类别
            // 6: 学历要求

            const rowCompanyName = row[0] ? String(row[0]).trim() : "";
            
            // Logic to determine if we start a NEW company or continue the OLD one:
            // 1. If rowCompanyName exists AND it is different from currentCompany's name -> New Company
            // 2. If rowCompanyName exists AND it is SAME as currentCompany's name -> Continue (Merge)
            // 3. If rowCompanyName is empty -> Continue (Merge)
            
            let isNewCompany = false;

            if (rowCompanyName) {
                if (!currentCompany || rowCompanyName !== currentCompany.companyName) {
                    isNewCompany = true;
                }
            } else {
                // If name is empty, we must have a previous company to attach to.
                // If no previous company exists (e.g. first row is empty), we skip or handle error.
                if (!currentCompany) return; 
                isNewCompany = false;
            }

            if (isNewCompany) {
                currentCompany = {
                    id: Math.random().toString(36).substr(2, 9),
                    companyName: rowCompanyName,
                    introduction: row[1] || "",
                    address: row[2] || "",
                    email: row[3] || "",
                    jobs: []
                    // Note: We don't set images here. They will come from globalImages.
                };
                newCompanies.push(currentCompany);
            }

            // Add Job if job name exists (Column 4)
            if (currentCompany && row[4]) {
                currentCompany.jobs.push({
                    id: Math.random().toString(36).substr(2, 9),
                    name: String(row[4]),
                    category: row[5] ? String(row[5]) : "",
                    education: row[6] ? String(row[6]) : ""
                });
            }
        });

        if (newCompanies.length > 0) {
            setCompanyList(newCompanies);
            setSelectedId(newCompanies[0].id);
            alert(`成功导入 ${newCompanies.length} 家公司数据！\n程序已自动合并同名公司的职位信息。`);
        } else {
            alert("未发现有效数据，请确保使用正确的模板格式。");
        }
        
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };


  /**
   * Single Image Export
   */
  const downloadImage = async (dpi: number, asZip: boolean = false) => {
    // USE HIDDEN REF for export. This avoids flickering and scaling issues.
    if (!hiddenPosterRef.current) return;
    setIsExporting(true);
    
    // Ensure fonts are loaded before capture
    await document.fonts.ready;
    // Give UI a moment to update state before heavy processing
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      const pixelRatio = dpi / 96;
      
      const blob = await toBlob(hiddenPosterRef.current, {
        quality: 0.95,
        pixelRatio: pixelRatio,
        backgroundColor: '#ffffff', // Force white background
        cacheBust: true,
        // Since we are capturing the hidden, un-transformed element, we don't need to reset transforms
        // We just ensure it's captured at its natural size * pixelRatio
        style: {
             boxShadow: 'none', // Remove shadow for print
             transform: 'none', // Ensure no transform is applied to the export node
        }
      });

      if (!blob) {
          throw new Error("生成的图片数据为空");
      }

      if (asZip) {
        // Zip Download Mode (Requested for 300 DPI)
        const zip = new JSZip();
        zip.file(`${data.companyName}-${dpi}dpi.png`, blob);
        const content = await zip.generateAsync({type:"blob"});
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.download = `${data.companyName}-${dpi}dpi.zip`;
        link.href = url;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      } else {
        // Direct Image Download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${data.companyName}-${dpi}dpi.png`;
        link.href = url;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      }

    } catch (err: any) {
      console.error('Export failed', err);
      const errorMessage = err?.message || err?.toString() || 'Unknown error';
      if (dpi > 200) {
         alert(`导出失败: ${errorMessage}。\n\n提示：300DPI 生成的图片像素极高（>1.5亿），可能超出当前浏览器的内存或显存限制。\n建议尝试 150 DPI。`);
      } else {
        alert(`导出失败: ${errorMessage}`);
      }
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Batch Process & Zip
   */
  const handleBatchExport = async () => {
      if (companyList.length === 0) {
          alert("公司列表为空，请先添加公司或导入数据。");
          return;
      }
      
      // Safety check for ref
      if (!hiddenPosterRef.current) {
          alert("系统未就绪（渲染节点未找到），请刷新页面后重试。");
          return;
      }

      const confirmMsg = `确定要批量导出 ${companyList.length} 张海报吗？\n\n当前设置：300 DPI (印刷级高清)。\n此模式下生成的图片文件极大，处理时间可能较长，请确保电脑性能充足并耐心等待。`;

      if (!confirm(confirmMsg)) return;

      // START LOADING
      setIsExporting(true);
      const zip = new JSZip();
      // UPDATED: Use 300 DPI for batch as requested
      const dpi = 300; 
      const pixelRatio = dpi / 96;

      try {
        await document.fonts.ready;
        
        for (let i = 0; i < companyList.length; i++) {
            const company = companyList[i];
            
            // 1. Update state to show this company
            setBatchProgress({ current: i + 1, total: companyList.length, name: company.companyName });
            setSelectedId(company.id);
            
            // IMPORTANT: Manually merge global images for batch processing rendering
            // This ensures the hidden canvas renders with the correct images immediately
            const companyWithImages = { ...company, ...globalImages };
            setData(companyWithImages); 

            // 2. Wait for React to render the DOM updates
            // Reduced slightly to 500ms to speed up, but kept safe enough for render
            await new Promise(resolve => setTimeout(resolve, 500)); 

            // 3. Capture using HIDDEN REF
            const blob = await toBlob(hiddenPosterRef.current, {
                quality: 0.95, 
                pixelRatio: pixelRatio, 
                backgroundColor: '#ffffff', 
                cacheBust: true,
                style: {
                    boxShadow: 'none',
                    transform: 'none',
                }
            });
            
            if (blob) {
                // 4. Add to Zip
                const fileName = `${i+1}_${company.companyName.replace(/[\/\\?%*:|"<>]/g, '-')}.png`;
                zip.file(fileName, blob);
            }
        }

        // 5. Generate Zip
        setBatchProgress({ current: companyList.length, total: companyList.length, name: "正在打包压缩..." });
        const content = await zip.generateAsync({type:"blob"});
        
        // 6. Download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `批量导出300DPI_${new Date().toISOString().slice(0,10)}.zip`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 10000);

      } catch (e: any) {
          console.error(e);
          const errorMessage = e?.message || e?.toString();
          alert(`批量处理过程中出错: ${errorMessage}`);
      } finally {
          setBatchProgress(null);
          setIsExporting(false);
      }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col h-screen overflow-hidden relative">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
      `}</style>

      {/* 
        HIDDEN POSTER FOR EXPORT 
        Positioned fixed at 0,0 but with 0 opacity and negative z-index.
        This ensures it is rendered by the browser (fixing "transparent" issues with display:none or off-screen)
        but not visible to the user.
        We avoid `left: -10000px` as some browser optimizations might skip rendering it fully.
      */}
      <div style={{ position: 'fixed', left: 0, top: 0, zIndex: -100, opacity: 0, pointerEvents: 'none' }}>
          <PosterCanvas data={data} ref={hiddenPosterRef} />
      </div>

      {/* Batch Processing Overlay */}
      {batchProgress && (
          <div className="absolute inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center text-white">
              <Loader2 className="animate-spin mb-4" size={48} />
              <h2 className="text-2xl font-bold mb-2">正在批量生成海报 (300 DPI)...</h2>
              <p className="text-lg text-gray-300 mb-4">{batchProgress.name}</p>
              <div className="w-96 h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                  ></div>
              </div>
              <p className="mt-2 text-sm">{batchProgress.current} / {batchProgress.total}</p>
          </div>
      )}

      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 z-50 shadow-sm shrink-0">
        <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
                <Printer className="text-white" size={24} />
            </div>
            <div>
                <h1 className="text-xl font-bold text-gray-800">PrintMaster Pro</h1>
                <p className="text-xs text-gray-500">90x120cm Poster Generator</p>
            </div>
        </div>
        
        <div className="flex items-center gap-2">
             {/* Import Tools */}
             <div className="flex items-center mr-4 border-r border-gray-200 pr-4 gap-2">
                <input 
                    type="file" 
                    ref={fileInputRef}
                    accept=".xlsx, .xls"
                    className="hidden" 
                    onChange={handleImportExcel}
                />
                <button 
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-all"
                    title="下载 Excel 模板"
                >
                    <FileSpreadsheet size={14} className="text-green-600"/>
                    <span>下载模板</span>
                </button>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-all"
                    title="导入 Excel 数据"
                >
                    <FileUp size={14} className="text-orange-600"/>
                    <span>导入Excel</span>
                </button>
             </div>

             <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full mr-2 hidden xl:inline-block">
                Size: 90x120cm
             </span>
             
             {/* BATCH EXPORT BUTTON - NEW POSITION */}
             <button 
                onClick={handleBatchExport}
                disabled={companyList.length === 0 || isExporting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50 text-xs font-bold mr-2"
                title="批量导出所有公司海报 (300 DPI)"
             >
                {isExporting && batchProgress ? <Loader2 className="animate-spin" size={14}/> : <Layers size={14} />}
                批量导出 ({companyList.length})
             </button>

             <button 
                onClick={() => downloadImage(72, false)}
                disabled={isExporting}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-xs font-medium transition-colors"
             >
                预览 (72 DPI)
             </button>
             
             <button 
                onClick={() => downloadImage(150, false)}
                disabled={isExporting}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-md shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50 text-xs"
             >
                {isExporting ? <Loader2 className="animate-spin" size={14}/> : <Download size={14} />}
                单张高清 (150)
             </button>

             <button 
                onClick={() => downloadImage(300, true)} 
                disabled={isExporting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50 text-xs"
                title="生成超高清图片并以ZIP压缩包格式下载"
             >
                {isExporting ? <Loader2 className="animate-spin" size={14}/> : <FileArchive size={14} />}
                单张印刷 (300)
             </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        
        {/* Column 1: Company List */}
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col z-20 shadow-sm shrink-0">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
                    <Users size={16}/> 公司列表
                </h2>
                <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full border">{companyList.length}</span>
                    <button onClick={handleAddCompany} className="p-1 hover:bg-white rounded border border-transparent hover:border-gray-300 text-blue-600 transition-all shadow-sm">
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50/30 custom-scrollbar">
                {companyList.map((c, idx) => (
                    <div 
                        key={c.id} 
                        onClick={() => setSelectedId(c.id)}
                        className={`p-3 cursor-pointer text-sm border-l-4 transition-all flex justify-between items-center border-b border-gray-100 ${selectedId === c.id ? 'bg-blue-50 border-l-blue-500 text-blue-700 font-medium' : 'border-l-transparent hover:bg-gray-50 text-gray-600'}`}
                    >
                        <span className="truncate w-full">{idx + 1}. {c.companyName}</span>
                    </div>
                ))}
            </div>
        </aside>

        {/* Column 2: Editor Form */}
        <aside className="w-96 bg-white border-r border-gray-200 flex flex-col z-10 shadow-lg shrink-0">
             <div className="p-3 border-b border-gray-100 flex items-center bg-gray-50">
                <h2 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
                    <Edit3 size={16}/> 编辑内容
                </h2>
            </div>
            <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
                <Editor data={data} onChange={handleDataChange} />
            </div>
        </aside>

        {/* Column 3: Preview Canvas */}
        <section className="flex-1 bg-gray-200/80 relative overflow-hidden flex flex-col">
            {/* Toolbar for zoom - Vertical Bottom Left */}
            <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur shadow-xl border border-gray-200 rounded-full py-3 px-2 z-30 flex flex-col items-center gap-2 transition-all hover:bg-white">
                <span className="text-[10px] font-bold text-gray-600">{(scale * 100).toFixed(0)}%</span>
                
                {/* Vertical Slider Wrapper */}
                <div className="h-20 w-4 flex items-center justify-center">
                     <input 
                        type="range" 
                        min="0.05" 
                        max="0.5" 
                        step="0.01" 
                        value={scale} 
                        onChange={(e) => setScale(parseFloat(e.target.value))}
                        className="w-20 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer -rotate-90 accent-blue-600 shadow-inner"
                    />
                </div>
                
                <span className="text-[10px] text-gray-400 scale-75 origin-top">缩放</span>
            </div>

            {/* The Scrollable Area with Centering Logic */}
            <div className="flex-1 overflow-auto grid place-items-center p-10 custom-scrollbar">
                 {/* Wrapper calculates the physical space of the scaled poster */}
                 <div 
                    style={{ 
                        width: `calc(90cm * ${scale})`,
                        height: `calc(120cm * ${scale})`,
                        position: 'relative',
                        // REMOVED SHADOW HERE
                        background: 'white'
                    }}
                 >
                     {/* The canvas is scaled from top-left to fit into the wrapper */}
                     <div 
                        style={{ 
                            transform: `scale(${scale})`,
                            transformOrigin: 'top left',
                            width: '90cm',
                            height: '120cm',
                        }}
                     >
                        <PosterCanvas data={data} ref={posterRef} />
                     </div>
                 </div>
            </div>
        </section>

      </main>
    </div>
  );
}

export default App;