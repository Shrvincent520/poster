import React, { useRef } from 'react';
import { PosterData } from '../types';
import { Trash2, Plus, Building2, FileText, Mail, Image as ImageIcon, Upload } from 'lucide-react';

interface EditorProps {
  data: PosterData;
  onChange: (newData: PosterData) => void;
}

const Editor: React.FC<EditorProps> = ({ data, onChange }) => {
  const headerInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof PosterData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleJobChange = (index: number, field: string, value: string) => {
    const newJobs = [...data.jobs];
    // @ts-ignore
    newJobs[index][field] = value;
    onChange({ ...data, jobs: newJobs });
  };

  const addJob = () => {
    onChange({
      ...data,
      jobs: [
        ...data.jobs,
        { id: Math.random().toString(), name: '新职位', category: '类别', education: '本科' }
      ]
    });
  };

  const removeJob = (index: number) => {
    const newJobs = data.jobs.filter((_, i) => i !== index);
    onChange({ ...data, jobs: newJobs });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'headerImage' | 'backgroundImage') => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
              if (event.target?.result) {
                  onChange({ ...data, [field]: event.target.result as string });
              }
          };
          reader.readAsDataURL(file);
      }
      // Reset input value so same file can be selected again if needed
      if (e.target) e.target.value = '';
  };

  const clearImage = (field: 'headerImage' | 'backgroundImage') => {
      onChange({ ...data, [field]: undefined });
  };

  return (
    <div className="space-y-6 p-4">
      
      {/* --- Image Settings --- */}
      <div className="space-y-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <ImageIcon size={16} /> 图片设置
          </label>
          
          {/* Header Image */}
          <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                 <span className="text-xs text-gray-600">页眉图片</span>
                 {data.headerImage && (
                     <button onClick={() => clearImage('headerImage')} className="text-[10px] text-red-500 hover:text-red-700 underline">
                         恢复默认
                     </button>
                 )}
              </div>
              <div 
                onClick={() => headerInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-gray-300 rounded-md p-2 bg-white hover:bg-gray-50 text-center transition-colors flex items-center justify-center gap-2"
              >
                  {data.headerImage ? (
                      <div className="flex items-center gap-2 text-green-600">
                          <ImageIcon size={14} />
                          <span className="text-xs truncate max-w-[150px]">已上传自定义页眉</span>
                      </div>
                  ) : (
                      <div className="flex items-center gap-2 text-gray-400">
                          <Upload size={14} />
                          <span className="text-xs">点击上传页眉图片</span>
                      </div>
                  )}
                  <input 
                    ref={headerInputRef}
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleImageUpload(e, 'headerImage')}
                  />
              </div>
          </div>

          {/* Background Image */}
          <div className="flex flex-col gap-2 mt-2">
              <div className="flex justify-between items-center">
                 <span className="text-xs text-gray-600">背景图片 (全屏)</span>
                 {data.backgroundImage && (
                     <button onClick={() => clearImage('backgroundImage')} className="text-[10px] text-red-500 hover:text-red-700 underline">
                         恢复默认
                     </button>
                 )}
              </div>
              <div 
                onClick={() => backgroundInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-gray-300 rounded-md p-2 bg-white hover:bg-gray-50 text-center transition-colors flex items-center justify-center gap-2"
              >
                  {data.backgroundImage ? (
                      <div className="flex items-center gap-2 text-green-600">
                          <ImageIcon size={14} />
                          <span className="text-xs truncate max-w-[150px]">已上传自定义背景</span>
                      </div>
                  ) : (
                      <div className="flex items-center gap-2 text-gray-400">
                          <Upload size={14} />
                          <span className="text-xs">点击上传背景图片</span>
                      </div>
                  )}
                  <input 
                    ref={backgroundInputRef}
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleImageUpload(e, 'backgroundImage')}
                  />
              </div>
          </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Building2 size={16} /> 公司名称
        </label>
        <input
          type="text"
          value={data.companyName}
          onChange={(e) => handleChange('companyName', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <FileText size={16} /> 单位简介
        </label>
        <textarea
          value={data.introduction}
          onChange={(e) => handleChange('introduction', e.target.value)}
          rows={6}
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black custom-scrollbar text-sm"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
             <label className="text-sm font-semibold text-gray-700">需求信息 (Jobs)</label>
             <button onClick={addJob} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 flex items-center gap-1">
                 <Plus size={14} /> 添加
             </button>
        </div>
        <div className="space-y-3">
            {data.jobs.map((job, idx) => (
                <div key={job.id} className="p-3 bg-gray-50 rounded border border-gray-200 relative group">
                    <button onClick={() => removeJob(idx)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-1 gap-2">
                        <textarea
                            placeholder="职位名称 (支持换行)"
                            value={job.name}
                            onChange={(e) => handleJobChange(idx, 'name', e.target.value)}
                            className="p-1 text-sm border rounded bg-white text-black resize-y min-h-[2.5rem] custom-scrollbar"
                            rows={2}
                        />
                        <textarea
                            placeholder="专业类别 (支持换行)"
                            value={job.category}
                            onChange={(e) => handleJobChange(idx, 'category', e.target.value)}
                            className="p-1 text-sm border rounded bg-white text-black resize-y min-h-[2.5rem] custom-scrollbar"
                            rows={2}
                        />
                         <input
                            placeholder="学历"
                            value={job.education}
                            onChange={(e) => handleJobChange(idx, 'education', e.target.value)}
                            className="p-1 text-sm border rounded bg-white text-black"
                        />
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Mail size={16} /> 联系方式
        </label>
        <input
          placeholder="地址"
          type="text"
          value={data.address}
          onChange={(e) => handleChange('address', e.target.value)}
          className="w-full p-2 mb-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 bg-white text-black text-sm"
        />
        <input
          placeholder="邮箱"
          type="text"
          value={data.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 bg-white text-black text-sm"
        />
      </div>
    </div>
  );
};

export default Editor;