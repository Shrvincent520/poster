import React, { forwardRef } from 'react';
import { PosterData } from '../types';
import { Building2, QrCode } from 'lucide-react';

interface PosterCanvasProps {
  data: PosterData;
}

const PosterCanvas = forwardRef<HTMLDivElement, PosterCanvasProps>(({ data }, ref) => {
  // Common body font style - Set to Medium (500)
  const bodyStyle = {
    fontFamily: '"HarmonyOS Sans SC", "Microsoft YaHei", sans-serif',
    fontWeight: 500,
  };

  // Internal Section Separator Line
  // Color: #1faabf (Matches the section header gradient accent)
  // Width: w-full
  // Height: 0.15cm
  // Margin Top: 1cm
  const SectionLine = () => (
      <div className="w-full h-[0.15cm] bg-[#1faabf] mt-[1cm] rounded-full"></div>
  );

  return (
    <div
      ref={ref}
      className="bg-white overflow-hidden relative origin-top-left"
      style={{
        width: '90cm',
        height: '120cm',
        position: 'relative'
      }}
    >
      {/* Font Declaration */}
      <style dangerouslySetInnerHTML={{__html: `
        @font-face {
          font-family: 'Alimama ShuHeiTi Bold';
          src: local('Alimama ShuHeiTi Bold'), url('./fonts/AlimamaShuHeiTi-Bold.ttf') format('truetype');
          font-weight: bold;
        }
        @font-face {
          font-family: 'HarmonyOS Sans SC';
          /* Optimized to look for specific Medium variant locally first, then generic family, then file */
          src: local('HarmonyOS Sans SC Medium'), local('HarmonyOS Sans SC'), url('./fonts/HarmonyOS_Sans_SC_Medium.ttf') format('truetype');
          font-weight: 500;
          font-style: normal;
        }
        @font-face {
          font-family: 'HarmonyOS Sans SC';
          src: local('HarmonyOS Sans SC Bold'), url('./fonts/HarmonyOS_Sans_SC_Bold.ttf') format('truetype');
          font-weight: bold;
          font-style: normal;
        }
      `}} />

      {/* 
        CRITICAL: Dedicated Background Layer 
        This ensures that even if the gradient fails to render on huge GPU textures,
        the background remains solid white instead of transparent.
      */}
      <div className="absolute inset-0 bg-white z-0"></div>
      
      {/* Background Image or Gradient Layer */}
      {data.backgroundImage ? (
        /* 
           Background Image starts below the header (15cm) and extends to the bottom.
        */
        <div className="absolute top-[15cm] left-0 right-0 bottom-0 z-0">
             <img 
                src={data.backgroundImage} 
                alt="Background" 
                className="w-full h-full object-cover"
             />
        </div>
      ) : (
        <div 
            className="absolute inset-0 z-0"
            style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f0f8ff 40%, #e6f7ff 100%)' }}
        ></div>
      )}

      {/* --- HEADER --- */}
      {data.headerImage ? (
          /* Custom Header: 15cm height */
          <div className="w-full h-[15cm] relative z-10 overflow-hidden">
             <img 
               src={data.headerImage} 
               alt="Header" 
               className="w-full h-full object-cover"
             />
          </div>
      ) : (
          /* Default Header - 15cm Height, No Yellow Strip */
          <div className="w-full h-[15cm] relative bg-[#003366] overflow-hidden flex items-center justify-between px-[3cm] z-10">
                {/* Abstract Background Dots (Simulated) */}
                <div className="absolute top-0 right-0 w-[50cm] h-[50cm] rounded-full border-[20px] border-dotted border-yellow-500/20 translate-x-[10cm] -translate-y-[15cm]"></div>
                <div className="absolute top-0 right-0 w-[40cm] h-[40cm] rounded-full border-[15px] border-dotted border-blue-400/20 translate-x-[5cm] -translate-y-[10cm]"></div>

                {/* Left Logo Area */}
                <div className="flex flex-col items-center z-10">
                <div className="w-[8cm] h-[8cm] bg-white rounded-lg p-6 flex items-center justify-center mb-2">
                        <Building2 className="w-full h-full text-[#003366]" strokeWidth={1.5} />
                </div>
                <span className="text-white font-bold" style={{ fontSize: '20pt' }}>苏州人才</span>
                </div>

                {/* Center Title */}
                <div className="z-10 text-center">
                    <h1 className="font-black text-white italic tracking-tighter" style={{ fontSize: '110pt' }}>
                        <span className="text-orange-500">2025</span> 苏州春季<span className="text-orange-500">招聘大会</span>
                    </h1>
                </div>

                {/* Right QR Codes */}
                <div className="flex gap-[1cm] z-10 bg-white/10 p-[0.5cm] rounded-xl backdrop-blur-sm">
                    <div className="text-center">
                        <div className="w-[5cm] h-[5cm] border-4 border-white bg-white p-2 flex items-center justify-center">
                            <QrCode className="w-full h-full text-slate-800" />
                        </div>
                        <p className="text-white mt-2" style={{ fontSize: '18pt' }}>苏州校园引才平台</p>
                    </div>
                    <div className="text-center">
                        <div className="w-[5cm] h-[5cm] border-4 border-white bg-white p-2 flex items-center justify-center">
                            <QrCode className="w-full h-full text-slate-800" />
                        </div>
                        <p className="text-white mt-2" style={{ fontSize: '18pt' }}>岗位详情</p>
                    </div>
                </div>
            </div>
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <div className="px-[5cm] pt-[7cm] flex flex-col relative z-10">
        
        {/* Company Title */}
        <div className="text-center relative pb-[1cm] mb-[3.3cm]">
            {/* UPDATED: Color changed to #023e8f */}
            <h2 className="font-bold text-[#023e8f]" style={{ fontSize: '90pt', fontFamily: '"Alimama ShuHeiTi Bold", "Microsoft YaHei", "Heiti SC", sans-serif' }}>
                {data.companyName}
            </h2>
            
            {/* UPDATED: Custom Underline with SVG Decoration */}
            <div className="w-full mt-[1.65cm] flex items-end">
                {/* Main blue line - slightly thinner to match style */}
                <div className="flex-grow h-[0.15cm] bg-[#023e8f]"></div>
                
                {/* Right-side geometric decoration (Trapezoid) */}
                {/* Height 0.5cm is chosen to be visibly thicker than the line, proportional to the poster size */}
                <svg 
                    viewBox="0 0 35.42 2.89" 
                    className="h-[0.5cm] w-[6.12cm] flex-shrink-0"
                    preserveAspectRatio="none"
                >
                    <polygon fill="#0c3765" points="35.42 2.89 0 2.89 1.29 0 35.42 0 35.42 2.89"/>
                </svg>
            </div>
        </div>

        {/* SECTION: Intro */}
        <div className="mb-[3.3cm]">
            <SectionHeader title="单位简介" />
            <SectionLine />
            {/* Text color already #023e8f */}
            <div className="mt-[2.7cm] leading-relaxed text-justify text-[#023e8f]" 
                 style={{ 
                     fontSize: '55pt', 
                     lineHeight: '1.6', 
                     textIndent: '2em',
                     ...bodyStyle
                 }}>
                {data.introduction}
            </div>
        </div>

        {/* SECTION: Jobs */}
        <div className="mb-[3.3cm]">
            <SectionHeader title="需求信息" />
            <SectionLine />
            <div className="mt-[2.7cm] border-[0.1cm] border-[#228ccd] rounded-xl overflow-hidden bg-transparent">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#cfe2f3]">
                            {/* Text color already #023e8f */}
                            <th className="py-[1cm] border-b-[0.1cm] border-r-[0.1cm] border-[#228ccd] text-[#023e8f] w-[30%]" style={{ fontSize: '55pt', ...bodyStyle, fontWeight: 'bold' }}>职位名称</th>
                            <th className="py-[1cm] border-b-[0.1cm] border-r-[0.1cm] border-[#228ccd] text-[#023e8f] w-[45%]" style={{ fontSize: '55pt', ...bodyStyle, fontWeight: 'bold' }}>专业类别</th>
                            <th className="py-[1cm] border-b-[0.1cm] border-[#228ccd] text-[#023e8f] w-[25%]" style={{ fontSize: '55pt', ...bodyStyle, fontWeight: 'bold' }}>学历要求</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.jobs.map((job, idx) => (
                            <tr key={job.id}>
                                {/* Text color already #023e8f */}
                                <td className="py-[1.6cm] px-[1cm] border-b-[0.1cm] border-r-[0.1cm] border-[#228ccd] text-center text-[#023e8f] whitespace-pre-line" style={{ fontSize: '55pt', ...bodyStyle }}>
                                    {job.name}
                                </td>
                                <td className="py-[1.6cm] px-[1cm] border-b-[0.1cm] border-r-[0.1cm] border-[#228ccd] text-center text-[#023e8f] whitespace-pre-line" style={{ fontSize: '55pt', ...bodyStyle }}>
                                    {job.category}
                                </td>
                                <td className="py-[1.6cm] px-[1cm] border-b-[0.1cm] border-[#228ccd] text-center text-[#023e8f] whitespace-pre-line" style={{ fontSize: '55pt', ...bodyStyle }}>
                                    {job.education}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* SECTION: Contact */}
        <div className="mb-[5cm]">
             <SectionHeader title="联系方式" />
             <SectionLine />
             <div className="mt-[2.7cm] pl-[1cm] flex flex-col gap-[0.5cm]">
                <div className="flex items-center gap-[1cm]">
                    {/* Text color already #023e8f */}
                    <span className="text-[#023e8f]" style={{ fontSize: '55pt', ...bodyStyle }}>单位地址：</span>
                    <span className="text-[#023e8f]" style={{ fontSize: '55pt', ...bodyStyle }}>{data.address}</span>
                </div>
                <div className="flex items-center gap-[1cm]">
                    {/* Text color already #023e8f */}
                    <span className="text-[#023e8f]" style={{ fontSize: '55pt', ...bodyStyle }}>应聘邮箱：</span>
                    <span className="text-[#023e8f]" style={{ fontSize: '55pt', ...bodyStyle }}>{data.email}</span>
                </div>
             </div>
        </div>

      </div>
    </div>
  );
});

// Helper for the section headers with the SVG gradient
const SectionHeader = ({ title }: { title: string }) => (
    <div className="relative w-[20cm] h-[3.5cm] flex items-center justify-center">
        {/* Gradient Background mapped from SVG */}
        <div className="absolute inset-0"
             style={{ 
                 background: 'linear-gradient(90deg, rgba(34,140,205,0) 0%, rgba(34,140,205,1) 20%, rgba(31,170,191,1) 80%, rgba(31,170,191,0) 100%)' 
             }}>
        </div>
        
        {/* Text Layer */}
        <div className="relative z-10 text-white font-bold tracking-widest"
             style={{ fontSize: '65pt', fontFamily: '"HarmonyOS Sans SC", "Microsoft YaHei", sans-serif', fontWeight: 'bold' }}>
            {title}
        </div>
    </div>
);

export default PosterCanvas;